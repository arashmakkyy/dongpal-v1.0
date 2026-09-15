import assert from "node:assert/strict";
import test from "node:test";
import {
  equalPercents,
  percentFromAmount,
  redistributeShares,
  sharesSum,
} from "./settle.ts";
import { convertIrtIrr, parseAmount, toEnDigits } from "./format.ts";

test("equal percents always sum to 100", () => {
  for (const n of [1, 2, 3, 4, 5, 6, 7]) {
    const ids = Array.from({ length: n }, (_, i) => String(i));
    const p = equalPercents(ids);
    assert.equal(sharesSum(p, ids), 100);
  }
});

test("dragging one person to 100 zeroes everyone else", () => {
  const ids = ["a", "b", "c", "d"];
  const start = equalPercents(ids);
  const next = redistributeShares(ids, "a", 100, start);
  assert.equal(next.a, 100);
  assert.equal(next.b, 0);
  assert.equal(next.c, 0);
  assert.equal(next.d, 0);
  assert.equal(sharesSum(next, ids), 100);
});

test("dragging down from 100 splits remaining equally", () => {
  const ids = ["a", "b", "c", "d"];
  const weights = { a: 100, b: 0, c: 0, d: 0 };
  const next = redistributeShares(ids, "a", 40, weights);
  assert.equal(next.a, 40);
  assert.equal(next.b, 20);
  assert.equal(next.c, 20);
  assert.equal(next.d, 20);
  assert.equal(sharesSum(next, ids), 100);
});

test("others keep their ratios while one slider moves", () => {
  const ids = ["a", "b", "c", "d"];
  const weights = { a: 40, b: 30, c: 20, d: 10 };
  const next = redistributeShares(ids, "a", 20, weights);
  assert.equal(next.a, 20);
  assert.equal(next.b, 40);
  assert.equal(next.c, 27);
  assert.equal(next.d, 13);
  assert.equal(sharesSum(next, ids), 100);
  assert.ok(next.b > next.c && next.c > next.d);
});

test("frozen weights stay stable across a drag", () => {
  const ids = ["a", "b", "c"];
  const start = { a: 50, b: 30, c: 20 };
  const mid = redistributeShares(ids, "a", 70, start);
  const end = redistributeShares(ids, "a", 10, start);
  assert.equal(sharesSum(mid, ids), 100);
  assert.equal(sharesSum(end, ids), 100);
  assert.equal(mid.b / mid.c, 30 / 20);
  assert.equal(end.b / end.c, 30 / 20);
  assert.equal(end.a, 10);
});

test("two people are exact complements", () => {
  const ids = ["a", "b"];
  const start = { a: 50, b: 50 };
  const next = redistributeShares(ids, "a", 73, start);
  assert.equal(next.a, 73);
  assert.equal(next.b, 27);
});

test("percent from amount", () => {
  assert.equal(percentFromAmount(980_000, 2_450_000), 40);
  assert.equal(percentFromAmount(0, 100), 0);
  assert.equal(percentFromAmount(50, 0), 0);
});

test("toman / rial convert", () => {
  assert.equal(convertIrtIrr(2_289_000, "IRT", "IRT"), 2_289_000);
  assert.equal(convertIrtIrr(2_289_000, "IRR", "IRT"), 228_900);
  assert.equal(convertIrtIrr(228_900, "IRT", "IRR"), 2_289_000);
  assert.equal(convertIrtIrr(100, "USD", "IRT"), 100);
});

test("parse amount with persian digits and commas", () => {
  assert.equal(toEnDigits("۱۲۳"), "123");
  assert.equal(parseAmount("۲,۲۸۹,۰۰۰"), 2_289_000);
  assert.equal(parseAmount("1,200,000"), 1_200_000);
  assert.equal(parseAmount(""), 0);
});
