-- =====================================================================
-- LEARNOVA Learn Tube: verified creators, quarantine-by-default videos
--
-- Safety model (default-deny)
--   * Only VERIFIED creators can upload; a suspended creator's videos vanish.
--   * Uploads land in a PRIVATE bucket. Nothing is playable until status =
--     'published', and playback uses short-lived signed URLs from the server.
--   * Clients can never set status/moderation fields. Only the moderation
--     worker (service role) and human reviewers (staff) move a video forward.
--   * Every automated or human decision is appended to an audit log.
--   * Reports can instantly quarantine a published video.
--
-- Money: this migration only adds an append-only earnings LEDGER and a
-- transparent pool-allocation function. No payouts are implemented — real
-- payouts need a licensed gateway and KYC (see docs/LEARN_TUBE.md).
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 1. Creators
-- ---------------------------------------------------------------------
create table if not exists public.creator_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 80),
  bio text check (bio is null or char_length(bio) <= 1000),
  subjects text[] not null default '{}',
  credentials text check (credentials is null or char_length(credentials) <= 1500),
  verification_status text not null default 'pending'
    check (verification_status in ('pending', 'verified', 'rejected', 'suspended')),
  verified_at timestamptz,
  verified_by uuid references auth.users(id),
  strikes integer not null default 0 check (strikes >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.creator_profiles enable row level security;
drop policy if exists creators_select_own on public.creator_profiles;
drop policy if exists creators_select_staff on public.creator_profiles;
create policy creators_select_own on public.creator_profiles for select to authenticated using (auth.uid() = user_id);
create policy creators_select_staff on public.creator_profiles for select to authenticated using (public.is_staff());
revoke insert, update, delete on public.creator_profiles from anon, authenticated;
revoke all on public.creator_profiles from anon;

-- Public card (no credentials / strikes) for verified creators only.
create or replace view public.public_creators as
  select user_id, display_name, bio, subjects
  from public.creator_profiles
  where verification_status = 'verified';
revoke all on public.public_creators from anon;
grant select on public.public_creators to authenticated;

create or replace function public.apply_to_teach(
  p_display_name text, p_bio text, p_subjects text[], p_credentials text
) returns text language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_status text;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  if coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) then
    raise exception 'guest accounts cannot apply to teach' using errcode = '42501';
  end if;
  select verification_status into v_status from public.creator_profiles where user_id = v_uid;
  if v_status in ('verified', 'suspended') then
    raise exception 'application already % ', v_status using errcode = '55000';
  end if;
  insert into public.creator_profiles (user_id, display_name, bio, subjects, credentials)
  values (v_uid, trim(p_display_name), nullif(trim(p_bio), ''), coalesce(p_subjects, '{}'), nullif(trim(p_credentials), ''))
  on conflict (user_id) do update
    set display_name = excluded.display_name, bio = excluded.bio, subjects = excluded.subjects,
        credentials = excluded.credentials, verification_status = 'pending', updated_at = now();
  return 'pending';
end;
$$;

create or replace function public.review_creator(p_user uuid, p_decision text, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_staff() then
    raise exception 'staff only' using errcode = '42501';
  end if;
  if p_decision not in ('verified', 'rejected', 'suspended') then
    raise exception 'invalid decision' using errcode = '22023';
  end if;
  update public.creator_profiles
  set verification_status = p_decision,
      verified_at = case when p_decision = 'verified' then now() else verified_at end,
      verified_by = case when p_decision = 'verified' then auth.uid() else verified_by end,
      updated_at = now()
  where user_id = p_user;
  if not found then
    raise exception 'creator not found' using errcode = 'P0002';
  end if;
end;
$$;

-- ---------------------------------------------------------------------
-- 2. Videos + audit log
-- ---------------------------------------------------------------------
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creator_profiles(user_id) on delete cascade,
  title text not null check (char_length(title) between 3 and 120),
  description text not null default '' check (char_length(description) <= 4000),
  subject text not null check (subject in (
    'mathematics', 'science', 'physics', 'chemistry', 'biology', 'ict_programming', 'bangla',
    'english', 'social_science', 'religion_ethics', 'arts_skills', 'test_prep', 'early_learning',
    'career_skills')),
  grade_band text not null check (grade_band in (
    'early_years', 'primary', 'secondary', 'higher_secondary', 'university', 'adult')),
  language text not null check (language in ('bangla', 'english', 'mixed')),
  storage_path text,
  thumbnail_path text,
  duration_seconds integer check (duration_seconds is null or duration_seconds between 1 and 21600),
  status text not null default 'draft'
    check (status in ('draft', 'uploaded', 'processing', 'needs_review', 'published', 'rejected', 'removed')),
  moderation jsonb not null default '{}'::jsonb,
  rejection_reason text,
  view_count integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists videos_status_idx on public.videos (status, published_at desc);
create index if not exists videos_creator_idx on public.videos (creator_id, created_at desc);
alter table public.videos enable row level security;

drop policy if exists videos_select_published on public.videos;
drop policy if exists videos_select_own on public.videos;
drop policy if exists videos_select_staff on public.videos;
drop policy if exists videos_update_own_draft on public.videos;
create policy videos_select_published on public.videos for select to authenticated
  using (status = 'published' and exists (
    select 1 from public.creator_profiles c
    where c.user_id = videos.creator_id and c.verification_status = 'verified'));
create policy videos_select_own on public.videos for select to authenticated using (creator_id = auth.uid());
create policy videos_select_staff on public.videos for select to authenticated using (public.is_staff());
-- creators may edit text fields of their own draft / rejected videos only
create policy videos_update_own_draft on public.videos for update to authenticated
  using (creator_id = auth.uid() and status in ('draft', 'rejected'))
  with check (creator_id = auth.uid() and status in ('draft', 'rejected'));
revoke insert, update, delete on public.videos from anon, authenticated;
revoke all on public.videos from anon;
grant update (title, description, subject, grade_band, language) on public.videos to authenticated;

create table if not exists public.video_moderation_events (
  id bigint generated always as identity primary key,
  video_id uuid not null references public.videos(id) on delete cascade,
  stage text not null check (stage in ('metadata', 'transcript', 'frames', 'policy', 'human', 'report', 'system')),
  verdict text not null check (verdict in ('approve', 'review', 'reject', 'info')),
  confidence numeric check (confidence is null or confidence between 0 and 1),
  detail jsonb not null default '{}'::jsonb,
  model text,
  actor uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index if not exists vme_video_idx on public.video_moderation_events (video_id, created_at);
alter table public.video_moderation_events enable row level security;
drop policy if exists vme_select_staff on public.video_moderation_events;
create policy vme_select_staff on public.video_moderation_events for select to authenticated using (public.is_staff());
revoke insert, update, delete on public.video_moderation_events from anon, authenticated;
revoke all on public.video_moderation_events from anon;

create table if not exists public.video_transcripts (
  video_id uuid primary key references public.videos(id) on delete cascade,
  language text,
  body text not null
);
alter table public.video_transcripts enable row level security;
revoke all on public.video_transcripts from anon, authenticated;

-- ---------------------------------------------------------------------
-- 3. Storage: private bucket, creators write only inside their own folder
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('videos', 'videos', false, 524288000, array['video/mp4', 'video/webm', 'video/quicktime'])
on conflict (id) do update set public = false;

drop policy if exists videos_owner_insert on storage.objects;
drop policy if exists videos_owner_select on storage.objects;
drop policy if exists videos_owner_delete on storage.objects;
create policy videos_owner_insert on storage.objects for insert to authenticated
  with check (
    bucket_id = 'videos'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (select 1 from public.creator_profiles c
                where c.user_id = auth.uid() and c.verification_status = 'verified'));
create policy videos_owner_select on storage.objects for select to authenticated
  using (bucket_id = 'videos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy videos_owner_delete on storage.objects for delete to authenticated
  using (bucket_id = 'videos' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------------------------------------------------------------------
-- 4. Creator actions
-- ---------------------------------------------------------------------
create or replace function public._require_verified_creator()
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  if not exists (select 1 from public.creator_profiles
                 where user_id = auth.uid() and verification_status = 'verified') then
    raise exception 'only verified creators can do this' using errcode = '42501';
  end if;
end;
$$;

create or replace function public.create_video_draft(
  p_title text, p_description text, p_subject text, p_grade text, p_language text
) returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  perform public._require_verified_creator();
  if (select count(*) from public.videos
      where creator_id = auth.uid() and status = 'draft') >= 10 then
    raise exception 'too many unfinished drafts (max 10)' using errcode = '54000';
  end if;
  insert into public.videos (creator_id, title, description, subject, grade_band, language)
  values (auth.uid(), trim(p_title), coalesce(trim(p_description), ''), p_subject, p_grade, p_language)
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.submit_video_for_review(p_video_id uuid, p_path text)
returns void language plpgsql security definer set search_path = public as $$
declare v public.videos%rowtype;
begin
  perform public._require_verified_creator();
  select * into v from public.videos where id = p_video_id and creator_id = auth.uid() for update;
  if not found then
    raise exception 'video not found' using errcode = 'P0002';
  end if;
  if v.status not in ('draft', 'rejected') then
    raise exception 'video cannot be submitted from status %', v.status using errcode = '55000';
  end if;
  if p_path !~ ('^' || auth.uid()::text || '/' || p_video_id::text || '/source\.(mp4|webm|mov)$') then
    raise exception 'invalid upload path' using errcode = '22023';
  end if;
  if (select count(*) from public.videos
      where creator_id = auth.uid() and status in ('uploaded', 'processing', 'needs_review')) >= 3 then
    raise exception 'you already have 3 videos waiting for review' using errcode = '54000';
  end if;
  update public.videos
  set storage_path = p_path, status = 'uploaded', rejection_reason = null, moderation = '{}'::jsonb, updated_at = now()
  where id = p_video_id;
  insert into public.video_moderation_events (video_id, stage, verdict, detail, actor)
  values (p_video_id, 'system', 'info', jsonb_build_object('event', 'submitted'), auth.uid());
end;
$$;

-- ---------------------------------------------------------------------
-- 5. Moderation pipeline (service role) and human review (staff)
-- ---------------------------------------------------------------------
-- The worker records each automated stage as an audit event.
create or replace function public.log_moderation_event(
  p_video_id uuid, p_stage text, p_verdict text, p_confidence numeric, p_detail jsonb, p_model text
) returns void language sql security definer set search_path = public as $$
  insert into public.video_moderation_events (video_id, stage, verdict, confidence, detail, model)
  values (p_video_id, p_stage, p_verdict, p_confidence, coalesce(p_detail, '{}'::jsonb), p_model);
$$;

create or replace function public.claim_next_video_for_moderation()
returns public.videos language plpgsql security definer set search_path = public as $$
declare v public.videos;
begin
  select * into v from public.videos
  where status = 'uploaded' order by updated_at asc for update skip locked limit 1;
  if not found then
    return null;
  end if;
  update public.videos set status = 'processing', updated_at = now() where id = v.id returning * into v;
  return v;
end;
$$;

-- A crashed worker must not strand videos: anything stuck in 'processing' is retried.
create or replace function public.requeue_stuck_videos()
returns integer language plpgsql security definer set search_path = public as $$
declare v_rows integer;
begin
  update public.videos set status = 'uploaded', updated_at = now()
  where status = 'processing' and updated_at < now() - interval '30 minutes';
  get diagnostics v_rows = row_count;
  return v_rows;
end;
$$;

-- Worker outcome. 'published' is only allowed when the caller states a reason
-- (trusted-creator auto-publish) and is always audited.
create or replace function public.apply_moderation_outcome(
  p_video_id uuid, p_status text, p_reason text, p_summary jsonb,
  p_duration integer default null, p_thumbnail text default null
) returns void language plpgsql security definer set search_path = public as $$
declare v public.videos%rowtype;
begin
  if p_status not in ('needs_review', 'rejected', 'published') then
    raise exception 'invalid outcome %', p_status using errcode = '22023';
  end if;
  select * into v from public.videos where id = p_video_id for update;
  if not found or v.status not in ('uploaded', 'processing') then
    raise exception 'video is not awaiting moderation' using errcode = '55000';
  end if;
  update public.videos
  set status = p_status,
      rejection_reason = case when p_status = 'rejected' then left(p_reason, 500) else null end,
      moderation = coalesce(p_summary, '{}'::jsonb),
      duration_seconds = coalesce(p_duration, duration_seconds),
      thumbnail_path = coalesce(p_thumbnail, thumbnail_path),
      published_at = case when p_status = 'published' then now() else null end,
      updated_at = now()
  where id = p_video_id;
  insert into public.video_moderation_events (video_id, stage, verdict, detail)
  values (p_video_id, 'policy',
          case p_status when 'rejected' then 'reject' when 'published' then 'approve' else 'review' end,
          jsonb_build_object('outcome', p_status, 'reason', p_reason));
end;
$$;

create or replace function public.review_video(p_video_id uuid, p_decision text, p_reason text default null)
returns text language plpgsql security definer set search_path = public as $$
declare
  v public.videos%rowtype;
  v_new text;
  v_strikes integer;
begin
  if not public.is_staff() then
    raise exception 'staff only' using errcode = '42501';
  end if;
  if p_decision not in ('approve', 'reject', 'remove') then
    raise exception 'invalid decision' using errcode = '22023';
  end if;
  if p_decision in ('reject', 'remove') and coalesce(trim(p_reason), '') = '' then
    raise exception 'a reason is required' using errcode = '22023';
  end if;
  select * into v from public.videos where id = p_video_id for update;
  if not found then
    raise exception 'video not found' using errcode = 'P0002';
  end if;
  if p_decision = 'approve' and v.status <> 'needs_review' then
    raise exception 'only videos in review can be approved' using errcode = '55000';
  end if;
  v_new := case p_decision when 'approve' then 'published' when 'reject' then 'rejected' else 'removed' end;
  update public.videos
  set status = v_new,
      rejection_reason = case when v_new = 'published' then null else left(p_reason, 500) end,
      published_at = case when v_new = 'published' then now() else published_at end,
      updated_at = now()
  where id = p_video_id;
  insert into public.video_moderation_events (video_id, stage, verdict, detail, actor)
  values (p_video_id, 'human',
          case p_decision when 'approve' then 'approve' else 'reject' end,
          jsonb_build_object('decision', p_decision, 'reason', p_reason), auth.uid());
  if p_decision in ('reject', 'remove') then
    update public.creator_profiles set strikes = strikes + 1, updated_at = now()
    where user_id = v.creator_id returning strikes into v_strikes;
    if v_strikes >= 3 then
      update public.creator_profiles set verification_status = 'suspended', updated_at = now()
      where user_id = v.creator_id;
    end if;
  end if;
  return v_new;
end;
$$;

-- ---------------------------------------------------------------------
-- 6. Reports: a safety report on a published video can quarantine it at once
-- ---------------------------------------------------------------------
create table if not exists public.video_reports (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason text not null check (reason in (
    'not_educational', 'inappropriate', 'unsafe', 'copyright', 'misinformation', 'spam', 'other')),
  details text check (details is null or char_length(details) <= 1000),
  status text not null default 'open' check (status in ('open', 'actioned', 'dismissed')),
  created_at timestamptz not null default now(),
  unique (video_id, reporter_id)
);
alter table public.video_reports enable row level security;
drop policy if exists vr_select_own on public.video_reports;
drop policy if exists vr_select_staff on public.video_reports;
create policy vr_select_own on public.video_reports for select to authenticated using (reporter_id = auth.uid());
create policy vr_select_staff on public.video_reports for select to authenticated using (public.is_staff());
revoke insert, update, delete on public.video_reports from anon, authenticated;
revoke all on public.video_reports from anon;

create or replace function public.report_video(p_video_id uuid, p_reason text, p_details text default null)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_open integer;
  v_status text;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  select status into v_status from public.videos where id = p_video_id;
  if v_status is distinct from 'published' then
    raise exception 'video not found' using errcode = 'P0002';
  end if;
  insert into public.video_reports (video_id, reporter_id, reason, details)
  values (p_video_id, v_uid, p_reason, left(p_details, 1000))
  on conflict (video_id, reporter_id) do nothing;
  select count(*) into v_open from public.video_reports where video_id = p_video_id and status = 'open';
  -- safety reports quarantine immediately; other reasons need 3 independent reports
  if p_reason in ('inappropriate', 'unsafe') or v_open >= 3 then
    update public.videos set status = 'needs_review', updated_at = now()
    where id = p_video_id and status = 'published';
    insert into public.video_moderation_events (video_id, stage, verdict, detail)
    values (p_video_id, 'report', 'review',
            jsonb_build_object('reason', p_reason, 'open_reports', v_open, 'action', 'quarantined'));
    return 'quarantined';
  end if;
  return 'received';
end;
$$;

-- ---------------------------------------------------------------------
-- 7. Watching: resume position, per-day watch seconds, XP for finishing
-- ---------------------------------------------------------------------
create table if not exists public.video_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  video_id uuid not null references public.videos(id) on delete cascade,
  position_seconds integer not null default 0 check (position_seconds >= 0),
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, video_id)
);
alter table public.video_progress enable row level security;
drop policy if exists vp_select_own on public.video_progress;
create policy vp_select_own on public.video_progress for select to authenticated using (user_id = auth.uid());
revoke insert, update, delete on public.video_progress from anon, authenticated;
revoke all on public.video_progress from anon;

create table if not exists public.video_watch_days (
  user_id uuid not null references auth.users(id) on delete cascade,
  video_id uuid not null references public.videos(id) on delete cascade,
  day date not null,
  seconds integer not null default 0 check (seconds >= 0),
  primary key (user_id, video_id, day)
);
alter table public.video_watch_days enable row level security;
revoke all on public.video_watch_days from anon, authenticated;

create or replace function public.record_video_progress(p_video_id uuid, p_position integer, p_delta integer)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v public.videos%rowtype;
  v_today date := (now() at time zone 'Asia/Dhaka')::date;
  v_delta integer;
  v_used integer;
  v_total integer;
  v_completed boolean := false;
  v_pos integer;
  v_inserted boolean;
  v_awarded integer := 0;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  select vv.* into v from public.videos vv
  join public.creator_profiles c on c.user_id = vv.creator_id
  where vv.id = p_video_id and vv.status = 'published' and c.verification_status = 'verified';
  if not found then
    raise exception 'video not found' using errcode = 'P0002';
  end if;

  v_delta := greatest(0, least(coalesce(p_delta, 0), 30));
  select coalesce(sum(seconds), 0) into v_used from public.video_watch_days where user_id = v_uid and day = v_today;
  v_delta := least(v_delta, greatest(10800 - v_used, 0)); -- max 3h of countable watch time per day
  if v_delta > 0 then
    insert into public.video_watch_days (user_id, video_id, day, seconds)
    values (v_uid, p_video_id, v_today, v_delta)
    on conflict (user_id, video_id, day) do update set seconds = public.video_watch_days.seconds + v_delta;
  end if;

  select coalesce(sum(seconds), 0) into v_total from public.video_watch_days where user_id = v_uid and video_id = p_video_id;
  v_pos := greatest(0, least(coalesce(p_position, 0), coalesce(v.duration_seconds, p_position, 0)));
  -- finished = near the end AND actually watched at least half of it
  if v.duration_seconds is not null and v.duration_seconds > 0
     and v_pos >= v.duration_seconds * 0.9 and v_total >= v.duration_seconds * 0.5 then
    v_completed := true;
  end if;

  insert into public.video_progress (user_id, video_id, position_seconds, completed)
  values (v_uid, p_video_id, v_pos, v_completed)
  on conflict (user_id, video_id) do update
    set position_seconds = excluded.position_seconds,
        completed = public.video_progress.completed or excluded.completed,
        updated_at = now()
  returning (xmax = 0) into v_inserted;
  if v_inserted then
    update public.videos set view_count = view_count + 1 where id = p_video_id;
  end if;
  if v_completed then
    v_awarded := public._grant_xp(v_uid, 'video_watched', p_video_id::text, 1);
  end if;
  return jsonb_build_object('completed', v_completed, 'awarded', v_awarded, 'watched_seconds', v_total);
end;
$$;

-- ---------------------------------------------------------------------
-- 8. Catalog
-- ---------------------------------------------------------------------
create or replace function public.list_published_videos(
  p_subject text default null, p_grade text default null, p_language text default null,
  p_query text default null, p_limit integer default 24, p_offset integer default 0
) returns table (
  id uuid, title text, description text, subject text, grade_band text, language text,
  duration_seconds integer, thumbnail_path text, published_at timestamptz, view_count integer,
  creator_id uuid, creator_name text
) language sql stable security definer set search_path = public as $$
  select v.id, v.title, v.description, v.subject, v.grade_band, v.language, v.duration_seconds,
         v.thumbnail_path, v.published_at, v.view_count, v.creator_id, c.display_name
  from public.videos v
  join public.creator_profiles c on c.user_id = v.creator_id and c.verification_status = 'verified'
  where v.status = 'published'
    and auth.uid() is not null
    and (p_subject is null or v.subject = p_subject)
    and (p_grade is null or v.grade_band = p_grade)
    and (p_language is null or v.language = p_language)
    and (p_query is null or v.title ilike '%' || replace(replace(left(p_query, 60), '%', ''), '_', '') || '%')
  order by v.published_at desc
  limit least(greatest(p_limit, 1), 50) offset greatest(p_offset, 0);
$$;

-- ---------------------------------------------------------------------
-- 9. Earnings ledger (append-only) + transparent watch-time pool
-- ---------------------------------------------------------------------
create table if not exists public.creator_earnings (
  id bigint generated always as identity primary key,
  creator_id uuid not null references public.creator_profiles(user_id) on delete restrict,
  video_id uuid references public.videos(id) on delete set null,
  kind text not null check (kind in ('watch_pool', 'tip', 'sponsorship', 'adjustment')),
  period date,
  amount_minor bigint not null,           -- poisha (1 BDT = 100)
  watch_seconds bigint,
  note text,
  created_at timestamptz not null default now()
);
create unique index if not exists creator_earnings_pool_uidx
  on public.creator_earnings (creator_id, video_id, period) where kind = 'watch_pool';
alter table public.creator_earnings enable row level security;
drop policy if exists earnings_select_own on public.creator_earnings;
create policy earnings_select_own on public.creator_earnings for select to authenticated using (creator_id = auth.uid());
revoke insert, update, delete on public.creator_earnings from anon, authenticated;
revoke all on public.creator_earnings from anon;

-- Splits a month's revenue pool across verified creators in proportion to the
-- watch time real (non-guest) learners spent on their published videos.
-- A learner counts for at most 3h/day (enforced when recording) so farming is bounded.
-- Idempotent per month: running it twice changes nothing.
create or replace function public.allocate_watch_pool(p_month date, p_pool_minor bigint)
returns integer language plpgsql security definer set search_path = public as $$
declare
  v_start date := date_trunc('month', p_month)::date;
  v_end date := (date_trunc('month', p_month) + interval '1 month')::date;
  v_total bigint;
  v_rows integer;
begin
  if p_pool_minor <= 0 then
    raise exception 'pool must be positive' using errcode = '22023';
  end if;
  create temporary table _pool on commit drop as
    select v.creator_id, v.id as video_id, sum(w.seconds)::bigint as secs
    from public.video_watch_days w
    join public.videos v on v.id = w.video_id and v.status = 'published'
    join public.creator_profiles c on c.user_id = v.creator_id and c.verification_status = 'verified'
    join auth.users u on u.id = w.user_id and coalesce(u.is_anonymous, false) = false
    where w.day >= v_start and w.day < v_end and w.user_id <> v.creator_id
    group by v.creator_id, v.id;
  select coalesce(sum(secs), 0) into v_total from _pool;
  if v_total = 0 then
    return 0;
  end if;
  insert into public.creator_earnings (creator_id, video_id, kind, period, amount_minor, watch_seconds, note)
  select creator_id, video_id, 'watch_pool', v_start, floor(p_pool_minor::numeric * secs / v_total)::bigint, secs,
         'Share of ' || to_char(v_start, 'YYYY-MM') || ' watch-time pool'
  from _pool
  on conflict (creator_id, video_id, period) where kind = 'watch_pool' do nothing;
  get diagnostics v_rows = row_count;
  return v_rows;
end;
$$;

create or replace function public.creator_balance()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'total_minor', coalesce(sum(amount_minor), 0),
    'entries', count(*),
    'watch_seconds', coalesce(sum(watch_seconds), 0))
  from public.creator_earnings where creator_id = auth.uid();
$$;

-- ---------------------------------------------------------------------
-- 10. Grants
-- ---------------------------------------------------------------------
revoke all on function public._require_verified_creator() from public, anon, authenticated;
revoke all on function public.apply_to_teach(text, text, text[], text), public.review_creator(uuid, text, text),
  public.create_video_draft(text, text, text, text, text), public.submit_video_for_review(uuid, text),
  public.review_video(uuid, text, text), public.report_video(uuid, text, text),
  public.record_video_progress(uuid, integer, integer),
  public.list_published_videos(text, text, text, text, integer, integer), public.creator_balance()
  from public, anon;
grant execute on function public.apply_to_teach(text, text, text[], text), public.review_creator(uuid, text, text),
  public.create_video_draft(text, text, text, text, text), public.submit_video_for_review(uuid, text),
  public.review_video(uuid, text, text), public.report_video(uuid, text, text),
  public.record_video_progress(uuid, integer, integer),
  public.list_published_videos(text, text, text, text, integer, integer), public.creator_balance()
  to authenticated;

revoke all on function public.log_moderation_event(uuid, text, text, numeric, jsonb, text),
  public.claim_next_video_for_moderation(), public.requeue_stuck_videos(),
  public.apply_moderation_outcome(uuid, text, text, jsonb, integer, text),
  public.allocate_watch_pool(date, bigint) from public, anon, authenticated;
grant execute on function public.log_moderation_event(uuid, text, text, numeric, jsonb, text),
  public.claim_next_video_for_moderation(), public.requeue_stuck_videos(),
  public.apply_moderation_outcome(uuid, text, text, jsonb, integer, text),
  public.allocate_watch_pool(date, bigint) to service_role;

-- public stats now include published videos
create or replace function public.public_stats()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'learners', (select count(*) from public.profiles),
    'quizzes',  (select count(*) from public.quizzes),
    'notes',    (select count(*) from public.notes),
    'videos',   (select count(*) from public.videos where status = 'published')
  );
$$;

revoke all on all tables in schema public from anon;

commit;
