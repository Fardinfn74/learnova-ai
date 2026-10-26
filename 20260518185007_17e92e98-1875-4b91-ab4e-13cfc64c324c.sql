
-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  preferred_language text not null default 'english',
  xp integer not null default 0,
  level integer not null default 1,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_active_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Auto create profile + handle signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)), new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- THREADS
create table public.threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New chat',
  subject text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.threads enable row level security;
create policy "threads_all_own" on public.threads for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index threads_user_idx on public.threads(user_id, updated_at desc);
create trigger threads_updated_at before update on public.threads
  for each row execute function public.set_updated_at();

-- MESSAGES
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  parts jsonb,
  created_at timestamptz not null default now()
);
alter table public.messages enable row level security;
create policy "messages_all_own" on public.messages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index messages_thread_idx on public.messages(thread_id, created_at);

-- QUIZZES
create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic text not null,
  difficulty text not null default 'medium',
  language text not null default 'english',
  questions jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.quizzes enable row level security;
create policy "quizzes_all_own" on public.quizzes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- QUIZ ATTEMPTS
create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  score integer not null,
  total integer not null,
  answers jsonb,
  created_at timestamptz not null default now()
);
alter table public.quiz_attempts enable row level security;
create policy "attempts_all_own" on public.quiz_attempts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- NOTES (summaries)
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  source_text text,
  summary text,
  flashcards jsonb,
  created_at timestamptz not null default now()
);
alter table public.notes enable row level security;
create policy "notes_all_own" on public.notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- XP EVENTS
create table public.xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);
alter table public.xp_events enable row level security;
create policy "xp_all_own" on public.xp_events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index xp_user_idx on public.xp_events(user_id, created_at desc);

-- BADGES
create table public.badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code text not null,
  name text not null,
  description text,
  icon text,
  earned_at timestamptz not null default now(),
  unique (user_id, code)
);
alter table public.badges enable row level security;
create policy "badges_all_own" on public.badges for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
