import assert from "node:assert/strict";
import test from "node:test";
import type { SharePack } from "./pack.ts";
import { mergePacks } from "./sync-core.ts";

const base: SharePack = {
  v: 1,
  gathering: {
    id: "g-north",
    sourceId: "g-north",
    name: "سفر شمال",
    cover: "/covers/north.jpg",
    memberIds: ["h-host", "ali"],
    currency: "IRT",
    createdAt: 1,
  },
  people: [
    { id: "h-host", name: "نیکی", avatar: "", color: "person-5" },
    { id: "ali", name: "علی", avatar: "", color: "person-1" },
  ],
  expenses: [
    {
      id: "e1",
      gatheringId: "g-north",
      title: "شام",
      amount: 100,
      category: "food",
      payerId: "ali",
      participantIds: ["h-host", "ali"],
      split: "equal",
      date: 1,
      createdAt: 1,
    },
  ],
};

test("merge keeps concurrent expenses from both sides", () => {
  const local: SharePack = {
    ...base,
    expenses: [
      ...base.expenses,
      {
        id: "e-local",
        gatheringId: "g-north",
        title: "بنزین",
        amount: 50,
        category: "transport",
        payerId: "h-host",
        participantIds: ["h-host", "ali"],
        split: "equal",
        date: 2,
        createdAt: 2,
      },
    ],
  };
  const remote: SharePack = {
    ...base,
    expenses: [
      ...base.expenses,
      {
        id: "e-remote",
        gatheringId: "g-north",
        title: "ویلا",
        amount: 80,
        category: "lodging",
        payerId: "ali",
        participantIds: ["h-host", "ali"],
        split: "equal",
        date: 3,
        createdAt: 3,
      },
    ],
  };
  const { pack } = mergePacks(remote, local);
  const ids = pack.expenses.map((e) => e.id).sort();
  assert.deepEqual(ids, ["e-local", "e-remote", "e1"]);
});

test("merge honors tombstones so a deleted expense stays gone", () => {
  const local: SharePack = { ...base, expenses: [] };
  const { pack, tombstones } = mergePacks(base, local, [], ["e1"]);
  assert.equal(pack.expenses.length, 0);
  assert.ok(tombstones.includes("e1"));
});

test("merge prefers the newer edit of the same expense", () => {
  const remote: SharePack = {
    ...base,
    expenses: [{ ...base.expenses[0], amount: 100, updatedAt: 10 }],
  };
  const local: SharePack = {
    ...base,
    expenses: [{ ...base.expenses[0], amount: 250, updatedAt: 20 }],
  };
  const { pack } = mergePacks(remote, local);
  assert.equal(pack.expenses[0].amount, 250);
});

test("merge keeps a brand-new member and their expense from the joiner", () => {
  const local: SharePack = {
    ...base,
    gathering: { ...base.gathering, memberIds: ["h-host", "ali", "p-mary"] },
    people: [
      ...base.people,
      { id: "p-mary", name: "مریم", avatar: "", color: "person-3" },
    ],
    expenses: [
      ...base.expenses,
      {
        id: "e-pizza",
        gatheringId: "g-north",
        title: "پیتزا",
        amount: 450_000,
        category: "food",
        payerId: "p-mary",
        participantIds: ["p-mary", "h-host", "ali"],
        split: "equal",
        date: 4,
        createdAt: 4,
      },
    ],
  };
  const { pack } = mergePacks(base, local);
  assert.ok(pack.people.some((p) => p.id === "p-mary" && p.name === "مریم"));
  assert.ok(pack.gathering.memberIds.includes("p-mary"));
  assert.ok(pack.expenses.some((e) => e.id === "e-pizza" && e.payerId === "p-mary"));
});
