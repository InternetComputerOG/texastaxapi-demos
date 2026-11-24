// The math for the monthly mortgage payment with the address's real property tax. Pure: no network, no DOM, so the
// page and the tests share it.
//
// The property tax = the sum over the taxing units of price × adopted rate / 100, each rounded half up to the cent
// (rates are per $100 of value), with no exemptions: a seller's homestead exemption does not transfer to a buyer.
// A unit with no adopted rate yet is left out and named; a PID's assessment is not a tax and is not passed here.
// The tax arithmetic is exact: amounts are BigInt cents and rates BigInt with 10 decimal places.
//
// The payment:
//   loan = price × (1 − down% / 100)
//   r    = rate% / 100 / 12,  n = years × 12
//   P&I  = loan × r / (1 − (1 + r)^−n), or loan / n at a zero rate (the standard amortisation formula)
//   monthly = P&I + tax / 12 + insurance / 12 + HOA, each output rounded half up to the cent at the end
// Mortgage insurance (PMI) is not computed.
//
// This file is self-contained on purpose: copy the folder and it runs.

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

/**
 * The annual tax for `value` dollars over `units` ({ name, adopted }, adopted a rate string or null).
 * Returns { total, left_out }, total as "1234.56", or null if `value` is not a non-negative amount.
 */
export function annualTax(value, units) {
  const v = scaled(typeof value === "number" ? value.toFixed(2) : value, 2);
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

/** A non-negative number from a number or a string, or null. */
const num = (v) => {
  const s = String(v).trim();
  const n = s === "" ? NaN : Number(s);
  return Number.isFinite(n) && n >= 0 ? n : null;
};
const round = (x) => Math.round(x * 100) / 100;

/**
 * The monthly payment for { price, down_pct, rate_pct, years, insurance_annual, hoa_monthly } over `units`.
 * Returns { loan, principal_interest, tax_annual, tax_monthly, insurance_monthly, hoa_monthly, total_monthly,
 * left_out }, or null if an input is not a non-negative number, the down payment is over 100 or the term is 0.
 */
export function monthly(input, units) {
  const [price, down, rate, years, ins, hoa] = [
    input.price, input.down_pct, input.rate_pct, input.years, input.insurance_annual, input.hoa_monthly,
  ].map(num);
  if ([price, down, rate, years, ins, hoa].includes(null) || down > 100 || years === 0) return null;
  const tax = annualTax(price, units);
  const loan = price * (1 - down / 100);
  const r = rate / 100 / 12;
  const n = years * 12;
  const pi = r === 0 ? loan / n : (loan * r) / (1 - (1 + r) ** -n);
  const taxM = Number(tax.total) / 12;
  return {
    loan: round(loan),
    principal_interest: round(pi),
    tax_annual: tax.total,
    tax_monthly: round(taxM),
    insurance_monthly: round(ins / 12),
    hoa_monthly: round(hoa),
    total_monthly: round(pi + taxM + ins / 12 + hoa),
    left_out: tax.left_out,
  };
}
