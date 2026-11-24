// The math for the special-district check. Pure: no network, no DOM, so the page and the tests share it.
//
// Texas special districts are taxing units the county lists like any other. This check picks out:
//   - water districts under Water Code chapter 49 (types mud, ud, wd, wcid, fwsd, lid): a seller owes the buyer the
//     Water Code § 49.452 notice to purchaser;
//   - a public improvement district (type pid): the Property Code § 5.014 notice. A PID levies an assessment
//     (`levy: "assessment"`), not a tax rate, so it is never summed as a tax;
//   - an emergency services district (type esd): no purchaser notice; its rate is capped at 10¢ per $100.
//
// For each one:
//   tax   = value × adopted rate / 100, rounded half up to the cent (rates are per $100 of value)
//   share = its tax / the total tax of every unit on the parcel, to 4 places
//
// A unit with no adopted rate yet adds nothing to the total and shows no tax. The arithmetic is exact: amounts are
// BigInt cents and rates BigInt with 10 decimal places, so no floating-point error creeps in.
// This file is self-contained on purpose: copy the folder and it runs.

const RATE_PLACES = 10;

const WATER = ["mud", "ud", "wd", "wcid", "fwsd", "lid"];
const NOTICE = {
  ...Object.fromEntries(WATER.map((t) => [t, "Water Code 49.452"])),
  pid: "Property Code 5.014",
  esd: null,
};

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

/** One unit's tax in cents, rounded half up: value (cents) × rate (10^-10) / 100 / 10^10. */
function taxCents(value, rate) {
  const d = 100n * 10n ** BigInt(RATE_PLACES);
  return (value * rate * 2n + d) / (2n * d);
}

/** a / b to 4 places, half up, from BigInt cents; null when b is zero. */
function share(a, b) {
  if (b === 0n) return null;
  const q = (a * 20000n + b) / (2n * b);
  return `${q / 10000n}.${(q % 10000n).toString().padStart(4, "0")}`;
}

/**
 * The check for `value` dollars over `units` ({ name, type, levy, adopted }, adopted a rate string or null).
 * Returns { districts: [{ name, type, rate, tax, share_of_total, notice }], total, any_notice },
 * money as "1234.56" strings, or null if `value` is not a non-negative amount.
 */
export function check(value, units) {
  const v = scaled(typeof value === "number" ? value.toFixed(2) : value, 2);
  if (v === null) return null;
  // Each unit's tax in cents; null for a PID's assessment or a unit with no adopted rate.
  const taxes = units.map((u) => {
    const r = u.levy === "assessment" || u.adopted === null ? null : scaled(u.adopted, RATE_PLACES);
    return r === null ? null : taxCents(v, r);
  });
  const total = taxes.reduce((s, t) => s + (t ?? 0n), 0n);
  const districts = units.flatMap((u, i) =>
    u.type in NOTICE
      ? [{
          name: u.name,
          type: u.type,
          rate: taxes[i] === null ? null : u.adopted,
          tax: taxes[i] === null ? null : cents(taxes[i]),
          share_of_total: taxes[i] === null ? null : share(taxes[i], total),
          notice: NOTICE[u.type],
        }]
      : [],
  );
  return { districts, total: cents(total), any_notice: districts.some((d) => d.notice !== null) };
}
