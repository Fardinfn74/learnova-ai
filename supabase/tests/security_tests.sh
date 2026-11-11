#!/bin/bash
A=11111111-1111-1111-1111-111111111111
B=22222222-2222-2222-2222-222222222222
C=33333333-3333-3333-3333-333333333333
pass=0; fail=0
psqlq() { su postgres -c "psql -d lt -At -v ON_ERROR_STOP=0 -q" 2>&1; }
as() { # uid role sql
  psqlq <<SQL
set role $2;
select set_config('request.jwt.claim.sub','$1',false) is not null;
select set_config('request.jwt.claims','{"sub":"$1","role":"$2"}',false) is not null;
$3
SQL
}
admin() { psqlq <<SQL
$1
SQL
}
expect_denied() { # name output
  if echo "$2" | grep -qiE "permission denied|violates row-level|not found|not authenticated|no longer available|out of order|not in progress|must be owner|does not exist"; then echo "PASS  $1  (blocked)"; pass=$((pass+1)); else echo "FAIL  $1  -> $2"; fail=$((fail+1)); fi; }
expect_eq() { # name actual expected
  a=$(echo "$2" | grep -v "^t$" | tail -1 | tr -d ' ')
  if [ "$a" == "$3" ]; then echo "PASS  $1  ($a)"; pass=$((pass+1)); else echo "FAIL  $1  expected '$3' got '$a' :: $2"; fail=$((fail+1)); fi; }

admin "insert into auth.users(id,email) values ('$A','alice@x.com'),('$B','bob@x.com'),('$C','carol@x.com') on conflict do nothing;" >/dev/null
echo "profiles auto-created: $(admin "select count(*) from public.profiles;")"

echo; echo "=== A. forging attempts must FAIL ==="
expect_denied "A sets own XP via profiles update" "$(as $A authenticated "update public.profiles set xp=999999, level=99 where id='$A';")"
expect_denied "A sets own streak"                 "$(as $A authenticated "update public.profiles set current_streak=500 where id='$A';")"
expect_denied "A inserts xp_events"               "$(as $A authenticated "insert into public.xp_events(user_id,amount,reason) values ('$A',500,'cheat');")"
expect_denied "A inserts badge"                   "$(as $A authenticated "insert into public.badges(user_id,code,name) values ('$A','x','x');")"
expect_denied "A inserts quiz_attempt score"      "$(as $A authenticated "insert into public.quiz_attempts(user_id,quiz_id,score,total,answers) values ('$A',gen_random_uuid(),10,10,'[]');")"
expect_denied "A calls grant_xp directly"         "$(as $A authenticated "select public.grant_xp('$A','battle_win','x',1);")"
expect_denied "A calls _grant_xp directly"        "$(as $A authenticated "select public._grant_xp('$A','battle_win','x',1);")"
expect_denied "A calls check_rate_limit"          "$(as $A authenticated "select public.check_rate_limit('$A','x',1,60);")"
expect_denied "A calls create_battle_server"      "$(as $A authenticated "select public.create_battle_server('$A','t','[]'::jsonb);")"
expect_denied "A reads quiz_answer_keys"          "$(as $A authenticated "select * from public.quiz_answer_keys;")"
expect_denied "A reads battle_questions"          "$(as $A authenticated "select * from public.battle_questions;")"
expect_denied "A updates battles directly"        "$(as $A authenticated "update public.battles set player1_score=99;")"
expect_denied "A inserts study message directly"  "$(as $A authenticated "insert into public.study_messages(room_id,user_id,content,is_nova) values (gen_random_uuid(),'$A','hi',true);")"
expect_denied "anon reads profiles"               "$(as $A anon "select * from public.profiles;")"
expect_denied "anon reads study_messages"         "$(as $A anon "select * from public.study_messages;")"
expect_denied "anon reads battles"                "$(as $A anon "select * from public.battles;")"
expect_denied "anon reads study_rooms"            "$(as $A anon "select * from public.study_rooms;")"

echo; echo "=== B. legit behaviour must WORK ==="
as $A authenticated "update public.profiles set display_name='Alice', preferred_language='bangla' where id='$A';" >/dev/null
expect_eq "A edits own display name" "$(as $A authenticated "select display_name from public.profiles where id='$A';")" "Alice"
expect_eq "anon can read public_stats().learners" "$(as $A anon "select case when (public.public_stats()->>'learners')::int >= 3 then 'yes' else 'no' end;")" "yes"

# XP engine
expect_eq "grant_xp chat_reply 2xp"        "$(as $A service_role "select public.grant_xp('$A','chat_reply',null,1);")" "2"
for i in $(seq 1 30); do as $A service_role "select public.grant_xp('$A','chat_reply',null,1);" >/dev/null; done
expect_eq "chat_reply daily cap = 40 xp"   "$(admin "select coalesce(sum(amount),0) from public.xp_events where user_id='$A' and rule_code='chat_reply';")" "40"
expect_eq "idempotent ref (1st)"           "$(as $A service_role "select public.grant_xp('$A','summarize_notes','note-1',1);")" "12"
expect_eq "idempotent ref (replay = 0)"    "$(as $A service_role "select public.grant_xp('$A','summarize_notes','note-1',1);")" "0"
expect_eq "profile xp = 40+12"             "$(admin "select xp from public.profiles where id='$A';")" "52"
expect_eq "streak starts at 1"             "$(admin "select current_streak from public.profiles where id='$A';")" "1"
admin "update public.profiles set last_active_date=((now() at time zone 'Asia/Dhaka')::date - 1), current_streak=4 where id='$A';" >/dev/null
as $A service_role "select public.grant_xp('$A','voice_reply',null,1);" >/dev/null
expect_eq "streak continues after a 25h gap (calendar-day logic)" "$(admin "select current_streak from public.profiles where id='$A';")" "5"
admin "update public.profiles set last_active_date=((now() at time zone 'Asia/Dhaka')::date - 3) where id='$A';" >/dev/null
as $A service_role "select public.grant_xp('$A','voice_reply',null,1);" >/dev/null
expect_eq "streak resets after missing days" "$(admin "select current_streak from public.profiles where id='$A';")" "1"

# rate limit
for i in 1 2 3; do as $A service_role "select public.check_rate_limit('$A','t',3,60);" >/dev/null; done
expect_eq "rate limit 4th call rejected"   "$(as $A service_role "select (public.check_rate_limit('$A','t',3,60)->>'ok');")" "false"

# quiz
QID=$(admin "insert into public.quizzes(user_id,topic,questions) values ('$A','math','[{\"question\":\"1+1\",\"options\":[\"1\",\"2\",\"3\",\"4\"]},{\"question\":\"2+2\",\"options\":[\"1\",\"2\",\"3\",\"4\"]}]') returning id;" | head -1)
admin "insert into public.quiz_answer_keys(quiz_id,key) values ('$QID','[{\"correct_index\":1,\"explanation\":\"two\"},{\"correct_index\":3,\"explanation\":\"four\"}]');" >/dev/null
expect_eq "quiz perfect score computed server-side" "$(as $A authenticated "select (public.submit_quiz_attempt('$QID', array[1,3]))->>'score';")" "2"
expect_eq "quiz XP = 10 (2 x 5)"           "$(admin "select coalesce(sum(amount),0) from public.xp_events where user_id='$A' and rule_code='quiz_correct';")" "10"
as $A authenticated "select public.submit_quiz_attempt('$QID', array[1,3]);" >/dev/null
expect_eq "quiz replay gives no extra XP"  "$(admin "select coalesce(sum(amount),0) from public.xp_events where user_id='$A' and rule_code='quiz_correct';")" "10"
expect_denied "B cannot submit A's quiz"   "$(as $B authenticated "select public.submit_quiz_attempt('$QID', array[1,3]);")"
expect_eq "quiz wrong answers score 0, no XP" "$(as $A authenticated "select (public.submit_quiz_attempt('$QID', array[0,0]))->>'awarded';")" "0"

# course
expect_eq "course module 1st = 25 xp"      "$(as $A authenticated "select public.complete_course_module('abacus','m1');")" "25"
expect_eq "course module replay = 0"       "$(as $A authenticated "select public.complete_course_module('abacus','m1');")" "0"

# rooms
ROOM=$(as $A authenticated "select public.create_study_room('Physics');")
CODE=$(echo "$ROOM" | grep code | sed 's/.*"code": "\([A-Z0-9]*\)".*/\1/')
RID=$(echo "$ROOM" | grep '"id"' | sed 's/.*"id": "\([^"]*\)".*/\1/')
expect_eq "room code is 8 chars"           "$(echo -n $CODE | wc -c)" "8"
expect_eq "outsider C sees 0 rooms"        "$(as $C authenticated "select count(*) from public.study_rooms;")" "0"
expect_eq "C gets 0 member names for a room they are not in" "$(as $C authenticated "select count(*) from public.study_room_member_names('$RID');")" "0"
expect_eq "C wrong code fails"             "$(as $C authenticated "select public.join_study_room('ZZZZZZZZ');" | grep -c 'not found')" "1"
admin "insert into public.study_messages(room_id,user_id,content) values ('$RID','$A','secret homework talk');" >/dev/null
expect_eq "outsider C sees 0 messages"     "$(as $C authenticated "select count(*) from public.study_messages;")" "0"
as $B authenticated "select public.join_study_room(lower('$CODE'));" >/dev/null
expect_eq "B joins by code, sees message"  "$(as $B authenticated "select count(*) from public.study_messages;")" "1"
expect_eq "member names visible to members" "$(as $B authenticated "select count(*) from public.study_room_member_names('$RID');")" "2"
expect_denied "B still cannot insert messages directly" "$(as $B authenticated "insert into public.study_messages(room_id,user_id,content) values ('$RID','$B','hi');")"

# battles
Q='[{"question":"q1","options":["a","b","c","d"],"correct_index":0,"explanation":"e1"},{"question":"q2","options":["a","b","c","d"],"correct_index":1,"explanation":"e2"},{"question":"q3","options":["a","b","c","d"],"correct_index":2,"explanation":"e3"}]'
BID=$(as $A service_role "select public.create_battle_server('$A','Algebra','$Q'::jsonb);" | tail -1)
expect_eq "lobby shows the battle to B"    "$(as $B authenticated "select count(*) from public.list_open_battles();")" "1"
expect_denied "A cannot join own battle"   "$(as $A authenticated "select public.join_battle('$BID');")"
expect_denied "C cannot read battle state before joining" "$(as $C authenticated "select public.get_battle_state('$BID');")"
as $B authenticated "select public.join_battle('$BID');" >/dev/null
expect_denied "C cannot join a started battle" "$(as $C authenticated "select public.join_battle('$BID');")"
ST=$(as $B authenticated "select public.get_battle_state('$BID');")
if echo "$ST" | grep -q correct_index; then echo "FAIL  battle state leaks the answer key"; fail=$((fail+1)); else echo "PASS  battle state hides the answer key"; pass=$((pass+1)); fi
expect_denied "out-of-order answer rejected" "$(as $B authenticated "select public.answer_battle('$BID',2,0);")"
expect_eq "A answers q1 correctly"         "$(as $A authenticated "select (public.answer_battle('$BID',0,0))->>'correct';")" "true"
expect_eq "A cannot answer q1 twice"       "$(as $A authenticated "select public.answer_battle('$BID',0,0);" | grep -c 'out of order')" "1"
as $A authenticated "select public.answer_battle('$BID',1,1);" >/dev/null
as $A authenticated "select public.answer_battle('$BID',2,2);" >/dev/null
expect_eq "battle not finished until B answers" "$(admin "select status from public.battles where id='$BID';")" "playing"
as $B authenticated "select public.answer_battle('$BID',0,3);" >/dev/null
as $B authenticated "select public.answer_battle('$BID',1,1);" >/dev/null
FIN=$(as $B authenticated "select (public.answer_battle('$BID',2,3))->>'finished';")
expect_eq "battle finishes after both complete" "$FIN" "true"
expect_eq "A (3 pts) is the winner: score" "$(admin "select player1_score from public.battles where id='$BID';")" "3"
expect_eq "winner got 50 XP"               "$(admin "select coalesce(sum(amount),0) from public.xp_events where user_id='$A' and rule_code='battle_win';")" "50"
expect_eq "loser got participation 10 XP"  "$(admin "select coalesce(sum(amount),0) from public.xp_events where user_id='$B' and rule_code='battle_played';")" "10"
expect_denied "answers after finish rejected" "$(as $B authenticated "select public.answer_battle('$BID',2,0);")"

echo; echo "RESULT: $pass passed, $fail failed"
