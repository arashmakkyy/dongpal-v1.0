-- Supabase Realtime backing for capability-token gathering rooms.
-- The invite token is the authorization boundary; there is no list endpoint.
alter table gathering_rooms enable row level security;

drop policy if exists "room token read" on gathering_rooms;
drop policy if exists "room token write" on gathering_rooms;

create policy "room token read"
  on gathering_rooms for select
  using (true);

create policy "room token write"
  on gathering_rooms for insert
  with check (true);

create policy "room token update"
  on gathering_rooms for update
  using (true)
  with check (true);

alter table gathering_rooms replica identity full;

-- Supabase has this publication; the local PGlite fallback does not.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table gathering_rooms;
    exception when duplicate_object then
      null;
    end;
  end if;
end $$;
