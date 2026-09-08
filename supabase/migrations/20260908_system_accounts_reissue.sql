-- Re-issue the guides-bot system account.
--
-- The original auth user (b749a7b5-…) was deleted from the dashboard some time
-- after 2026-08-05. system_accounts.user_id is `references auth.users on delete
-- cascade`, so that row went with it — and so did the bot's boards and links.
-- The public /share/ pages survived because shared_boards carries its own
-- snapshot and does not cascade.
--
-- The account was recreated on 2026-09-08 with a new UID. Nothing else about
-- the design changes: this is an allowlist that only lifts the account's own
-- board cap.

delete from public.system_accounts
 where user_id = 'b749a7b5-ccb6-432f-b475-2abc424d3ff5';

insert into public.system_accounts (user_id, note)
values (
  '936d3b54-241b-4c6e-b276-9f4713509fb4',
  'SaveBoard Guides — publishes one public board per /guides/ post. DO NOT DELETE: removing this auth user drops its boards and this row.'
)
on conflict (user_id) do update set note = excluded.note;

select user_id, note from public.system_accounts;
