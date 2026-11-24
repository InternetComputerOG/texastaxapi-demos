// Run with `npm test` from the repo root (node:test, no dependency).
// examples.json holds worked examples from real API answers; texastaxapi.com's own page is tested on the same file.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { check } from "./calc.js";

const { examples } = JSON.parse(
  readFileSync(new URL("./examples.json", import.meta.url), "utf8"),
);

for (const ex of examples) {
  test(ex.name, () => {
    assert.deepEqual(check(ex.input.value, ex.input.units), ex.expected);
  });
}

test("lists a PID with its notice and never sums it", () => {
  const r = check(100000, [
    { name: "CITY", type: "city", levy: "tax", adopted: "0.5" },
    { name: "PID 1", type: "pid", levy: "assessment", adopted: null },
  ]);
  assert.equal(r.total, "500.00");
  assert.deepEqual(r.districts, [
    { name: "PID 1", type: "pid", rate: null, tax: null, share_of_total: null, notice: "Property Code 5.014" },
  ]);
});

test("refuses a value that is not an amount", () => {
  assert.equal(check("abc", []), null);
});
