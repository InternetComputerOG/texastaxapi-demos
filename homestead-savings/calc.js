// The math for the homestead savings. Pure: no network, no DOM, so the page and the tests share it.
//
// A Texas homestead gets a school-tax exemption (Tax Code § 11.13), for 2026:
//   - $140,000 off the value for every school district (11.13(b));
//   - $60,000 more if the owner is 65 or older or disabled (11.13(c));
//   - never more than the value itself.
//
// For each unit of type "school":
//   exemption = min(value, 140000, plus 60000 if 65+ or disabled)
//   savings   = exemption × adopted rate / 100, rounded half up to the cent (rates are per $100 of value)
//
// Whether the home is a homestead, and the owner's age, are your input: the API's answer does not say.
// A school unit with no adopted rate yet gives no savings figure and is listed in `not_computed`; never a guess.
// Not computed: a local-option exemption (11.13(n)) and a MUD's own homestead exemption.
// The arithmetic is exact: amounts are BigInt cents and rates BigInt with 10 decimal places.
// This file is self-contained on purpose: copy the folder and it runs.

export const SCHOOL_EXEMPTION = 140000;
export const OVER65_EXEMPTION = 60000;
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
const cents = (c) => `${c / 100n}.${(c % 100n).toString().padStart(2, "0")}`;

/** Tax in cents, rounded half up: amount (cents) × rate (10^-10) / 100 / 10^10. */
function taxCents(amount, rate) {
  const d = 100n * 10n ** BigInt(RATE_PLACES);
  return (amount * rate * 2n + d) / (2n * d);
}

/**
 * The savings for `value` dollars over `units` ({ name, type, adopted }, adopted a rate string or null).
 * Returns { school_units: [{ name, rate, exemption, savings }], savings, not_computed }, money as "1234.56"
 * strings (savings null when no school unit has a rate), or null if `value` is not a non-negative amount.
 */
export function savings(value, over65OrDisabled, units) {
  const v = scaled(typeof value === "number" ? value.toFixed(2) : value, 2);
  if (v === null) return null;
  const exemption = Math.min(Number(value), SCHOOL_EXEMPTION + (over65OrDisabled ? OVER65_EXEMPTION : 0));
  const e = scaled(exemption.toFixed(2), 2);
  let total = 0n;
  let computed = 0;
  const not_computed = [];
  const school_units = units
    .filter((u) => u.type === "school")
    .map((u) => {
      const r = u.adopted === null ? null : scaled(u.adopted, RATE_PLACES);
      if (r === null) {
        not_computed.push(u.name);
        return { name: u.name, rate: null, exemption, savings: null };
      }
      const t = taxCents(e, r);
      total += t;
      computed++;
      return { name: u.name, rate: u.adopted, exemption, savings: cents(t) };
    });
  return { school_units, savings: computed ? cents(total) : null, not_computed };
}
