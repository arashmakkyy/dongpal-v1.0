import assert from "node:assert/strict";
import test from "node:test";
import { applyJoin, applyRemote, findJoinedGathering } from "./join.ts";
import {
  decodePack,
  encodePack,
  packFromState,
  type SharePack,
} from "./pack.ts";
import type { Gathering, Person, Profile } from "./types.ts";

const me: Person = {
  id: "me",
  name: "من",
  avatar: "",
  color: "person-5",
  isMe: true,
};

const emptyProfile: Profile = {
  name: "من",
  avatar: "",
  defaultCurrency: "IRT",
  seenWelcome: false,
};

function emptyState() {
  return {
    people: [me],
    gatherings: [] as Gathering[],
    expenses: [],
    profile: { ...emptyProfile },
  };
}

const pack: SharePack = {
  v: 1,
  gathering: {
    id: "g-north",
    sourceId: "g-north",
    name: "سفر شمال",
    cover: "/covers/north.jpg",
    memberIds: ["h-host", "ali", "sara"],
    currency: "IRT",
    createdAt: 1,
  },
  people: [
    { id: "h-host", name: "نیکی", avatar: "/avatars/niki.jpg", color: "person-5" },
    { id: "ali", name: "علی", avatar: "/avatars/ali.jpg", color: "person-1" },
    { id: "sara", name: "سارا", avatar: "/avatars/sara.jpg", color: "person-2" },
  ],
  expenses: [
    {
      id: "e1",
      gatheringId: "g-north",
      title: "شام",
      amount: 900_000,
      category: "food",
      payerId: "ali",
      participantIds: ["h-host", "ali", "sara"],
      split: "equal",
      date: 1,
      createdAt: 1,
    },
  ],
};

test("fresh device always gets the identity picker path (no seed collision)", () => {
  const state = emptyState();
  assert.equal(findJoinedGathering(state.gatherings, "g-north"), undefined);
  const result = applyJoin(state, pack, "ali");
  assert.ok(!("alreadyId" in result));
  if ("alreadyId" in result) return;
  assert.equal(result.gatherings.length, 1);
  assert.equal(result.gatherings[0].sourceId, "g-north");
  assert.ok(result.gatherings[0].memberIds.includes("me"));
  assert.ok(!result.gatherings[0].memberIds.includes("ali"));
  assert.equal(result.expenses[0].payerId, "me");
  assert.equal(result.profile.seenWelcome, true);
  assert.equal(result.profile.name, "علی");
  assert.equal(result.expenses[0].id, "e1");
  assert.equal(result.gatherings[0].claimId, "ali");
});

test("claiming a person remaps every expense onto me so UI can say تو", () => {
  const result = applyJoin(emptyState(), pack, "ali");
  assert.ok(!("alreadyId" in result));
  if ("alreadyId" in result) return;
  const e = result.expenses[0];
  assert.ok(e.participantIds.includes("me"));
  assert.ok(!e.participantIds.includes("ali"));
  const ali = result.people.find((p) => p.id === "ali");
  assert.equal(ali, undefined);
  const you = result.people.find((p) => p.isMe);
  assert.equal(you?.name, "علی");
});

test("من توی این لیست نیستم keeps everyone and adds me", () => {
  const result = applyJoin(emptyState(), pack, "new", {
    name: "مریم",
    avatar: "/avatars/nazanin.jpg",
  });
  assert.ok(!("alreadyId" in result));
  if ("alreadyId" in result) return;
  assert.ok(result.gatherings[0].memberIds.includes("me"));
  assert.ok(result.gatherings[0].memberIds.includes("ali"));
  assert.equal(result.people.filter((p) => p.id === "ali").length, 1);
  assert.equal(result.profile.name, "مریم");
  assert.ok(result.gatherings[0].claimId);
  assert.notEqual(result.gatherings[0].claimId, "new");
});

test("opening the same invite twice does not duplicate the gathering", () => {
  const first = applyJoin(emptyState(), pack, "sara");
  assert.ok(!("alreadyId" in first));
  if ("alreadyId" in first) return;
  const second = applyJoin(first, pack, "ali");
  assert.ok("alreadyId" in second);
  if (!("alreadyId" in second)) return;
  assert.equal(second.alreadyId, first.gatheringId);
});

test("host opening their own link is treated as already joined", () => {
  const hostGathering: Gathering = {
    id: "g-north",
    name: "سفر شمال",
    cover: "/covers/north.jpg",
    memberIds: ["me", "ali"],
    currency: "IRT",
    createdAt: 1,
  };
  const state = {
    ...emptyState(),
    gatherings: [hostGathering],
  };
  const result = applyJoin(state, pack, "ali");
  assert.deepEqual(result, { alreadyId: "g-north" });
});

test("pack encode/decode roundtrip keeps members and expenses", () => {
  const gathering: Gathering = {
    id: "g-abc",
    name: "کافه",
    cover: "/covers/cafe.jpg",
    memberIds: ["me", "ali"],
    currency: "IRT",
    createdAt: 42,
  };
  const people: Person[] = [
    me,
    { id: "ali", name: "علی", avatar: "/avatars/ali.jpg", color: "person-1" },
  ];
  const packed = packFromState(gathering, people, [
    {
      id: "e1",
      gatheringId: "g-abc",
      title: "قهوه",
      amount: 120_000,
      category: "food",
      payerId: "me",
      participantIds: ["me", "ali"],
      split: "equal",
      date: 42,
      createdAt: 42,
    },
  ]);
  const raw = encodePack(packed);
  const back = decodePack(raw);
  assert.ok(back);
  assert.equal(back?.gathering.name, "کافه");
  assert.equal(back?.people.length, 2);
  assert.ok(!back?.people.some((p) => p.isMe || p.id === "me"));
  assert.equal(back?.expenses[0].title, "قهوه");
  assert.equal(back?.gathering.sourceId, "g-abc");
});

test("packFromState uses claimId so two devices share the same canonical me", () => {
  const gathering: Gathering = {
    id: "g-local-xyz",
    sourceId: "g-north",
    claimId: "ali",
    name: "سفر شمال",
    cover: "/covers/north.jpg",
    memberIds: ["me", "sara"],
    currency: "IRT",
    createdAt: 1,
    syncId: "AbCdEfGhIjKlMnOpQrStUv",
  };
  const packed = packFromState(
    gathering,
    [
      me,
      { id: "sara", name: "سارا", avatar: "/avatars/sara.jpg", color: "person-2" },
    ],
    [
      {
        id: "e1",
        gatheringId: "g-local-xyz",
        title: "شام",
        amount: 1,
        category: "food",
        payerId: "me",
        participantIds: ["me", "sara"],
        split: "equal",
        date: 1,
        createdAt: 1,
      },
    ],
  );
  assert.equal(packed.gathering.syncId, "AbCdEfGhIjKlMnOpQrStUv");
  assert.ok(packed.people.some((p) => p.id === "ali"));
  assert.ok(!packed.people.some((p) => p.id === "me"));
  assert.equal(packed.expenses[0].payerId, "ali");
  const back = decodePack(encodePack(packed));
  assert.equal(back?.gathering.syncId, "AbCdEfGhIjKlMnOpQrStUv");
});

test("applyRemote remaps canonical claimId back to me and keeps new expenses", () => {
  const joined = applyJoin(emptyState(), pack, "ali");
  assert.ok(!("alreadyId" in joined));
  if ("alreadyId" in joined) return;
  const next: SharePack = {
    ...pack,
    expenses: [
      ...pack.expenses,
      {
        id: "e2",
        gatheringId: "g-north",
        title: "تاکسی",
        amount: 80_000,
        category: "transport",
        payerId: "sara",
        participantIds: ["h-host", "ali", "sara"],
        split: "equal",
        date: 2,
        createdAt: 2,
      },
    ],
  };
  const remote = applyRemote(joined, joined.gatheringId, next);
  assert.equal(remote.expenses.length, 2);
  assert.ok(remote.expenses.some((e) => e.id === "e2"));
  const taxi = remote.expenses.find((e) => e.id === "e2")!;
  assert.ok(taxi.participantIds.includes("me"));
  assert.ok(!taxi.participantIds.includes("ali"));
});

test("host sees a brand-new joiner and their expense after applyRemote", () => {
  const hostGathering: Gathering = {
    id: "g-host",
    sourceId: "g-north",
    claimId: "h-host",
    name: "سفر شمال",
    cover: "/covers/north.jpg",
    memberIds: ["me", "ali", "sara"],
    currency: "IRT",
    createdAt: 1,
    syncId: "AbCdEfGhIjKlMnOpQrStUv",
  };
  const hostState = {
    people: [
      me,
      { id: "ali", name: "علی", avatar: "/avatars/ali.jpg", color: "person-1" as const },
      { id: "sara", name: "سارا", avatar: "/avatars/sara.jpg", color: "person-2" as const },
    ],
    gatherings: [hostGathering],
    expenses: [
      {
        ...pack.expenses[0],
        gatheringId: "g-host",
        payerId: "ali",
        participantIds: ["me", "ali", "sara"],
      },
    ],
    profile: { ...emptyProfile, name: "نیکی", seenWelcome: true },
  };
  const joinerPack: SharePack = {
    ...pack,
    gathering: {
      ...pack.gathering,
      memberIds: ["p-mary", "h-host", "ali", "sara"],
      syncId: "AbCdEfGhIjKlMnOpQrStUv",
    },
    people: [
      ...pack.people,
      { id: "p-mary", name: "مریم", avatar: "", color: "person-3" },
    ],
    expenses: [
      {
        ...pack.expenses[0],
        participantIds: ["h-host", "ali", "sara", "p-mary"],
      },
      {
        id: "e-pizza",
        gatheringId: "g-north",
        title: "پیتزا",
        amount: 450_000,
        category: "food",
        payerId: "p-mary",
        participantIds: ["p-mary", "h-host", "ali", "sara"],
        split: "equal",
        date: 9,
        createdAt: 9,
      },
    ],
  };
  const next = applyRemote(hostState, "g-host", joinerPack);
  assert.ok(next.people.some((p) => p.id === "p-mary" && p.name === "مریم"));
  assert.ok(next.gatherings[0].memberIds.includes("p-mary"));
  assert.ok(next.gatherings[0].memberIds.includes("me"));
  const pizza = next.expenses.find((e) => e.id === "e-pizza");
  assert.ok(pizza);
  assert.equal(pizza?.payerId, "p-mary");
  assert.ok(pizza?.participantIds.includes("me"));
});
