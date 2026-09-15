import type { Expense, Person } from "./types.ts";
import type { SharePack } from "./pack.ts";

export type RoomPayload = {
  pack: SharePack;
  tombstones: string[];
};

export function fingerprintPack(pack: SharePack, tombstones: string[] = []) {
  const people = [...pack.people]
    .map((p) => `${p.id}:${p.name}:${p.avatar}:${p.color}`)
    .sort();
  const expenses = [...pack.expenses]
    .map(
      (e) =>
        `${e.id}:${e.title}:${e.amount}:${e.category}:${e.payerId}:${e.participantIds.join(",")}:${e.split}:${JSON.stringify(e.shares ?? {})}:${e.date}:${e.note ?? ""}`,
    )
    .sort();
  const tombs = [...tombstones].sort();
  const g = pack.gathering;
  return JSON.stringify({
    n: g.name,
    c: g.cover,
    u: g.currency,
    m: [...g.memberIds].sort(),
    people,
    expenses,
    tombs,
  });
}

function newerExpense(a: Expense, b: Expense) {
  const au = a.updatedAt ?? a.createdAt ?? a.date;
  const bu = b.updatedAt ?? b.createdAt ?? b.date;
  return au >= bu ? a : b;
}

export function mergePacks(
  remote: SharePack,
  local: SharePack,
  remoteTombs: string[] = [],
  localTombs: string[] = [],
): { pack: SharePack; tombstones: string[] } {
  const tombstones = [...new Set([...remoteTombs, ...localTombs])];
  const deleted = new Set(tombstones);

  const byId = new Map<string, Expense>();
  for (const e of remote.expenses) {
    if (!deleted.has(e.id)) byId.set(e.id, e);
  }
  for (const e of local.expenses) {
    if (deleted.has(e.id)) continue;
    const prev = byId.get(e.id);
    byId.set(e.id, prev ? newerExpense(prev, e) : e);
  }

  const peopleById = new Map<string, Person>();
  for (const p of remote.people) {
    peopleById.set(p.id, { ...p, isMe: false });
  }
  for (const p of local.people) {
    peopleById.set(p.id, { ...peopleById.get(p.id), ...p, isMe: false });
  }

  const memberIds = [
    ...new Set([...remote.gathering.memberIds, ...local.gathering.memberIds]),
  ].filter((id) => peopleById.has(id));

  return {
    pack: {
      v: 1,
      gathering: {
        ...remote.gathering,
        name: local.gathering.name || remote.gathering.name,
        cover: local.gathering.cover || remote.gathering.cover,
        currency: local.gathering.currency || remote.gathering.currency,
        memberIds,
        syncId: local.gathering.syncId || remote.gathering.syncId,
        archived: local.gathering.archived ?? remote.gathering.archived,
      },
      people: [...peopleById.values()],
      expenses: [...byId.values()],
    },
    tombstones,
  };
}

export function parseRoomPayload(raw: unknown): RoomPayload | null {
  try {
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!data || typeof data !== "object") return null;
    const pack = (data as RoomPayload).pack;
    if (!pack?.gathering?.name || !Array.isArray(pack.people) || !Array.isArray(pack.expenses)) {
      return null;
    }
    const tombstones = Array.isArray((data as RoomPayload).tombstones)
      ? (data as RoomPayload).tombstones.filter((x) => typeof x === "string")
      : [];
    return { pack, tombstones: tombstones.slice(-200) };
  } catch {
    return null;
  }
}

export function serializeRoomPayload(payload: RoomPayload): string {
  return JSON.stringify({
    pack: payload.pack,
    tombstones: payload.tombstones.slice(-200),
  });
}

export const MAX_PAYLOAD_CHARS = 120_000;
