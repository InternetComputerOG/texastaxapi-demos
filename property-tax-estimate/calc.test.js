// Run with `npm test` from the repo root (node:test, no dependency).
// examples.json holds worked examples from real API answers; texastaxapi.com's own page is tested on the same file.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { estimate } from "./calc.js";

const { examples } = JSON.parse(
  readFileSync(new URL("./examples.json", import.meta.url), "utf8"),
);

for (const ex of examples) {
  test(ex.name, () => {
    assert.deepEqual(estimate(ex.input.value, ex.input.units), ex.expected);
  });
}

test("rounds half up to the cent", () => {
  assert.equal(estimate(1, [{ name: "a", type: "x", adopted: "0.5" }]).total, "0.01");
  assert.equal(estimate(1, [{ name: "a", type: "x", adopted: "0.49" }]).total, "0.00");
});

test("refuses a value that is not an amount", () => {
  assert.equal(estimate(-1, []), null);
  assert.equal(estimate("abc", []), null);
});
