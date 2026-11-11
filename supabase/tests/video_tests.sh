#!/bin/bash
T=aaaaaaaa-0000-0000-0000-000000000001   # teacher
S=aaaaaaaa-0000-0000-0000-000000000002   # student
M=aaaaaaaa-0000-0000-0000-000000000003   # moderator
G=aaaaaaaa-0000-0000-0000-000000000004   # guest (anonymous) user
pass=0; fail=0
psqlq() { su postgres -c "psql -d lt -At -v ON_ERROR_STOP=0 -q" 2>&1; }
as() { psqlq <<SQL
set role $2;
select set_config('request.jwt.claim.sub','$1',false) is not null;
select set_config('request.jwt.claims','{"sub":"$1","role":"$2"$4}',false) is not null;
$3
SQL
}
admin() { psqlq <<SQL
$1
SQL
}
denied() { if echo "$2" | grep -qiE "permission denied|violates row-level|not found|not authenticated|only verified|staff only|cannot apply|invalid|not awaiting|already|cannot be|too many|waiting for review|not in progress|does not exist|must be|reason is required"; then echo "PASS  $1  (blocked)"; pass=$((pass+1)); else echo "FAIL  $1  -> $2"; fail=$((fail+1)); fi; }
eq() { a=$(echo "$2" | grep -v "^t$" | tail -1 | tr -d ' '); if [ "$a" == "$3" ]; then echo "PASS  $1  ($a)"; pass=$((pass+1)); else echo "FAIL  $1  expected '$3' got '$a' :: $2"; fail=$((fail+1)); fi; }
ANON=',"is_anonymous":true'

admin "insert into auth.users(id,email,is_anonymous) values ('$T','t@x.com',false),('$S','s@x.com',false),('$M','m@x.com',false),('$G',null,true) on conflict do nothing;" >/dev/null
admin "insert into public.user_roles(user_id,role) values ('$M','moderator') on conflict do nothing;" >/dev/null

echo "=== 1. Nobody can publish without going through the gate ==="
denied "unverified user cannot create a video draft"  "$(as $S authenticated "select public.create_video_draft('Algebra basics','d','mathematics','secondary','bangla');")"
denied "guest (anonymous) cannot apply to teach"       "$(as $G authenticated "select public.apply_to_teach('Guest Teacher','b',array['mathematics'],'c');" "$ANON")"
eq "teacher application becomes pending"               "$(as $T authenticated "select public.apply_to_teach('Rahim Sir','Maths teacher',array['mathematics'],'BSc Maths, 8 yrs teaching');")" "pending"
denied "pending teacher still cannot draft"            "$(as $T authenticated "select public.create_video_draft('Algebra basics','d','mathematics','secondary','bangla');")"
denied "storage upload blocked while unverified"       "$(as $T authenticated "insert into storage.objects(bucket_id,name,owner) values ('videos','$T/x/source.mp4','$T');")"
eq "public_creators hides pending teachers"            "$(as $S authenticated "select count(*) from public.public_creators;")" "0"
eq "student cannot read creator credentials"           "$(as $S authenticated "select count(*) from public.creator_profiles;")" "0"
denied "student cannot verify a creator"               "$(as $S authenticated "select public.review_creator('$T','verified');")"
as $M authenticated "select public.review_creator('$T','verified');" >/dev/null
eq "moderator verifies teacher -> public_creators 1"   "$(as $S authenticated "select count(*) from public.public_creators;")" "1"

echo; echo "=== 2. Draft -> upload -> review -> publish ==="
VID=$(as $T authenticated "select public.create_video_draft('Algebra basics','Intro to x','mathematics','secondary','bangla');" | tail -1)
denied "teacher cannot set status=published directly"  "$(as $T authenticated "update public.videos set status='published' where id='$VID';")"
denied "teacher cannot edit moderation fields"         "$(as $T authenticated "update public.videos set moderation='{\"ok\":true}' where id='$VID';")"
denied "teacher cannot edit view_count"                "$(as $T authenticated "update public.videos set view_count=99999 where id='$VID';")"
as $T authenticated "update public.videos set title='Algebra basics (v2)' where id='$VID';" >/dev/null
eq "teacher can edit title while draft"                "$(as $T authenticated "select title from public.videos where id='$VID';")" "Algebrabasics(v2)"
eq "storage upload allowed in own folder"              "$(as $T authenticated "insert into storage.objects(bucket_id,name,owner) values ('videos','$T/$VID/source.mp4','$T') returning 'ok';")" "ok"
denied "storage upload blocked in someone else's folder" "$(as $T authenticated "insert into storage.objects(bucket_id,name,owner) values ('videos','$S/x/source.mp4','$T');")"
denied "submit with a foreign/invalid path rejected"   "$(as $T authenticated "select public.submit_video_for_review('$VID','$S/$VID/source.mp4');")"
denied "submit with wrong file type rejected"          "$(as $T authenticated "select public.submit_video_for_review('$VID','$T/$VID/source.exe');")"
as $T authenticated "select public.submit_video_for_review('$VID','$T/$VID/source.mp4');" >/dev/null
eq "status is 'uploaded' after submit"                 "$(admin "select status from public.videos where id='$VID';")" "uploaded"
eq "student sees 0 videos (not published)"             "$(as $S authenticated "select count(*) from public.videos;")" "0"
eq "catalog empty for student"                         "$(as $S authenticated "select count(*) from public.list_published_videos();")" "0"
as $T authenticated "update public.videos set title='sneaky edit' where id='$VID';" >/dev/null
eq "teacher cannot edit once submitted (title unchanged)" "$(admin "select title from public.videos where id='$VID';")" "Algebrabasics(v2)"
denied "student cannot call worker functions"          "$(as $S authenticated "select public.apply_moderation_outcome('$VID','published','x','{}'::jsonb);")"
denied "student cannot call claim function"            "$(as $S authenticated "select public.claim_next_video_for_moderation();")"
denied "teacher cannot self-approve (not staff)"       "$(as $T authenticated "select public.review_video('$VID','approve');")"

# worker
eq "worker claims the video -> processing"             "$(as $T service_role "select (public.claim_next_video_for_moderation()).status;")" "processing"
as $T service_role "select public.log_moderation_event('$VID','metadata','approve',0.97,'{\"educational\":true}'::jsonb,'test-model');" >/dev/null
as $T service_role "select public.apply_moderation_outcome('$VID','needs_review',null,'{\"auto\":\"approve\"}'::jsonb,120,'$T/$VID/thumb.jpg');" >/dev/null
eq "after AI check: needs_review (human gate)"         "$(admin "select status from public.videos where id='$VID';")" "needs_review"
eq "student still cannot see it"                       "$(as $S authenticated "select count(*) from public.list_published_videos();")" "0"
eq "moderator sees it in the queue"                    "$(as $M authenticated "select count(*) from public.videos where status='needs_review';")" "1"
eq "moderator reads audit trail (3 events)"            "$(as $M authenticated "select count(*) from public.video_moderation_events where video_id='$VID';")" "3"
eq "student cannot read audit trail"                   "$(as $S authenticated "select count(*) from public.video_moderation_events;")" "0"
eq "moderator approves -> published"                   "$(as $M authenticated "select public.review_video('$VID','approve');")" "published"
eq "student now sees it in catalog"                    "$(as $S authenticated "select count(*) from public.list_published_videos();")" "1"
denied "anon role cannot list videos"                  "$(as $S anon "select count(*) from public.list_published_videos();")"
denied "worker cannot publish a video not awaiting moderation" "$(as $T service_role "select public.apply_moderation_outcome('$VID','published','x','{}'::jsonb);")"

echo; echo "=== 3. Watching, XP and anti-cheat ==="
eq "jumping to the end without watching = not completed" "$(as $S authenticated "select (public.record_video_progress('$VID',120,0))->>'completed';")" "false"
as $S authenticated "select public.record_video_progress('$VID',30,30);" >/dev/null
as $S authenticated "select public.record_video_progress('$VID',60,30);" >/dev/null
eq "watching >=50% and reaching the end = completed"   "$(as $S authenticated "select (public.record_video_progress('$VID',118,30))->>'completed';")" "true"
eq "finish XP = 10"                                    "$(admin "select coalesce(sum(amount),0) from public.xp_events where user_id='$S' and rule_code='video_watched';")" "10"
as $S authenticated "select public.record_video_progress('$VID',118,0);" >/dev/null
eq "no double XP on replay"                            "$(admin "select coalesce(sum(amount),0) from public.xp_events where user_id='$S' and rule_code='video_watched';")" "10"
eq "view_count counted once per learner"               "$(admin "select view_count from public.videos where id='$VID';")" "1"
eq "per-call watch credit capped at 30s"               "$(as $S authenticated "select (public.record_video_progress('$VID',10,9999))->>'watched_seconds';")" "120"

echo; echo "=== 4. Reports quarantine instantly ==="
eq "'unsafe' report quarantines at once"               "$(as $S authenticated "select public.report_video('$VID','unsafe','bad');")" "quarantined"
eq "video leaves the catalog"                          "$(as $S authenticated "select count(*) from public.list_published_videos();")" "0"
as $M authenticated "select public.review_video('$VID','approve');" >/dev/null
eq "non-safety report alone does not quarantine"       "$(as $S authenticated "select public.report_video('$VID','spam');")" "received"

echo; echo "=== 5. Earnings pool is proportional and guest-proof ==="
admin "insert into public.video_watch_days(user_id,video_id,day,seconds) values ('$G','$VID',(now() at time zone 'Asia/Dhaka')::date, 99999) on conflict do nothing;" >/dev/null
eq "pool allocated to 1 video row"                     "$(as $T service_role "select public.allocate_watch_pool(current_date, 100000);")" "1"
eq "creator gets the whole pool (guest watch ignored)" "$(as $T authenticated "select (public.creator_balance())->>'total_minor';")" "100000"
eq "second run is idempotent"                          "$(as $T service_role "select public.allocate_watch_pool(current_date, 100000);")" "0"
denied "teacher cannot write earnings"                 "$(as $T authenticated "insert into public.creator_earnings(creator_id,kind,amount_minor) values ('$T','tip',999999);")"
denied "student cannot allocate the pool"              "$(as $S authenticated "select public.allocate_watch_pool(current_date, 1);")"

echo; echo "=== 6. Three strikes suspends a creator and hides everything ==="
for i in 1 2 3; do
  V=$(as $T authenticated "select public.create_video_draft('Bad $i','d','science','primary','english');" | tail -1)
  as $T authenticated "select public.submit_video_for_review('$V','$T/$V/source.mp4');" >/dev/null
  as $T service_role "select (public.claim_next_video_for_moderation()).id;" >/dev/null
  as $T service_role "select public.apply_moderation_outcome('$V','needs_review',null,'{}'::jsonb);" >/dev/null
  as $M authenticated "select public.review_video('$V','reject','off-topic');" >/dev/null
done
eq "creator suspended after 3 strikes"                 "$(admin "select verification_status from public.creator_profiles where user_id='$T';")" "suspended"
eq "all of the suspended creator's videos vanish"      "$(as $S authenticated "select count(*) from public.list_published_videos();")" "0"
denied "suspended creator cannot upload any more"      "$(as $T authenticated "select public.create_video_draft('Again','d','science','primary','english');")"
denied "rejection needs a written reason"              "$(as $M authenticated "select public.review_video('$VID','reject','');")"

echo; echo "=== 7. Crashed worker does not strand videos ==="
V2=$(as $M authenticated "select 1;" >/dev/null; admin "update public.creator_profiles set verification_status='verified', strikes=0 where user_id='$T'; select 1;" >/dev/null; as $T authenticated "select public.create_video_draft('Stuck one','d','science','primary','english');" | tail -1)
as $T authenticated "select public.submit_video_for_review('$V2','$T/$V2/source.mp4');" >/dev/null
as $T service_role "select (public.claim_next_video_for_moderation()).id;" >/dev/null
eq "fresh 'processing' video is left alone"           "$(as $T service_role "select public.requeue_stuck_videos();")" "0"
admin "update public.videos set updated_at = now() - interval '45 minutes' where id='$V2';" >/dev/null
eq "stuck video is requeued"                          "$(as $T service_role "select public.requeue_stuck_videos();")" "1"
eq "status back to 'uploaded'"                        "$(admin "select status from public.videos where id='$V2';")" "uploaded"
denied "students cannot requeue"                      "$(as $S authenticated "select public.requeue_stuck_videos();")"

echo; echo "RESULT: $pass passed, $fail failed"
