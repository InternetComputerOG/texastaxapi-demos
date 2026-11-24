// Run with `npm test` from the repo root (node:test, no dependency).
// examples.json holds worked examples; texastaxapi.com's own page is tested on the same file.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { monthly } from "./calc.js";

const { examples } = JSON.parse(
  readFileSync(new URL("./examples.json", import.meta.url), "utf8"),
);

for (const ex of examples) {
  test(ex.name, () => {
    assert.deepEqual(monthly(ex.input, ex.input.units), ex.expected);
  });
}

const base = { price: 300000, down_pct: 0, rate_pct: 0, years: 30, insurance_annual: 0, hoa_monthly: 0 };

test("divides the loan evenly at a zero rate", () => {
  assert.equal(monthly(base, []).principal_interest, 833.33);
});

test("refuses an input that is not one", () => {
  assert.equal(monthly({ ...base, price: "abc" }, []), null);
  assert.equal(monthly({ ...base, down_pct: 101 }, []), null);
  assert.equal(monthly({ ...base, years: 0 }, []), null);
});
