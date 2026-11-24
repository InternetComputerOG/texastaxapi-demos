// Run with `npm test` from the repo root (node:test, no dependency).
// examples.json holds worked examples from real API answers; texastaxapi.com's own page is tested on the same file.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { savings } from "./calc.js";

const { examples } = JSON.parse(
  readFileSync(new URL("./examples.json", import.meta.url), "utf8"),
);

for (const ex of examples) {
  test(ex.name, () => {
    assert.deepEqual(savings(ex.input.value, ex.input.over65_or_disabled, ex.input.units), ex.expected);
  });
}

test("gives no savings figure without a school unit", () => {
  assert.deepEqual(savings(300000, false, [{ name: "CITY", type: "city", adopted: "0.5" }]), {
    school_units: [],
    savings: null,
    not_computed: [],
  });
});

test("refuses a value that is not an amount", () => {
  assert.equal(savings("abc", false, []), null);
});
