// Run with `npm test` from the repo root (node:test, no dependency).
// examples.json holds worked examples; texastaxapi.com's own page is tested on the same file.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { annualTax, prorate } from "./calc.js";

const { examples } = JSON.parse(
  readFileSync(new URL("./examples.json", import.meta.url), "utf8"),
);

for (const ex of examples) {
  test(ex.name, () => {
    assert.deepEqual(prorate(ex.input.annual_tax, ex.input.closing_date, ex.input.taxes_paid), ex.expected);
  });
}

test("gives the seller the whole year at 31 December", () => {
  assert.equal(prorate("1000", "2026-12-31", false).seller_share, "1000.00");
});

test("refuses an amount or a date that is not one", () => {
  assert.equal(prorate("abc", "2026-06-30", false), null);
  assert.equal(prorate("1000", "2026-02-30", false), null);
});

test("estimates the annual tax and names a unit with no adopted rate", () => {
  assert.deepEqual(
    annualTax("400000", [
      { name: "CITY", adopted: "0.5" },
      { name: "MUD", adopted: null },
    ]),
    { total: "2000.00", left_out: ["MUD"] },
  );
});
