# Texas DSCR calculator with the address's real tax

## Who it is for

Loan officers who quote investor loans on Texas rentals and need the debt service coverage ratio with the property's
own tax, MUDs and other special districts included.

## The formula and its sources

- **PITIA** = principal and interest + property tax ÷ 12 + insurance ÷ 12 + HOA, rounded half up to the cent:
  - loan = price × (1 − down payment);
  - principal and interest = loan × r ÷ (1 − (1 + r)^−n), with r = the yearly rate ÷ 12 and n = years × 12 (the
    standard amortisation formula), or loan ÷ n at a zero rate;
  - property tax = the sum over the taxing units of the price × adopted rate ÷ 100, each rounded half up to the cent
    ([Tax Code § 26.09](https://statutes.capitol.texas.gov/Docs/TX/htm/TX.26.htm#26.09)), with no exemptions (a
    rental is not a homestead). A unit with no adopted rate yet is left out and named, so the payment is low and the
    ratio high. A PID's assessment is not a tax and is left out.
- **DSCR** = monthly rent ÷ PITIA, to 2 places. 1.00 means the rent just covers the payment; many lenders look for
  1.25 or more. The page shows the band: 1.25 or above, 1.00 to 1.24, or below 1.00.
- The ratio is a plain number, not a lender's decision: each lender sets its own minimum.

The math is in `calc.js`; `examples.json` holds worked examples that `calc.test.js` checks.

## Run it

```sh
cp .env.example .env          # from the repo root; then put your key in TEXASTAXAPI_KEY
npm run dscr                  # from the repo root; open the address it prints
npm test                      # from the repo root; runs every demo's tests
```

Copying the folder into your own project? Run `node --env-file=.env server.js` beside your `.env`.

## Build your own

The prompt that builds this demo from nothing: paste it into a coding agent in an empty folder, with the key in
`.env`.

```text
Build a DSCR calculator for Texas rentals. A small Node server (no dependencies) takes an address, calls GET https://api.texastaxapi.com/v1/lookup?address=… with my key from .env (header Authorization: Bearer <key>), and returns the JSON. The tax is the sum over the units with rates.adopted (per $100 of value) of the purchase price × rate / 100, each rounded half up to the cent, with no exemptions; a PID is an assessment, not a tax. Let me enter the monthly rent, the price, the down payment and the rate in percent, the term in years, insurance a year and HOA a month. Loan = price × (1 − down / 100); r = rate / 100 / 12; n = years × 12; P&I = loan × r / (1 − (1 + r)^−n), or loan / n at a zero rate. PITIA = P&I + tax / 12 + insurance / 12 + HOA, rounded half up to the cent. DSCR = rent / PITIA to 2 places; show whether it is 1.25 or above, 1.00 to 1.24, or below 1.00, in a sentence with the numbers, and say it is not a lender's decision. Prefill the price from parcel.value. Recompute on every input change, without another request. If a unit has no adopted rate, name it and say the ratio is high.
```

## The calls it makes

One call per address, from `server.js`:

- `GET {TEXASTAXAPI_API_URL}/v1/lookup?address=<the address>`, header `Authorization: Bearer <TEXASTAXAPI_KEY>`.
- Fields read: `units[].name`, `levy`, `rates.adopted`; `parcel.value` (`kind`, `amount`, `tax_year`); `county.name`;
  `address.normalized`; the `X-Request-Id` header.
- An error answer is `{ "error": { "code", "message" } }`; the page shows its message.
