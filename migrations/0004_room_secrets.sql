-- Lockdown for gathering_rooms: per-room write secret + close open anon access.
-- Applies cleanly on Neon/PGLite (server connects as owner, bypasses RLS)
-- and on Supabase (run this file in the Supabase SQL editor too).
alter table if exists gathering_rooms
  add column if not exists write_secret text;

-- Close the wide-open anon policies from 0003_supabase_realtime.sql.
drop policy if exists "room token read" on gathering_rooms;
drop policy if exists "room token write" on gathering_rooms;
drop policy if exists "room token update" on gathering_rooms;

-- Deny direct anon access: all reads/writes go through server functions
-- (src/lib/room-api.ts) which connect with the privileged connection string.
-- No anon policy = deny by default under RLS. Keep RLS enabled.
alter table gathering_rooms enable row level security;

-- Belt-and-suspenders for Supabase: explicitly revoke PostgREST access.
-- (No-op on Neon/PGLite if the role does not exist — wrapped so it never fails.)
do $$
begin
  begin
    revoke all on gathering_rooms from anon;
  exception when undefined_object then null;
  end;
  begin
    revoke all on gathering_rooms from authenticated;
  exception when undefined_object then null;
  end;
end $$;
