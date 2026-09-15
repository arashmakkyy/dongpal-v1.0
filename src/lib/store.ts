import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Category,
  Currency,
  Expense,
  Gathering,
  Person,
  PersonColor,
  Profile,
} from "./types";
import { PERSON_COLORS } from "./types";
import { seedNow } from "./seed";
import { uid } from "./utils";

type DraftExpense = {
  gatheringId: string;
  title: string;
  amount: number;
  category: Category;
  payerId: string;
  participantIds: string[];
  split: "equal" | "unequal";
  shares: Record<string, number>;
  note: string;
  date: number;
  receiptImage?: string;
};

type State = {
  hydrated: boolean;
  people: Person[];
  gatherings: Gathering[];
  expenses: Expense[];
  profile: Profile;
  draft: DraftExpense | null;
  setHydrated: () => void;
  setSeenWelcome: () => void;
  updateProfile: (p: Partial<Profile>) => void;
  addPerson: (name: string, avatar?: string) => string;
  updatePerson: (id: string, patch: Partial<Person>) => void;
  removePerson: (id: string) => void;
  addGathering: (g: Omit<Gathering, "id" | "createdAt">) => string;
  updateGathering: (id: string, patch: Partial<Gathering>) => void;
  deleteGathering: (id: string) => void;
  addExpense: (e: Omit<Expense, "id" | "createdAt">) => string;
  updateExpense: (id: string, patch: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  setDraft: (d: DraftExpense | null) => void;
  patchDraft: (p: Partial<DraftExpense>) => void;
  resetDemo: () => void;
  startFresh: () => void;
  importGathering: (payload: {
    gathering: Gathering;
    people: Person[];
    expenses: Expense[];
  }) => string;
  joinGathering: (
    payload: {
      gathering: Gathering;
      people: Person[];
      expenses: Expense[];
    },
    claimId: string | "new",
  ) => string;
};

function nextColor(people: Person[]): PersonColor {
  return PERSON_COLORS[people.length % PERSON_COLORS.length];
}

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

const seeded = seedNow();

export const useDang = create<State>()(
  persist(
    (set, get) => ({
      hydrated: false,
      people: seeded.people,
      gatherings: seeded.gatherings,
      expenses: seeded.expenses,
      profile: seeded.profile,
      draft: null,
      setHydrated: () => {
        if (get().hydrated) return;
        set({ hydrated: true });
      },
      setSeenWelcome: () =>
        set({ profile: { ...get().profile, seenWelcome: true } }),
      updateProfile: (p) => {
        const profile = { ...get().profile, ...p };
        set({ profile });
        if (p.name || p.avatar) {
          set({
            people: get().people.map((x) =>
              x.isMe
                ? {
                    ...x,
                    name: profile.name,
                    avatar: profile.avatar,
                  }
                : x,
            ),
          });
        }
      },
      addPerson: (name, avatar) => {
        const id = uid("p-");
        const person: Person = {
          id,
          name: name.trim() || "دوست جدید",
          avatar: avatar || "",
          color: nextColor(get().people),
        };
        set({ people: [...get().people, person] });
        return id;
      },
      updatePerson: (id, patch) =>
        set({
          people: get().people.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        }),
      removePerson: (id) => {
        const person = get().people.find((p) => p.id === id);
        if (!person || person.isMe) return;
        set({
          people: get().people.filter((p) => p.id !== id),
          gatherings: get().gatherings.map((g) => ({
            ...g,
            memberIds: g.memberIds.filter((m) => m !== id),
          })),
        });
      },
      addGathering: (g) => {
        const id = uid("g-");
        const gathering: Gathering = {
          ...g,
          id,
          createdAt: Date.now(),
          memberIds: g.memberIds.length ? g.memberIds : ["me"],
        };
        set({ gatherings: [gathering, ...get().gatherings] });
        return id;
      },
      updateGathering: (id, patch) =>
        set({
          gatherings: get().gatherings.map((g) =>
            g.id === id ? { ...g, ...patch } : g,
          ),
        }),
      deleteGathering: (id) =>
        set({
          gatherings: get().gatherings.filter((g) => g.id !== id),
          expenses: get().expenses.filter((e) => e.gatheringId !== id),
        }),
      addExpense: (e) => {
        const id = uid("e-");
        const expense: Expense = { ...e, id, createdAt: Date.now() };
        set({ expenses: [expense, ...get().expenses] });
        return id;
      },
      updateExpense: (id, patch) =>
        set({
          expenses: get().expenses.map((e) =>
            e.id === id ? { ...e, ...patch } : e,
          ),
        }),
      deleteExpense: (id) =>
        set({ expenses: get().expenses.filter((e) => e.id !== id) }),
      setDraft: (d) => set({ draft: d }),
      patchDraft: (p) => {
        const d = get().draft;
        if (!d) return;
        set({ draft: { ...d, ...p } });
      },
      resetDemo: () => {
        const s = seedNow();
        set({
          people: s.people,
          gatherings: s.gatherings,
          expenses: s.expenses,
          profile: { ...s.profile, seenWelcome: true },
          draft: null,
        });
      },
      startFresh: () => {
        const me: Person = {
          id: "me",
          name: get().profile.name || "من",
          avatar: get().profile.avatar,
          color: "person-5",
          isMe: true,
        };
        set({
          people: [me],
          gatherings: [],
          expenses: [],
          draft: null,
          profile: { ...get().profile, seenWelcome: false },
        });
      },
      joinGathering: (payload, claimId) => {
        const sourceId = payload.gathering.sourceId || payload.gathering.id;
        const already = get().gatherings.find(
          (g) => g.sourceId === sourceId || g.id === sourceId,
        );
        if (already) return already.id;

        const me = get().people.find((p) => p.isMe);
        const meId = me?.id ?? "me";
        const newId = uid("g-");

        let memberIds = [...payload.gathering.memberIds];
        let expenses: Expense[] = payload.expenses.map((e) => {
          const { receiptImage: _r, ...rest } = e;
          return {
            ...rest,
            id: uid("e-"),
            gatheringId: newId,
          };
        });
        let incoming = payload.people.filter((p) => p.id !== meId);

        if (claimId !== "new") {
          memberIds = memberIds.map((id) => (id === claimId ? meId : id));
          expenses = expenses.map((e) => remapExpense(e, claimId, meId));
          incoming = incoming.filter((p) => p.id !== claimId);
        } else if (!memberIds.includes(meId)) {
          memberIds = [meId, ...memberIds];
        }

        const existingIds = new Set(get().people.map((p) => p.id));
        const extra = incoming
          .filter((p) => !existingIds.has(p.id))
          .map(({ isMe: _ignored, ...p }) => p);

        const gathering: Gathering = {
          ...payload.gathering,
          id: newId,
          sourceId,
          memberIds: [...new Set(memberIds)],
          createdAt: Date.now(),
          archived: false,
        };

        set({
          people: [...get().people, ...extra],
          gatherings: [gathering, ...get().gatherings],
          expenses: [...expenses, ...get().expenses],
          profile: { ...get().profile, seenWelcome: true },
        });
        return newId;
      },
      importGathering: ({ gathering, people, expenses }) => {
        return get().joinGathering({ gathering, people, expenses }, "new");
      },
    }),
    {
      name: "dangpal-v2",
      partialize: (s) => ({
        people: s.people,
        gatherings: s.gatherings,
        expenses: s.expenses,
        profile: s.profile,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);

export function makeDraft(
  gatheringId: string,
  defaults: {
    payerId: string;
    participantIds: string[];
    currency?: Currency;
  },
): DraftExpense {
  return {
    gatheringId,
    title: "",
    amount: 0,
    category: "food",
    payerId: defaults.payerId,
    participantIds: [...defaults.participantIds],
    split: "equal",
    shares: {},
    note: "",
    date: Date.now(),
  };
}
