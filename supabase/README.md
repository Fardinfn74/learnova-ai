# Supabase

## Migrations (`supabase/migrations`)
The first three files were already applied to the live project. Run the new ones **in order**
in the Supabase SQL editor (or `supabase db push` after marking the old ones applied with
`supabase migration repair --status applied <version>`):

1. `20261105000100_security_hardening.sql` – server-authoritative XP, battles and rooms, rate limits, anon lock-down
2. `20261105000200_video_platform.sql` – Learn Tube: verified creators, quarantine-by-default videos, audit log, reports, earnings ledger

After applying, in the dashboard:
* Authentication → Sign In / Providers → enable **Anonymous sign-ins** (powers the Judge Demo) and turn on CAPTCHA.
* Add yourself as staff: `insert into public.user_roles (user_id, role) values ('<your auth user id>', 'admin');`
* Put `SUPABASE_SERVICE_ROLE_KEY` in the server environment only (never `VITE_`-prefixed).

## Tests (`supabase/tests`)
`bash supabase/tests/reset.sh && bash supabase/tests/security_tests.sh && bash supabase/tests/video_tests.sh`
spins up a local Postgres, applies every migration and then *attacks* the schema (forging XP, reading other
people's rooms, self-approving videos, ...). All attacks must be blocked and all legitimate flows must work.
