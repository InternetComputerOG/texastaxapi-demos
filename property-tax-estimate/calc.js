// The math for the property tax estimate. Pure: no network, no DOM, so the page and the tests share it.
//
// Texas taxing units (county, city, school district, MUD, ESD, ...) each set a rate per $100 of taxable value.
// The API returns each unit's adopted rate as a decimal string in `units[].rates.adopted`, e.g. "0.195000".
//
//   tax for one unit = value × adopted rate / 100, rounded half up to the cent
//   total            = the sum of the rounded unit taxes
//
// A unit with no adopted rate yet (common before the autumn) is listed in `left_out` and adds nothing, so the total
// never silently pretends to be complete. A PID levies an assessment, not a tax: leave it out of `units` here.
//
// The arithmetic is exact: amounts are BigInt cents, rates are BigInt with 10 decimal places, so a rate such as
// 0.096778 times $400,000 never picks up a floating-point error.

const RATE_PLACES = 10;

/** A non-negative decimal string as a BigInt scaled by 10^places, or null if it is not one. */
function scaled(s, places) {
  const m = /^(\d+)(?:\.(\d+))?$/.exec(String(s).trim());
  if (!m) return null;
  const frac = (m[2] ?? "").padEnd(places, "0");
  if (frac.length > places) return null; // more precision than we keep: refuse rather than round silently
  return BigInt(m[1] + frac);
}

/** BigInt cents as "1234.56". */
function cents(c) {
  return `${c / 100n}.${(c % 100n).toString().padStart(2, "0")}`;
}

/** One unit's tax in cents, rounded half up: value (cents) × rate (10^-10) / 100 / 10^10. */
function taxCents(value, rate) {
  const d = 100n * 10n ** BigInt(RATE_PLACES);
  return (value * rate * 2n + d) / (2n * d);
}

/**
 * The estimate for `value` dollars over `units` ({ name, type, adopted }, adopted a rate string or null).
 * Returns { units: [{ name, type, rate, tax }], total, left_out }, money as "1234.56" strings,
 * or null if `value` is not a non-negative amount.
 */
export function estimate(value, units) {
  const v = scaled(typeof value === "number" ? value.toFixed(2) : value, 2);
  if (v === null) return null;
  let total = 0n;
  const left_out = [];
  const out = units.map((u) => {
    const r = u.adopted === null ? null : scaled(u.adopted, RATE_PLACES);
    if (r === null) {
      left_out.push(u.name);
      return { name: u.name, type: u.type, rate: null, tax: null };
    }
    const t = taxCents(v, r);
    total += t;
    return { name: u.name, type: u.type, rate: u.adopted, tax: cents(t) };
  });
  return { units: out, total: cents(total), left_out };
}
