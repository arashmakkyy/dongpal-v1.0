import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ROOM_ID_RE } from "./pack";
import {
  MAX_PAYLOAD_CHARS,
  parseRoomPayload,
  serializeRoomPayload,
  type RoomPayload,
} from "./sync-core";

// ---------------------------------------------------------------------------
// Security model (auth OFF, invite-link app):
// - Reading a room requires knowing its unguessable 24-char id (the invite link).
// - Writing requires the per-room `write_secret` issued at creation.
// - All DB access happens here, server-side (owner connection). The browser
//   never talks to Postgres/Supabase directly, so RLS can stay deny-all.
// ---------------------------------------------------------------------------

function newRoomId() {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function newRoomSecret() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const SECRET_RE = /^[A-Za-z0-9_-]{16,64}$/;

// --- Strict content validation (abuse / stored-content hardening) -----------
const personSchema = z.object({
  id: z.string().min(1).max(64),
  name: z.string().min(1).max(80),
  avatar: z.string().max(2000),
  color: z.string().max(32),
});

const expenseSchema = z.object({
  id: z.string().min(1).max(64),
  title: z.string().min(1).max(200),
  amount: z.number().int().min(0).max(1_000_000_000_000),
  category: z.string().max(32),
  payerId: z.string().min(1).max(64),
  participantIds: z.array(z.string().min(1).max(64)).max(24),
  split: z.enum(["equal", "unequal"]),
  note: z.string().max(500).optional(),
  date: z.number().finite(),
});

function assertRoomId(id: unknown): string {
  if (typeof id !== "string" || !ROOM_ID_RE.test(id)) {
    throw new Error("invalid_room");
  }
  return id;
}

function assertSecret(secret: unknown): string {
  if (typeof secret !== "string" || !SECRET_RE.test(secret)) {
    throw new Error("invalid_secret");
  }
  return secret;
}

function assertPayload(raw: unknown): RoomPayload {
  const parsed = parseRoomPayload(raw);
  if (!parsed) throw new Error("invalid_payload");
  if (parsed.pack.people.length > 24) throw new Error("too_many_people");
  if (parsed.pack.expenses.length > 200) throw new Error("too_many_expenses");
  if ((parsed.tombstones?.length ?? 0) > 200) throw new Error("too_many_tombstones");

  // Deep zod checks — prevents oversized strings / negative amounts persisting
  // and re-rendering on every device.
  const gatheringName = parsed.pack.gathering?.name;
  if (typeof gatheringName !== "string" || gatheringName.length > 200) {
    throw new Error("invalid_gathering");
  }
  for (const p of parsed.pack.people) {
    const r = personSchema.safeParse({
      id: (p as { id?: unknown }).id,
      name: (p as { name?: unknown }).name,
      avatar: typeof (p as { avatar?: unknown }).avatar === "string" ? p.avatar : "",
      color: typeof (p as { color?: unknown }).color === "string" ? p.color : "person-1",
    });
    if (!r.success) throw new Error("invalid_person");
  }
  for (const e of parsed.pack.expenses) {
    const r = expenseSchema.safeParse({
      id: (e as { id?: unknown }).id,
      title: (e as { title?: unknown }).title,
      amount: (e as { amount?: unknown }).amount,
      category: (e as { category?: unknown }).category,
      payerId: (e as { payerId?: unknown }).payerId,
      participantIds: (e as { participantIds?: unknown }).participantIds,
      split: (e as { split?: unknown }).split,
      note: typeof (e as { note?: unknown }).note === "string" ? e.note : undefined,
      date: (e as { date?: unknown }).date,
    });
    if (!r.success) throw new Error("invalid_expense");
  }

  const text = serializeRoomPayload(parsed);
  if (text.length > MAX_PAYLOAD_CHARS) throw new Error("payload_too_large");
  return parsed;
}

// --- Minimal in-process rate limiting (per server instance) -----------------
// Prevents trivial DB-fill loops. Not a substitute for edge rate limiting,
// but stops the cheapest abuse with zero infra.
const bucketGlobal = globalThis as typeof globalThis & {
  __roomRate__?: Map<string, { count: number; reset: number }>;
};
function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const map = (bucketGlobal.__roomRate__ ??= new Map());
  const cur = map.get(key);
  if (!cur || now > cur.reset) {
    map.set(key, { count: 1, reset: now + windowMs });
    return;
  }
  cur.count += 1;
  if (cur.count > max) throw new Error("rate_limited");
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
export type PushDenied = { ok: false; error: "forbidden" | "not_found" };
export type CreateOk = { ok: true; id: string; rev: number; secret: string };

export const createRoom = createServerFn({ method: "POST" })
  .validator((d: { payload: RoomPayload }) => ({
    payload: assertPayload(d?.payload),
  }))
  .handler(async ({ data }): Promise<CreateOk> => {
    rateLimit("createRoom", 30, 60_000);
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const id = newRoomId();
    const secret = newRoomSecret();
    const text = serializeRoomPayload(data.payload);
    try {
      await sql.query(
        "insert into gathering_rooms (id, rev, payload, write_secret, updated_at) values ($1, 1, $2, $3, now())",
        [id, text, secret],
      );
    } catch (err) {
      // Rollout window: column may not exist yet on a DB that hasn't migrated.
      if ((err as { code?: string })?.code === "42703") {
        await sql.query(
          "insert into gathering_rooms (id, rev, payload, updated_at) values ($1, 1, $2, now())",
          [id, text],
        );
      } else {
        throw err;
      }
    }
    return { ok: true, id, rev: 1, secret };
  });

export const pullRoom = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => ({ id: assertRoomId(d?.id) }))
  .handler(async ({ data }): Promise<PullOk | PullMiss> => {
    rateLimit("pullRoom", 300, 60_000);
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
  .validator((d: { id: string; rev: number; secret: string; payload: RoomPayload }) => ({
    id: assertRoomId(d?.id),
    rev: Number.isFinite(d?.rev) ? Math.max(0, Math.floor(d.rev)) : 0,
    secret: assertSecret(d?.secret),
    payload: assertPayload(d?.payload),
  }))
  .handler(async ({ data }): Promise<PushOk | PushConflict | PushDenied> => {
    rateLimit("pushRoom", 300, 60_000);
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const text = serializeRoomPayload(data.payload);

    // Read current row + stored secret (tolerate pre-migration DBs without column).
    let rows: { id: string; rev: number; payload: string; write_secret: string | null }[];
    try {
      rows = await sql.query(
        "select id, rev, payload, write_secret from gathering_rooms where id = $1",
        [data.id],
      );
    } catch (err) {
      if ((err as { code?: string })?.code === "42703") {
        rows = (
          await sql.query<{ id: string; rev: number; payload: string }>(
            "select id, rev, payload from gathering_rooms where id = $1",
            [data.id],
          )
        ).map((r) => ({ ...r, write_secret: null }));
      } else {
        throw err;
      }
    }
    const row = rows[0];
    // No squatting: pushes can only update a room created via createRoom.
    // (Legacy open rooms with NULL secret are claimable once — first writer sets it.)
    if (!row) return { ok: false, error: "not_found" };
    if (row.write_secret && row.write_secret !== data.secret) {
      return { ok: false, error: "forbidden" };
    }
    if (!row.write_secret) {
      try {
        await sql.query("update gathering_rooms set write_secret = $1 where id = $2", [
          data.secret,
          data.id,
        ]);
      } catch {
        /* pre-migration DB — accept the write */
      }
    }

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
