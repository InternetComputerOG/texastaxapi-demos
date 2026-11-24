// Run with `npm test` from the repo root (node:test, no dependency).
// examples.json holds worked examples; texastaxapi.com's own page is tested on the same file.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dscr } from "./calc.js";

const { examples } = JSON.parse(
  readFileSync(new URL("./examples.json", import.meta.url), "utf8"),
);

for (const ex of examples) {
  test(ex.name, () => {
    assert.deepEqual(dscr(ex.input, ex.input.units), ex.expected);
  });
}

const base = { price: 300000, down_pct: 0, rate_pct: 0, years: 30, insurance_annual: 0, hoa_monthly: 0, rent_monthly: 1250 };

test("puts 1.25 in the top band", () => {
  assert.equal(dscr({ ...base, rent_monthly: 1041.66 }, []).band, "1.25 or above");
});

test("refuses an input that is not one", () => {
  assert.equal(dscr({ ...base, rent_monthly: "abc" }, []), null);
  assert.equal(dscr({ ...base, rent_monthly: "" }, []), null);
  assert.equal(dscr({ ...base, price: 0 }, []), null);
});
