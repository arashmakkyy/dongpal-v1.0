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
import { emptyNow, seedNow } from "./seed";
import { uid } from "./utils";
import { applyJoin, type JoinExtras } from "./join";
import type { SharePack } from "./pack";

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
  importGathering: (payload: SharePack) => string;
  joinGathering: (
    payload: SharePack,
    claimId: string | "new",
    extras?: JoinExtras,
  ) => string;
};

function nextColor(people: Person[]): PersonColor {
  return PERSON_COLORS[people.length % PERSON_COLORS.length];
}

const fresh = emptyNow();

export const useDang = create<State>()(
  persist(
    (set, get) => ({
      hydrated: false,
      people: fresh.people,
      gatherings: fresh.gatherings,
      expenses: fresh.expenses,
      profile: fresh.profile,
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
          sourceId: g.sourceId || id,
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
        const blank = emptyNow();
        const profile = {
          ...blank.profile,
          name: get().profile.name || "من",
          avatar: get().profile.avatar || "",
          defaultCurrency: get().profile.defaultCurrency,
          seenWelcome: false,
        };
        set({
          people: [
            {
              ...blank.people[0],
              name: profile.name,
              avatar: profile.avatar,
            },
          ],
          gatherings: [],
          expenses: [],
          draft: null,
          profile,
        });
      },
      joinGathering: (payload, claimId, extras) => {
        const result = applyJoin(
          {
            people: get().people,
            gatherings: get().gatherings,
            expenses: get().expenses,
            profile: get().profile,
          },
          payload,
          claimId,
          extras,
        );
        if ("alreadyId" in result) return result.alreadyId;
        set({
          people: result.people,
          gatherings: result.gatherings,
          expenses: result.expenses,
          profile: result.profile,
        });
        return result.gatheringId;
      },
      importGathering: (payload) => {
        return get().joinGathering(payload, "new");
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
