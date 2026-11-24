// The math for the closing tax proration. Pure: no network, no DOM, so the page and the tests share it.
//
// The annual tax (estimate) = the sum over the taxing units of value × adopted rate / 100, each rounded half up to
// the cent (rates are per $100 of value). A unit with no adopted rate yet is left out and named; a PID's
// assessment is not a tax and is not passed here.
//
// The proration, "prorated through the Closing Date" (TREC form 20-19, paragraph 13):
//   seller days  = 1 January through the closing date, inclusive
//   seller share = annual × seller days / days in the year (365 or 366), rounded half up to the cent
//   buyer share  = annual − seller share
//   taxes unpaid: the seller credits the buyer the seller share; paid: the buyer credits the seller the buyer share
//
// The arithmetic is exact: amounts are BigInt cents and rates BigInt with 10 decimal places.
// This file is self-contained on purpose: copy the folder and it runs.

const RATE_PLACES = 10;
const DAY = 86400000;

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

/** An amount (number or string) as BigInt cents, or null. */
const toCents = (v) => scaled(typeof v === "number" ? v.toFixed(2) : v, 2);

/**
 * The annual tax for `value` dollars over `units` ({ name, adopted }, adopted a rate string or null).
 * Returns { total, left_out }, total as "1234.56", or null if `value` is not a non-negative amount.
 */
export function annualTax(value, units) {
  const v = toCents(value);
  if (v === null) return null;
  const d = 100n * 10n ** BigInt(RATE_PLACES);
  let total = 0n;
  const left_out = [];
  for (const u of units) {
    const r = u.adopted === null ? null : scaled(u.adopted, RATE_PLACES);
    if (r === null) left_out.push(u.name);
    else total += (v * r * 2n + d) / (2n * d);
  }
  return { total: cents(total), left_out };
}

/**
 * The proration of `annual` dollars at `closingDate` ("YYYY-MM-DD").
 * Returns { days_in_year, seller_days, seller_share, buyer_share, credit: { to, amount } }, or null if the amount
 * or the date is not valid.
 */
export function prorate(annual, closingDate, taxesPaid) {
  const a = toCents(annual);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(closingDate).trim());
  if (a === null || !m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const t = Date.UTC(y, mo - 1, d);
  if (new Date(t).getUTCMonth() !== mo - 1 || new Date(t).getUTCDate() !== d) return null; // e.g. 2026-02-30
  const days_in_year = (Date.UTC(y + 1, 0, 1) - Date.UTC(y, 0, 1)) / DAY;
  const seller_days = (t - Date.UTC(y, 0, 1)) / DAY + 1;
  const D = BigInt(days_in_year);
  const seller = (a * BigInt(seller_days) * 2n + D) / (2n * D);
  const buyer = a - seller;
  return {
    days_in_year,
    seller_days,
    seller_share: cents(seller),
    buyer_share: cents(buyer),
    credit: taxesPaid ? { to: "seller", amount: cents(buyer) } : { to: "buyer", amount: cents(seller) },
  };
}
