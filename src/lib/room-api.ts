import { createServerFn } from "@tanstack/react-start";
import { ROOM_ID_RE } from "./pack";
import {
  MAX_PAYLOAD_CHARS,
  parseRoomPayload,
  serializeRoomPayload,
  type RoomPayload,
} from "./sync-core";

function newRoomId() {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function assertRoomId(id: unknown): string {
  if (typeof id !== "string" || !ROOM_ID_RE.test(id)) {
    throw new Error("invalid_room");
  }
  return id;
}

function assertPayload(raw: unknown): RoomPayload {
  const parsed = parseRoomPayload(raw);
  if (!parsed) throw new Error("invalid_payload");
  if (parsed.pack.people.length > 24) throw new Error("too_many_people");
  if (parsed.pack.expenses.length > 200) throw new Error("too_many_expenses");
  const text = serializeRoomPayload(parsed);
  if (text.length > MAX_PAYLOAD_CHARS) throw new Error("payload_too_large");
  return parsed;
}

export type PullOk = { ok: true; id: string; rev: number; payload: RoomPayload };
export type PullMiss = { ok: false; error: "not_found" };
export type PushOk = { ok: true; id: string; rev: number };
export type PushConflict = {
  ok: false;
  conflict: true;
  id: string;
  rev: number;
  payload: RoomPayload;
};
export type CreateOk = { ok: true; id: string; rev: number };

export const createRoom = createServerFn({ method: "POST" })
  .validator((d: { payload: RoomPayload }) => ({
    payload: assertPayload(d?.payload),
  }))
  .handler(async ({ data }): Promise<CreateOk> => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const id = newRoomId();
    const text = serializeRoomPayload(data.payload);
    await sql.query(
      "insert into gathering_rooms (id, rev, payload, updated_at) values ($1, 1, $2, now())",
      [id, text],
    );
    return { ok: true, id, rev: 1 };
  });

export const pullRoom = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => ({ id: assertRoomId(d?.id) }))
  .handler(async ({ data }): Promise<PullOk | PullMiss> => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql.query<{ id: string; rev: number; payload: string }>(
      "select id, rev, payload from gathering_rooms where id = $1",
      [data.id],
    );
    const row = rows[0];
    if (!row) return { ok: false, error: "not_found" };
    const payload = parseRoomPayload(row.payload);
    if (!payload) return { ok: false, error: "not_found" };
    return { ok: true, id: row.id, rev: Number(row.rev), payload };
  });

export const pushRoom = createServerFn({ method: "POST" })
  .validator((d: { id: string; rev: number; payload: RoomPayload }) => ({
    id: assertRoomId(d?.id),
    rev: Number.isFinite(d?.rev) ? Math.max(0, Math.floor(d.rev)) : 0,
    payload: assertPayload(d?.payload),
  }))
  .handler(async ({ data }): Promise<PushOk | PushConflict> => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const text = serializeRoomPayload(data.payload);
    const updated = await sql.query<{ rev: number }>(
      `update gathering_rooms
       set payload = $1, rev = rev + 1, updated_at = now()
       where id = $2 and rev = $3
       returning rev`,
      [text, data.id, data.rev],
    );
    if (updated[0]) {
      return { ok: true, id: data.id, rev: Number(updated[0].rev) };
    }
    const rows = await sql.query<{ id: string; rev: number; payload: string }>(
      "select id, rev, payload from gathering_rooms where id = $1",
      [data.id],
    );
    const row = rows[0];
    if (!row) {
      await sql.query(
        "insert into gathering_rooms (id, rev, payload, updated_at) values ($1, $2, $3, now())",
        [data.id, 1, text],
      );
      return { ok: true, id: data.id, rev: 1 };
    }
    const payload = parseRoomPayload(row.payload);
    if (!payload) throw new Error("corrupt_room");
    return {
      ok: false,
      conflict: true,
      id: row.id,
      rev: Number(row.rev),
      payload,
    };
  });
