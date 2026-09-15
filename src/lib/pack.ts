import type { Expense, Gathering, Person } from "./types";

export type SharePack = {
  v: 1;
  gathering: Gathering;
  people: Person[];
  expenses: Expense[];
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

export function encodePack(pack: SharePack): string {
  const slim: SharePack = {
    v: 1,
    gathering: {
      ...pack.gathering,
      archived: false,
    },
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
  const json = JSON.stringify(slim);
  return toB64url(new TextEncoder().encode(json));
}

export function decodePack(raw: string): SharePack | null {
  try {
    const json = new TextDecoder().decode(fromB64url(raw.trim()));
    const data = JSON.parse(json) as SharePack;
    if (!data || data.v !== 1 || !data.gathering?.name) return null;
    if (!Array.isArray(data.people) || !Array.isArray(data.expenses)) return null;
    return data;
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
  return {
    v: 1,
    gathering: {
      ...gathering,
      memberIds: mappedIds,
      archived: false,
    },
    people: packedPeople,
    expenses: packedExpenses,
  };
}

export function joinUrl(encoded: string) {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/join#${encoded}`;
}

export function readJoinHash(hash = ""): string {
  const h = hash.startsWith("#") ? hash.slice(1) : hash;
  return h;
}
