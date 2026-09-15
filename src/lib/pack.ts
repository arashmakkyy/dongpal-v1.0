import type {
  Category,
  Currency,
  Expense,
  Gathering,
  Person,
  PersonColor,
} from "./types.ts";

export type SharePack = {
  v: 1;
  gathering: Gathering;
  people: Person[];
  expenses: Expense[];
};

const INVITE_KEY = "dangpal-invite";

type CompactV2 = {
  v: 2;
  g: [string, string, string, Currency, string[], number];
  p: [string, string, string, PersonColor][];
  e: [
    string,
    string,
    number,
    Category,
    string,
    string[],
    "equal" | "unequal",
    Record<string, number> | 0,
    number,
    string | 0,
  ][];
};

function toB64url(bytes: Uint8Array) {
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string) {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function toCompact(pack: SharePack): CompactV2 {
  const g = pack.gathering;
  return {
    v: 2,
    g: [
      g.sourceId || g.id,
      g.name,
      g.cover,
      g.currency,
      g.memberIds,
      g.createdAt,
    ],
    p: pack.people.map((p) => [
      p.id,
      p.name,
      p.avatar.startsWith("data:") ? "" : p.avatar,
      p.color,
    ]),
    e: pack.expenses.map((e) => [
      e.id,
      e.title,
      e.amount,
      e.category,
      e.payerId,
      e.participantIds,
      e.split,
      e.split === "unequal" && e.shares ? e.shares : 0,
      e.date,
      e.note || 0,
    ]),
  };
}

function fromCompact(c: CompactV2): SharePack {
  const [id, name, cover, currency, memberIds, createdAt] = c.g;
  return {
    v: 1,
    gathering: {
      id,
      name,
      cover: cover || "/covers/cafe.jpg",
      memberIds,
      currency,
      createdAt,
      sourceId: id,
      archived: false,
    },
    people: c.p.map(([pid, pname, avatar, color]) => ({
      id: pid,
      name: pname,
      avatar,
      color,
    })),
    expenses: c.e.map((row) => {
      const [eid, title, amount, category, payerId, participantIds, split, shares, date, note] =
        row;
      return {
        id: eid,
        gatheringId: id,
        title,
        amount,
        category,
        payerId,
        participantIds,
        split,
        shares: shares === 0 ? undefined : shares,
        note: note === 0 ? undefined : note,
        date,
        createdAt: date,
      };
    }),
  };
}

export function encodePack(pack: SharePack): string {
  const slim: SharePack = {
    v: 1,
    gathering: { ...pack.gathering, archived: false },
    people: pack.people.map((p) => ({
      ...p,
      isMe: false,
      avatar: p.avatar.startsWith("data:") ? "" : p.avatar,
    })),
    expenses: pack.expenses.map((e) => ({
      ...e,
      receiptImage: undefined,
    })),
  };
  const json = JSON.stringify(toCompact(slim));
  return toB64url(new TextEncoder().encode(json));
}

export function decodePack(raw: string): SharePack | null {
  if (!raw) return null;
  try {
    let s = raw.trim();
    if (s.startsWith("#")) s = s.slice(1);
    if (s.startsWith("p=")) s = s.slice(2);
    try {
      s = decodeURIComponent(s);
    } catch {
      /* already decoded */
    }
    const json = new TextDecoder().decode(fromB64url(s));
    const data = JSON.parse(json) as SharePack | CompactV2;
    if (!data || typeof data !== "object") return null;
    if ((data as CompactV2).v === 2) return fromCompact(data as CompactV2);
    const v1 = data as SharePack;
    if (v1.v === 1 && v1.gathering?.name && Array.isArray(v1.people) && Array.isArray(v1.expenses)) {
      return v1;
    }
    return null;
  } catch {
    return null;
  }
}

export function packFromState(
  gathering: Gathering,
  people: Person[],
  expenses: Expense[],
): SharePack {
  const members = people.filter((p) => gathering.memberIds.includes(p.id));
  const hostTag = `h-${gathering.id.replace(/[^a-z0-9]/gi, "").slice(-8) || "host"}`;
  const idMap = new Map<string, string>();
  const packedPeople: Person[] = members.map((p) => {
    const id = p.isMe || p.id === "me" ? hostTag : p.id;
    idMap.set(p.id, id);
    return {
      ...p,
      id,
      isMe: false,
      avatar: p.avatar.startsWith("data:") ? "" : p.avatar,
    };
  });
  const mappedIds = gathering.memberIds.map((id) => idMap.get(id) ?? id);
  const packedExpenses: Expense[] = expenses
    .filter((e) => e.gatheringId === gathering.id)
    .map((e) => {
      const shares = e.shares
        ? Object.fromEntries(
            Object.entries(e.shares).map(([k, v]) => [idMap.get(k) ?? k, v]),
          )
        : undefined;
      return {
        ...e,
        payerId: idMap.get(e.payerId) ?? e.payerId,
        participantIds: e.participantIds.map((id) => idMap.get(id) ?? id),
        shares,
        receiptImage: undefined,
      };
    });
  const sourceId = gathering.sourceId || gathering.id;
  return {
    v: 1,
    gathering: {
      ...gathering,
      id: sourceId,
      sourceId,
      memberIds: mappedIds,
      archived: false,
    },
    people: packedPeople,
    expenses: packedExpenses,
  };
}

export function joinUrl(encoded: string) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  // Query survives in-app browsers that drop the hash; hash survives long URLs.
  if (encoded.length <= 1600) return `${origin}/join?p=${encoded}`;
  return `${origin}/join#${encoded}`;
}

export function readJoinHash(hash = ""): string {
  const h = hash.startsWith("#") ? hash.slice(1) : hash;
  return h;
}

export function readInviteFromLocation(loc: Pick<Location, "search" | "hash"> = typeof window === "undefined" ? { search: "", hash: "" } : window.location): string {
  const q = new URLSearchParams(loc.search).get("p") || "";
  return q || readJoinHash(loc.hash);
}

export function stashInvite(raw: string) {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(INVITE_KEY, raw);
  } catch {
    /* private mode quota */
  }
}

export function peekInvite(): string {
  if (typeof sessionStorage === "undefined") return "";
  try {
    return sessionStorage.getItem(INVITE_KEY) || "";
  } catch {
    return "";
  }
}

export function clearInvite() {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.removeItem(INVITE_KEY);
  } catch {
    /* ignore */
  }
}
