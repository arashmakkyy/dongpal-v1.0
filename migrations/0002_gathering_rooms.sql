-- Secret-token rooms for live gathering sync. Rows are unowned (auth off):
-- access is the unguessable id in the invite link. No list-all endpoint.
create table if not exists gathering_rooms (
  id text primary key,
  rev integer not null default 0,
  payload text not null,
  updated_at timestamptz not null default now()
);
