import type { Expense, Gathering, Person, Profile } from "./types.ts";
import type { SharePack } from "./pack.ts";

function nid(prefix: string) {
  return `${prefix}${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;
}

export type JoinState = {
  people: Person[];
  gatherings: Gathering[];
  expenses: Expense[];
  profile: Profile;
};

export type JoinExtras = {
  name?: string;
  avatar?: string;
};

function remapExpense(e: Expense, from: string, to: string): Expense {
  const shares = e.shares
    ? Object.fromEntries(
        Object.entries(e.shares).map(([k, v]) => [k === from ? to : k, v]),
      )
    : e.shares;
  return {
    ...e,
    payerId: e.payerId === from ? to : e.payerId,
    participantIds: e.participantIds.map((id) => (id === from ? to : id)),
    shares,
  };
}

export function packSourceId(pack: SharePack): string {
  return pack.gathering.sourceId || pack.gathering.id;
}

export function findJoinedGathering(
  gatherings: Gathering[],
  sourceId: string,
): Gathering | undefined {
  return gatherings.find(
    (g) => g.sourceId === sourceId || g.id === sourceId,
  );
}

function isGenericName(name: string) {
  const n = name.trim();
  return !n || n === "من";
}

/**
 * Apply an invite pack onto local state. Returns `alreadyId` when this device
 * already hosts or joined the same gathering — never silently swallow a new
 * user's empty store, because seed ids are not present there.
 */
export function applyJoin(
  state: JoinState,
  payload: SharePack,
  claimId: string | "new",
  extras: JoinExtras = {},
): { alreadyId: string } | (JoinState & { gatheringId: string }) {
  const sourceId = packSourceId(payload);
  const already = findJoinedGathering(state.gatherings, sourceId);
  if (already) return { alreadyId: already.id };

  const me = state.people.find((p) => p.isMe);
  const meId = me?.id ?? "me";
  const newId = nid("g-");

  let memberIds = [...payload.gathering.memberIds];
  let expenses: Expense[] = payload.expenses.map((e) => {
    const { receiptImage: _r, ...rest } = e;
    return {
      ...rest,
      id: nid("e-"),
      gatheringId: newId,
    };
  });
  let incoming = payload.people.filter((p) => p.id !== meId);

  const claimed =
    claimId !== "new" ? payload.people.find((p) => p.id === claimId) : undefined;

  if (claimed) {
    memberIds = memberIds.map((id) => (id === claimId ? meId : id));
    expenses = expenses.map((e) => remapExpense(e, claimId, meId));
    incoming = incoming.filter((p) => p.id !== claimId);
  } else if (!memberIds.includes(meId)) {
    memberIds = [meId, ...memberIds];
  }

  const existingIds = new Set(state.people.map((p) => p.id));
  const extra = incoming
    .filter((p) => !existingIds.has(p.id))
    .map(({ isMe: _ignored, ...p }) => p);

  const nextName = (extras.name?.trim() ||
    (claimed && isGenericName(state.profile.name) ? claimed.name : "") ||
    state.profile.name ||
    "من").trim();
  const nextAvatar =
    extras.avatar ||
    (claimed && !state.profile.avatar ? claimed.avatar : "") ||
    state.profile.avatar;

  const people = [
    ...state.people.map((p) =>
      p.isMe || p.id === meId
        ? { ...p, name: nextName, avatar: nextAvatar }
        : p,
    ),
    ...extra,
  ];

  const gathering: Gathering = {
    ...payload.gathering,
    id: newId,
    sourceId,
    memberIds: [...new Set(memberIds)],
    createdAt: Date.now(),
    archived: false,
  };

  return {
    people,
    gatherings: [gathering, ...state.gatherings],
    expenses: [...expenses, ...state.expenses],
    profile: {
      ...state.profile,
      name: nextName,
      avatar: nextAvatar,
      seenWelcome: true,
    },
    gatheringId: newId,
  };
}
