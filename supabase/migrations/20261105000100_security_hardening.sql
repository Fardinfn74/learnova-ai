-- =====================================================================
-- LEARNOVA security hardening (2026-11-05)
--
-- Goals
--   1. Nobody can write their own XP / level / streak / badges / quiz scores.
--      All gamification state is changed by SECURITY DEFINER functions only.
--   2. Battles are server-authoritative: answers are never sent to clients,
--      scores are computed in the database.
--   3. Study rooms are private: only members can read a room or its chat.
--   4. Rate limits live in Postgres so they work across serverless instances.
--   5. The anon role (public key) can read nothing except public_stats().
--
-- Server-only functions are executable by service_role only. The Vercel /
-- Netlify server needs SUPABASE_SERVICE_ROLE_KEY for them (see .env.example).
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 0. Staff roles (admin / moderator) — managed from the SQL editor only
-- ---------------------------------------------------------------------
create table if not exists public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'moderator')),
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);
alter table public.user_roles enable row level security;
drop policy if exists user_roles_select_own on public.user_roles;
create policy user_roles_select_own on public.user_roles
  for select to authenticated using (auth.uid() = user_id);

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role in ('admin', 'moderator')
  );
$$;

-- ---------------------------------------------------------------------
-- 1. New-user trigger: friendly display name incl. anonymous (judge) users
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(coalesce(
      new.raw_user_meta_data ->> 'full_name',
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Learner'
    ), 80)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- 2. Profiles: users may edit only their cosmetic columns
-- ---------------------------------------------------------------------
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (display_name, avatar_url, preferred_language) on public.profiles to authenticated;
grant insert (id, display_name, avatar_url) on public.profiles to authenticated;

alter table public.profiles drop constraint if exists profiles_language_chk;
alter table public.profiles add constraint profiles_language_chk
  check (preferred_language in ('english', 'bangla', 'banglish')) not valid;
alter table public.profiles drop constraint if exists profiles_name_len_chk;
alter table public.profiles add constraint profiles_name_len_chk
  check (display_name is null or char_length(display_name) <= 80) not valid;
alter table public.profiles drop constraint if exists profiles_counters_chk;
alter table public.profiles add constraint profiles_counters_chk
  check (xp >= 0 and level >= 1 and current_streak >= 0 and longest_streak >= 0) not valid;

-- ---------------------------------------------------------------------
-- 3. XP engine
-- ---------------------------------------------------------------------
create table if not exists public.xp_rules (
  code text primary key,
  amount integer not null check (amount between 0 and 500),
  daily_cap integer check (daily_cap is null or daily_cap >= 0),
  description text not null
);
alter table public.xp_rules enable row level security;
drop policy if exists xp_rules_read on public.xp_rules;
create policy xp_rules_read on public.xp_rules for select to authenticated using (true);
revoke insert, update, delete on public.xp_rules from anon, authenticated;

insert into public.xp_rules (code, amount, daily_cap, description) values
  ('chat_reply',      2,  40, 'Chatted with Nova'),
  ('voice_reply',     5,  50, 'Voice conversation with Nova'),
  ('draw_analysis',  10,  30, 'Used Draw to Learn'),
  ('summarize_notes',12,  36, 'Summarized notes'),
  ('podcast',        15,  30, 'Generated an audio podcast'),
  ('quiz_correct',    5, 100, 'Quiz correct answers'),
  ('battle_win',     50, 150, 'Won a Brain Battle'),
  ('battle_tie',     25,  75, 'Tied a Brain Battle'),
  ('battle_played',  10,  50, 'Played a Brain Battle'),
  ('course_module',  25, 150, 'Completed a course module'),
  ('code_run_ok',     5,  25, 'Ran code in Code Lab'),
  ('video_watched',  10, 100, 'Finished a learning video')
on conflict (code) do update
  set amount = excluded.amount, daily_cap = excluded.daily_cap, description = excluded.description;

alter table public.xp_events add column if not exists rule_code text;
alter table public.xp_events add column if not exists ref_id text;
create unique index if not exists xp_events_rule_ref_uidx
  on public.xp_events (user_id, rule_code, ref_id) where ref_id is not null;

-- Internal: never callable by API roles.
create or replace function public._grant_xp(
  p_user uuid, p_rule text, p_ref text default null, p_units integer default 1
) returns integer language plpgsql security definer set search_path = public as $$
declare
  r public.xp_rules%rowtype;
  prof public.profiles%rowtype;
  v_units integer := greatest(1, least(coalesce(p_units, 1), 50));
  v_today date := (now() at time zone 'Asia/Dhaka')::date;
  v_day_start timestamptz := (((now() at time zone 'Asia/Dhaka')::date)::timestamp at time zone 'Asia/Dhaka');
  v_amount integer;
  v_used integer;
  v_rows integer;
  v_streak integer;
  v_xp integer;
  v_level integer;
begin
  select * into r from public.xp_rules where code = p_rule;
  if not found then
    raise exception 'unknown xp rule: %', p_rule;
  end if;

  -- Lock the profile row first so concurrent grants for one user serialise.
  select * into prof from public.profiles where id = p_user for update;
  if not found then
    insert into public.profiles (id, display_name) values (p_user, 'Learner')
    on conflict (id) do nothing;
    select * into prof from public.profiles where id = p_user for update;
  end if;

  v_amount := r.amount * v_units;
  if r.daily_cap is not null then
    select coalesce(sum(amount), 0) into v_used
    from public.xp_events
    where user_id = p_user and rule_code = p_rule and created_at >= v_day_start;
    v_amount := least(v_amount, greatest(r.daily_cap - v_used, 0));
  end if;
  if v_amount <= 0 then
    return 0;
  end if;

  insert into public.xp_events (user_id, amount, reason, rule_code, ref_id)
  values (p_user, v_amount, r.description, p_rule, p_ref)
  on conflict (user_id, rule_code, ref_id) where ref_id is not null do nothing;
  get diagnostics v_rows = row_count;
  if v_rows = 0 then
    return 0; -- duplicate event (same ref) — idempotent
  end if;

  if prof.last_active_date = v_today then
    v_streak := greatest(prof.current_streak, 1);
  elsif prof.last_active_date = v_today - 1 then
    v_streak := prof.current_streak + 1;
  else
    v_streak := 1;
  end if;

  v_xp := prof.xp + v_amount;
  v_level := greatest(1, floor(sqrt(v_xp / 50.0))::integer + 1);

  update public.profiles
  set xp = v_xp,
      level = v_level,
      current_streak = v_streak,
      longest_streak = greatest(prof.longest_streak, v_streak),
      last_active_date = v_today
  where id = p_user;

  insert into public.badges (user_id, code, name, description, icon)
  select p_user, b.code, b.name, b.description, b.icon
  from (values
    ('first_100', 'First 100 XP',  'You earned 100 XP!', E'\u2B50',         v_xp >= 100),
    ('level_5',   'Rising Star',   'Reached level 5',    E'\U0001F31F',     v_level >= 5),
    ('streak_3',  'On Fire',       '3-day streak',       E'\U0001F525',     v_streak >= 3),
    ('streak_7',  'Unstoppable',   '7-day streak',       E'\U0001F48E',     v_streak >= 7)
  ) as b(code, name, description, icon, earned)
  where b.earned
  on conflict (user_id, code) do nothing;

  return v_amount;
end;
$$;

create or replace function public.grant_xp(
  p_user uuid, p_rule text, p_ref text default null, p_units integer default 1
) returns integer language sql security definer set search_path = public as $$
  select public._grant_xp(p_user, p_rule, p_ref, p_units);
$$;

revoke all on function public._grant_xp(uuid, text, text, integer) from public, anon, authenticated;
revoke all on function public.grant_xp(uuid, text, text, integer) from public, anon, authenticated;
grant execute on function public.grant_xp(uuid, text, text, integer) to service_role;

-- Gamification tables become read-only for clients.
drop policy if exists xp_all_own on public.xp_events;
drop policy if exists xp_events_all_own on public.xp_events;
drop policy if exists badges_all_own on public.badges;
drop policy if exists quiz_attempts_all_own on public.quiz_attempts;
drop policy if exists xp_select_own on public.xp_events;
drop policy if exists badges_select_own on public.badges;
drop policy if exists attempts_select_own on public.quiz_attempts;
create policy xp_select_own on public.xp_events for select to authenticated using (auth.uid() = user_id);
create policy badges_select_own on public.badges for select to authenticated using (auth.uid() = user_id);
create policy attempts_select_own on public.quiz_attempts for select to authenticated using (auth.uid() = user_id);
revoke insert, update, delete on public.xp_events, public.badges, public.quiz_attempts from anon, authenticated;

-- ---------------------------------------------------------------------
-- 4. Quizzes: answer key lives in a table clients cannot read
-- ---------------------------------------------------------------------
create table if not exists public.quiz_answer_keys (
  quiz_id uuid primary key references public.quizzes(id) on delete cascade,
  key jsonb not null
);
alter table public.quiz_answer_keys enable row level security;
revoke all on public.quiz_answer_keys from anon, authenticated;

create or replace function public.submit_quiz_attempt(p_quiz_id uuid, p_answers integer[])
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_q jsonb;
  v_key jsonb;
  v_total integer;
  v_score integer := 0;
  v_i integer;
  v_attempt uuid;
  v_awarded integer := 0;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  select questions into v_q from public.quizzes where id = p_quiz_id and user_id = v_uid;
  if not found then
    raise exception 'quiz not found' using errcode = 'P0002';
  end if;
  select key into v_key from public.quiz_answer_keys where quiz_id = p_quiz_id;
  v_key := coalesce(v_key, v_q); -- legacy quizzes embed correct_index in questions
  v_total := jsonb_array_length(v_key);
  if coalesce(array_length(p_answers, 1), 0) <> v_total then
    raise exception 'answers length mismatch' using errcode = '22023';
  end if;
  for v_i in 0 .. v_total - 1 loop
    if (v_key -> v_i ->> 'correct_index')::integer = p_answers[v_i + 1] then
      v_score := v_score + 1;
    end if;
  end loop;
  insert into public.quiz_attempts (user_id, quiz_id, score, total, answers)
  values (v_uid, p_quiz_id, v_score, v_total, to_jsonb(p_answers))
  returning id into v_attempt;
  if v_score > 0 then
    -- ref = quiz id: XP is granted for the first attempt only.
    v_awarded := public._grant_xp(v_uid, 'quiz_correct', p_quiz_id::text, v_score);
  end if;
  return jsonb_build_object(
    'attempt_id', v_attempt, 'score', v_score, 'total', v_total,
    'awarded', v_awarded, 'answer_key', v_key
  );
end;
$$;
revoke all on function public.submit_quiz_attempt(uuid, integer[]) from public, anon;
grant execute on function public.submit_quiz_attempt(uuid, integer[]) to authenticated;

-- ---------------------------------------------------------------------
-- 5. Course progress (persisted, XP once per module)
-- ---------------------------------------------------------------------
create table if not exists public.course_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null check (char_length(course_id) <= 64),
  module_id text not null check (char_length(module_id) <= 64),
  completed_at timestamptz not null default now(),
  primary key (user_id, course_id, module_id)
);
alter table public.course_progress enable row level security;
drop policy if exists course_progress_select_own on public.course_progress;
create policy course_progress_select_own on public.course_progress
  for select to authenticated using (auth.uid() = user_id);
revoke insert, update, delete on public.course_progress from anon, authenticated;

create or replace function public.complete_course_module(p_course text, p_module text)
returns integer language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_rows integer;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  insert into public.course_progress (user_id, course_id, module_id)
  values (v_uid, left(p_course, 64), left(p_module, 64))
  on conflict do nothing;
  get diagnostics v_rows = row_count;
  if v_rows = 0 then
    return 0;
  end if;
  return public._grant_xp(v_uid, 'course_module', left(p_course, 64) || ':' || left(p_module, 64), 1);
end;
$$;
revoke all on function public.complete_course_module(text, text) from public, anon;
grant execute on function public.complete_course_module(text, text) to authenticated;

-- ---------------------------------------------------------------------
-- 6. Rate limiting (fixed window, shared by every server instance)
-- ---------------------------------------------------------------------
create table if not exists public.rate_limits (
  user_id uuid not null,
  bucket text not null,
  window_start timestamptz not null,
  hits integer not null default 0,
  primary key (user_id, bucket, window_start)
);
alter table public.rate_limits enable row level security;
revoke all on public.rate_limits from anon, authenticated;

create or replace function public.check_rate_limit(
  p_user uuid, p_bucket text, p_limit integer, p_window_seconds integer
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_start timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  v_hits integer;
begin
  insert into public.rate_limits (user_id, bucket, window_start, hits)
  values (p_user, p_bucket, v_start, 1)
  on conflict (user_id, bucket, window_start)
  do update set hits = public.rate_limits.hits + 1
  returning hits into v_hits;

  if random() < 0.01 then
    delete from public.rate_limits where window_start < now() - interval '2 days';
  end if;

  return jsonb_build_object(
    'ok', v_hits <= p_limit,
    'hits', v_hits,
    'limit', p_limit,
    'retry_after', greatest(1, ceil(extract(epoch from (v_start + make_interval(secs => p_window_seconds) - now())))::integer)
  );
end;
$$;
revoke all on function public.check_rate_limit(uuid, text, integer, integer) from public, anon, authenticated;
grant execute on function public.check_rate_limit(uuid, text, integer, integer) to service_role;

-- ---------------------------------------------------------------------
-- 7. Brain Battles: server-authoritative
-- ---------------------------------------------------------------------
drop policy if exists "Anyone can read battles" on public.battles;
drop policy if exists "Authenticated users can create battles" on public.battles;
drop policy if exists "Players can update their battles" on public.battles;
drop policy if exists battles_select on public.battles;

alter table public.battles drop column if exists questions;
alter table public.battles add column if not exists question_count integer not null default 5;
alter table public.battles add column if not exists started_at timestamptz;
alter table public.battles add column if not exists finished_at timestamptz;
alter table public.battles drop constraint if exists battles_status_chk;
alter table public.battles add constraint battles_status_chk
  check (status in ('waiting', 'playing', 'finished', 'abandoned'));

create policy battles_select on public.battles for select to authenticated
  using (status = 'waiting' or auth.uid() in (player1_id, player2_id));
revoke insert, update, delete on public.battles from anon, authenticated;
revoke all on public.battles from anon;

create table if not exists public.battle_questions (
  battle_id uuid not null references public.battles(id) on delete cascade,
  idx integer not null check (idx >= 0),
  question text not null,
  options jsonb not null,
  correct_index integer not null check (correct_index between 0 and 3),
  explanation text,
  primary key (battle_id, idx)
);
alter table public.battle_questions enable row level security;
revoke all on public.battle_questions from anon, authenticated;

create table if not exists public.battle_answers (
  battle_id uuid not null references public.battles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  idx integer not null,
  choice integer not null check (choice between 0 and 3),
  is_correct boolean not null,
  answered_at timestamptz not null default now(),
  primary key (battle_id, user_id, idx)
);
alter table public.battle_answers enable row level security;
revoke all on public.battle_answers from anon, authenticated;

-- Called by the server (service role) after the AI generated the questions.
create or replace function public.create_battle_server(p_user uuid, p_topic text, p_questions jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
  v_n integer;
  v_i integer;
  q jsonb;
begin
  if jsonb_typeof(p_questions) <> 'array' then
    raise exception 'questions must be an array' using errcode = '22023';
  end if;
  v_n := jsonb_array_length(p_questions);
  if v_n < 3 or v_n > 10 then
    raise exception 'a battle needs 3-10 questions' using errcode = '22023';
  end if;
  delete from public.battles where player1_id = p_user and status = 'waiting';
  insert into public.battles (topic, player1_id, question_count)
  values (left(p_topic, 120), p_user, v_n)
  returning id into v_id;
  for v_i in 0 .. v_n - 1 loop
    q := p_questions -> v_i;
    if jsonb_typeof(q -> 'options') <> 'array' or jsonb_array_length(q -> 'options') <> 4 then
      raise exception 'each question needs exactly 4 options' using errcode = '22023';
    end if;
    insert into public.battle_questions (battle_id, idx, question, options, correct_index, explanation)
    values (v_id, v_i, left(q ->> 'question', 500), q -> 'options',
            (q ->> 'correct_index')::integer, left(q ->> 'explanation', 500));
  end loop;
  return v_id;
end;
$$;
revoke all on function public.create_battle_server(uuid, text, jsonb) from public, anon, authenticated;
grant execute on function public.create_battle_server(uuid, text, jsonb) to service_role;

create or replace function public.join_battle(p_battle_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_id uuid;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  update public.battles
  set player2_id = v_uid, status = 'playing', started_at = now()
  where id = p_battle_id and status = 'waiting' and player2_id is null and player1_id <> v_uid
  returning id into v_id;
  if v_id is null then
    raise exception 'battle is no longer available' using errcode = 'P0002';
  end if;
  return v_id;
end;
$$;

create or replace function public.cancel_battle(p_battle_id uuid)
returns void language sql security definer set search_path = public as $$
  delete from public.battles
  where id = p_battle_id and player1_id = auth.uid() and status = 'waiting';
$$;

create or replace function public.list_open_battles()
returns table (id uuid, topic text, created_at timestamptz, host_name text, is_mine boolean)
language plpgsql security definer set search_path = public as $$
begin
  delete from public.battles bt where bt.status = 'waiting' and bt.created_at < now() - interval '15 minutes';
  update public.battles b set status = 'abandoned', finished_at = now()
  where b.status = 'playing'
    and coalesce((select max(a.answered_at) from public.battle_answers a where a.battle_id = b.id), b.started_at)
        < now() - interval '10 minutes';
  return query
    select b.id, b.topic, b.created_at, coalesce(p.display_name, 'Student'), b.player1_id = auth.uid()
    from public.battles b
    left join public.profiles p on p.id = b.player1_id
    where b.status = 'waiting'
    order by b.created_at desc
    limit 30;
end;
$$;

create or replace function public.get_battle_state(p_battle_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  b public.battles%rowtype;
  v_is_p1 boolean;
  v_mine integer;
  v_theirs integer;
  v_q jsonb := null;
  v_opp uuid;
  v_opp_name text;
begin
  select * into b from public.battles
  where id = p_battle_id and v_uid in (player1_id, player2_id);
  if not found then
    raise exception 'battle not found' using errcode = 'P0002';
  end if;
  v_is_p1 := (b.player1_id = v_uid);
  v_opp := case when v_is_p1 then b.player2_id else b.player1_id end;
  select count(*) into v_mine from public.battle_answers where battle_id = b.id and user_id = v_uid;
  select count(*) into v_theirs from public.battle_answers where battle_id = b.id and user_id = v_opp;
  if v_opp is not null then
    select coalesce(display_name, 'Opponent') into v_opp_name from public.profiles where id = v_opp;
  end if;
  if b.status = 'playing' and v_mine < b.question_count then
    select jsonb_build_object('idx', q.idx, 'question', q.question, 'options', q.options)
    into v_q from public.battle_questions q where q.battle_id = b.id and q.idx = v_mine;
  end if;
  return jsonb_build_object(
    'id', b.id, 'topic', b.topic, 'status', b.status, 'question_count', b.question_count,
    'my_score', case when v_is_p1 then b.player1_score else b.player2_score end,
    'opp_score', case when v_is_p1 then b.player2_score else b.player1_score end,
    'my_answered', v_mine, 'opp_answered', v_theirs,
    'opponent_name', v_opp_name, 'question', v_q
  );
end;
$$;

create or replace function public.answer_battle(p_battle_id uuid, p_idx integer, p_choice integer)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  b public.battles%rowtype;
  q public.battle_questions%rowtype;
  v_is_p1 boolean;
  v_mine integer;
  v_correct boolean;
  v_total_answers integer;
  v_finished boolean := false;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  if p_choice not between 0 and 3 then
    raise exception 'invalid choice' using errcode = '22023';
  end if;
  select * into b from public.battles where id = p_battle_id for update;
  if not found or v_uid not in (b.player1_id, coalesce(b.player2_id, '00000000-0000-0000-0000-000000000000'::uuid)) then
    raise exception 'battle not found' using errcode = 'P0002';
  end if;
  if b.status <> 'playing' then
    raise exception 'battle is not in progress' using errcode = '55000';
  end if;
  v_is_p1 := (b.player1_id = v_uid);
  select count(*) into v_mine from public.battle_answers where battle_id = b.id and user_id = v_uid;
  if p_idx <> v_mine or v_mine >= b.question_count then
    raise exception 'out of order answer' using errcode = '22023';
  end if;
  select * into q from public.battle_questions where battle_id = b.id and idx = p_idx;
  v_correct := (q.correct_index = p_choice);
  insert into public.battle_answers (battle_id, user_id, idx, choice, is_correct)
  values (b.id, v_uid, p_idx, p_choice, v_correct);
  if v_correct then
    if v_is_p1 then
      update public.battles set player1_score = player1_score + 1 where id = b.id;
    else
      update public.battles set player2_score = player2_score + 1 where id = b.id;
    end if;
  end if;
  select count(*) into v_total_answers from public.battle_answers where battle_id = b.id;
  if v_total_answers >= 2 * b.question_count then
    v_finished := true;
    update public.battles set status = 'finished', finished_at = now() where id = b.id
    returning * into b;
    if b.player1_score > b.player2_score then
      perform public._grant_xp(b.player1_id, 'battle_win', b.id::text, 1);
      perform public._grant_xp(b.player2_id, 'battle_played', b.id::text, 1);
    elsif b.player2_score > b.player1_score then
      perform public._grant_xp(b.player2_id, 'battle_win', b.id::text, 1);
      perform public._grant_xp(b.player1_id, 'battle_played', b.id::text, 1);
    else
      perform public._grant_xp(b.player1_id, 'battle_tie', b.id::text, 1);
      perform public._grant_xp(b.player2_id, 'battle_tie', b.id::text, 1);
    end if;
  else
    select * into b from public.battles where id = b.id;
  end if;
  return jsonb_build_object(
    'correct', v_correct, 'correct_index', q.correct_index, 'explanation', q.explanation,
    'my_score', case when v_is_p1 then b.player1_score else b.player2_score end,
    'opp_score', case when v_is_p1 then b.player2_score else b.player1_score end,
    'finished', v_finished
  );
end;
$$;

revoke all on function public.join_battle(uuid), public.cancel_battle(uuid), public.list_open_battles(),
  public.get_battle_state(uuid), public.answer_battle(uuid, integer, integer) from public, anon;
grant execute on function public.join_battle(uuid), public.cancel_battle(uuid), public.list_open_battles(),
  public.get_battle_state(uuid), public.answer_battle(uuid, integer, integer) to authenticated;

-- ---------------------------------------------------------------------
-- 8. Study rooms: membership-based privacy
-- ---------------------------------------------------------------------
create table if not exists public.study_room_members (
  room_id uuid not null references public.study_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);
alter table public.study_room_members enable row level security;

create or replace function public.is_room_member(p_room uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.study_room_members m where m.room_id = p_room and m.user_id = auth.uid()
  );
$$;

-- Existing rooms: make each host a member so nothing disappears.
insert into public.study_room_members (room_id, user_id)
select id, host_id from public.study_rooms where host_id is not null
on conflict do nothing;

alter table public.study_rooms alter column code type varchar(12);

drop policy if exists "Anyone can read rooms" on public.study_rooms;
drop policy if exists "Authenticated users can create rooms" on public.study_rooms;
drop policy if exists "Hosts can delete rooms" on public.study_rooms;
drop policy if exists rooms_select_members on public.study_rooms;
drop policy if exists rooms_delete_host on public.study_rooms;
create policy rooms_select_members on public.study_rooms for select to authenticated
  using (host_id = auth.uid() or public.is_room_member(id));
create policy rooms_delete_host on public.study_rooms for delete to authenticated
  using (host_id = auth.uid());
revoke insert, update on public.study_rooms from anon, authenticated;
revoke all on public.study_rooms from anon;

drop policy if exists members_select on public.study_room_members;
create policy members_select on public.study_room_members for select to authenticated
  using (user_id = auth.uid() or public.is_room_member(room_id));
revoke insert, update, delete on public.study_room_members from anon, authenticated;
revoke all on public.study_room_members from anon;

-- study_messages: read for members, writes only through the moderated server function
do $$
declare pol record;
begin
  for pol in select policyname from pg_policies where schemaname = 'public' and tablename = 'study_messages' loop
    execute format('drop policy %I on public.study_messages', pol.policyname);
  end loop;
end $$;
create policy study_messages_select_members on public.study_messages for select to authenticated
  using (public.is_room_member(room_id));
revoke insert, update, delete on public.study_messages from anon, authenticated;
revoke all on public.study_messages from anon;
alter table public.study_messages drop constraint if exists study_messages_len_chk;
alter table public.study_messages add constraint study_messages_len_chk
  check (char_length(content) between 1 and 2000) not valid;

create or replace function public.create_study_room(p_topic text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- no 0/O/1/I
  v_code text;
  v_bytes bytea;
  v_id uuid;
  v_try integer := 0;
  v_i integer;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  loop
    v_try := v_try + 1;
    v_bytes := gen_random_bytes(8);
    v_code := '';
    for v_i in 0 .. 7 loop
      v_code := v_code || substr(v_alphabet, (get_byte(v_bytes, v_i) % 32) + 1, 1);
    end loop;
    begin
      insert into public.study_rooms (topic, host_id, code)
      values (left(coalesce(nullif(trim(p_topic), ''), 'Study Room'), 120), v_uid, v_code)
      returning id into v_id;
      exit;
    exception when unique_violation then
      if v_try >= 8 then raise; end if;
    end;
  end loop;
  insert into public.study_room_members (room_id, user_id) values (v_id, v_uid);
  return jsonb_build_object('id', v_id, 'code', v_code);
end;
$$;

create or replace function public.join_study_room(p_code text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_id uuid;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  select id into v_id from public.study_rooms where code = upper(trim(p_code));
  if v_id is null then
    raise exception 'room not found' using errcode = 'P0002';
  end if;
  insert into public.study_room_members (room_id, user_id) values (v_id, v_uid) on conflict do nothing;
  return v_id;
end;
$$;

create or replace function public.study_room_member_names(p_room_id uuid)
returns table (user_id uuid, display_name text)
language sql stable security definer set search_path = public as $$
  select m.user_id, coalesce(p.display_name, 'Student')
  from public.study_room_members m
  left join public.profiles p on p.id = m.user_id
  where m.room_id = p_room_id and public.is_room_member(p_room_id);
$$;

revoke all on function public.is_room_member(uuid), public.create_study_room(text),
  public.join_study_room(text), public.study_room_member_names(uuid) from public, anon;
grant execute on function public.is_room_member(uuid), public.create_study_room(text),
  public.join_study_room(text), public.study_room_member_names(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- 9. Public, PII-free counters (replaces the unauthenticated stats endpoint)
-- ---------------------------------------------------------------------
create or replace function public.public_stats()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'learners', (select count(*) from public.profiles),
    'quizzes',  (select count(*) from public.quizzes),
    'notes',    (select count(*) from public.notes)
  );
$$;
revoke all on function public.public_stats() from public;
grant execute on function public.public_stats() to anon, authenticated;

-- ---------------------------------------------------------------------
-- 10. Pricing waitlist (replaces the fake "payment gateway" toast)
-- ---------------------------------------------------------------------
create table if not exists public.plan_waitlist (
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id text not null check (char_length(plan_id) <= 32),
  created_at timestamptz not null default now(),
  primary key (user_id, plan_id)
);
alter table public.plan_waitlist enable row level security;
drop policy if exists waitlist_select_own on public.plan_waitlist;
drop policy if exists waitlist_insert_own on public.plan_waitlist;
create policy waitlist_select_own on public.plan_waitlist for select to authenticated using (auth.uid() = user_id);
create policy waitlist_insert_own on public.plan_waitlist for insert to authenticated with check (auth.uid() = user_id);
revoke update, delete on public.plan_waitlist from anon, authenticated;

-- ---------------------------------------------------------------------
-- 11. Defence in depth: the public (anon) key sees no tables at all
-- ---------------------------------------------------------------------
revoke all on all tables in schema public from anon;
alter default privileges in schema public revoke all on tables from anon;

commit;
