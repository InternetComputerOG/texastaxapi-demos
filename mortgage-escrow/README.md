# Texas mortgage payment with the address's real tax

## Who it is for

Loan officers and realtors who quote a Texas home's monthly payment with its own property tax in escrow, MUDs and
other special districts included.

## The formula and its sources

- **Loan** = price × (1 − down payment).
- **Principal and interest** = loan × r ÷ (1 − (1 + r)^−n), with r = the yearly rate ÷ 12 and n = years × 12 (the
  standard amortisation formula), or loan ÷ n at a zero rate.
- **Property tax** = the sum over the taxing units of the price × adopted rate ÷ 100, each rounded half up to the cent
  ([Tax Code § 26.09](https://statutes.capitol.texas.gov/Docs/TX/htm/TX.26.htm#26.09)), with no exemptions: a
  seller's homestead exemption does not transfer to the buyer, and a sale resets the value toward the price. A unit
  with no adopted rate yet is left out and named beside the escrow line, so the tax is low. A PID's assessment is not
  a tax and is left out.
- **Monthly payment** = principal and interest + tax ÷ 12 + insurance ÷ 12 + HOA, each figure rounded half up to the
  cent at the end.
- Mortgage insurance (PMI) is not computed.

The math is in `calc.js`; `examples.json` holds worked examples that `calc.test.js` checks.

## Run it

```sh
cp .env.example .env          # from the repo root; then put your key in TEXASTAXAPI_KEY
npm run mortgage-escrow       # from the repo root; open the address it prints
npm test                      # from the repo root; runs every demo's tests
```

Copying the folder into your own project? Run `node --env-file=.env server.js` beside your `.env`.

## Build your own

The prompt that builds this demo from nothing: paste it into a coding agent in an empty folder, with your key in
`TEXASTAXAPI_KEY` (`TEXASTAXAPI_API_URL` defaults to `https://api.texastaxapi.com`; the repo's
`.env.example` names both).

```text
Build a Texas mortgage payment calculator with real escrow. A small Node server (no dependencies) takes an address, calls GET {TEXASTAXAPI_API_URL}/v1/lookup?address=… with my key from TEXASTAXAPI_KEY (header Authorization: Bearer <key>), and returns the JSON. Read both from the environment, as the repo's .env.example names them; TEXASTAXAPI_API_URL defaults to https://api.texastaxapi.com. The page reads only parcel.value.amount and each unit's name, levy and rates.adopted. The tax is the sum over the units with rates.adopted (per $100 of value) of the purchase price × rate / 100, each rounded half up to the cent, with no exemptions; a PID is an assessment, not a tax. Let me enter the price, the down payment and the rate in percent, the term in years, insurance a year and HOA a month. Loan = price × (1 − down / 100); r = rate / 100 / 12; n = years × 12; P&I = loan × r / (1 − (1 + r)^−n), or loan / n at a zero rate. Monthly = P&I + tax / 12 + insurance / 12 + HOA, rounded half up to the cent. Prefill the price from parcel.value. Recompute on every input change, without another request. If a unit has no adopted rate, name it beside the escrow line. Do not compute PMI; say so.
```

## The calls it makes

One call per address, from `server.js`:

- `GET {TEXASTAXAPI_API_URL}/v1/lookup?address=<the address>`, header `Authorization: Bearer <TEXASTAXAPI_KEY>`.
- Fields read: `units[].name`, `levy`, `rates.adopted`; `parcel.value` (`kind`, `amount`, `tax_year`); `county.name`;
  `address.normalized`; the `X-Request-Id` header.
- An error answer is `{ "error": { "code", "message" } }`; the page shows its message.
