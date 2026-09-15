import type { Expense, Gathering, Person, Profile } from "./types.ts";
import { canonicalMeId, type SharePack } from "./pack.ts";

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
  if (!from || from === to) return e;
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
  const myClaim = claimId === "new" ? nid("p-") : claimId;

  let memberIds = [...payload.gathering.memberIds];
  let expenses: Expense[] = payload.expenses.map((e) => {
    const { receiptImage: _r, ...rest } = e;
    return {
      ...rest,
      id: e.id,
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
    claimId: myClaim,
    syncId: payload.gathering.syncId,
    syncRev: 0,
    tombstones: [],
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

/** Overlay a canonical remote pack onto an already-joined local gathering. */
export function applyRemote(
  state: JoinState,
  gatheringId: string,
  pack: SharePack,
): JoinState {
  const current = state.gatherings.find((g) => g.id === gatheringId);
  if (!current) return state;
  const me = state.people.find((p) => p.isMe);
  const meId = me?.id ?? "me";
  const claimId = current.claimId || canonicalMeId(current);

  const remapId = (id: string) => (id === claimId ? meId : id);

  const memberIds = [...new Set(pack.gathering.memberIds.map(remapId))];

  const remappedExpenses = pack.expenses.map((e) => {
    const { receiptImage: _r, ...rest } = remapExpense(e, claimId, meId);
    return {
      ...rest,
      gatheringId,
    };
  });

  const incoming = pack.people.filter((p) => p.id !== claimId && p.id !== meId);
  const existingIds = new Set(state.people.map((p) => p.id));
  const extra = incoming
    .filter((p) => !existingIds.has(p.id))
    .map(({ isMe: _ignored, ...p }) => p);

  const people = [
    ...state.people.map((p) => {
      if (p.isMe || p.id === meId) return p;
      const src = pack.people.find((x) => x.id === p.id);
      if (!src) return p;
      return {
        ...p,
        name: src.name,
        avatar: src.avatar || p.avatar,
        color: src.color,
      };
    }),
    ...extra,
  ];

  const localById = new Map(
    state.expenses
      .filter((e) => e.gatheringId === gatheringId)
      .map((e) => [e.id, e]),
  );
  const others = state.expenses.filter((e) => e.gatheringId !== gatheringId);
  const expenses = [
    ...remappedExpenses.map((e) => ({
      ...e,
      receiptImage: localById.get(e.id)?.receiptImage,
    })),
    ...others,
  ];

  const gatherings = state.gatherings.map((g) =>
    g.id === gatheringId
      ? {
          ...g,
          name: pack.gathering.name,
          cover: pack.gathering.cover || g.cover,
          currency: pack.gathering.currency,
          memberIds,
          sourceId: pack.gathering.sourceId || g.sourceId,
          syncId: pack.gathering.syncId || g.syncId,
          archived: pack.gathering.archived,
        }
      : g,
  );

  return { ...state, people, gatherings, expenses };
}
