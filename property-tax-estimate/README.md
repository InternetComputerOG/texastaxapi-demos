# Texas property tax estimate by address

## Who it is for

Realtors, loan officers and title companies who need the yearly property tax on a Texas address: every taxing unit,
special districts (MUDs, ESDs) included, its adopted rate, its tax on the value you set, and the total.

## The formula and its sources

- **Tax per unit** = value × the unit's adopted rate ÷ 100, rounded half up to the cent. Texas rates are set per $100
  of taxable value ([Tax Code § 26.09](https://statutes.capitol.texas.gov/Docs/TX/htm/TX.26.htm#26.09)).
- **Total** = the sum of the rounded unit taxes. **Share** = a unit's tax ÷ the total.
- **Value:** prefilled from the API's `parcel.value` (the appraisal district's `market` or `assessed` value for
  `tax_year`), and yours to change: it is not the sale price, and the estimate is before any exemption.
- **Rates:** each unit's `rates.adopted` from the API, with its source. A unit with no adopted rate yet is listed as
  left out of the total; you may type a rate for it.
- **PIDs:** a unit whose `levy` is `assessment` is a public improvement district. It levies an assessment, not a tax
  rate ([Property Code § 5.014](https://statutes.capitol.texas.gov/Docs/PR/htm/PR.5.htm#5.014)), so it is listed
  apart and never summed.

The math is in `calc.js`; `examples.json` holds worked examples that `calc.test.js` checks.

## Run it

```sh
cp .env.example .env               # from the repo root; then put your key in TEXASTAXAPI_KEY
npm run property-tax-estimate      # from the repo root; open the address it prints
npm test                           # from the repo root; runs every demo's tests
```

Copying the folder into your own project? Run `node --env-file=.env server.js` beside your `.env`.

## Build your own

The prompt that builds this demo from nothing: paste it into a coding agent in an empty folder, with your key in
`TEXASTAXAPI_KEY` (`TEXASTAXAPI_API_URL` defaults to `https://api.texastaxapi.com`; the repo's
`.env.example` names both).

```text
Build a one-page Texas property tax calculator. A small Node server (no dependencies) takes an address, calls GET {TEXASTAXAPI_API_URL}/v1/lookup?address=… with my key from TEXASTAXAPI_KEY (header Authorization: Bearer <key>), and returns the JSON. Read both from the environment, as the repo's .env.example names them; TEXASTAXAPI_API_URL defaults to https://api.texastaxapi.com. The page reads only parcel.value.amount, county.name and each unit's name, type, levy, rates.adopted and estimated_tax.adopted. The page lists each taxing unit with its type and adopted rate (units[].rates.adopted, per $100 of value). It computes each unit's tax as value × rate / 100, rounded half up to the cent, and the total as the sum of the rounded units. It prefills the value from parcel.value and lets me change it, recomputing without another request. It lists a unit with no adopted rate as left out of the total, with a field to type a rate, and lists a unit whose levy is "assessment" (a PID) apart, never summed as a tax.
```

## The calls it makes

One call per address, from `server.js`:

- `GET {TEXASTAXAPI_API_URL}/v1/lookup?address=<the address>`, header `Authorization: Bearer <TEXASTAXAPI_KEY>`.
- Fields read: `units[].name`, `type`, `levy`, `rates.adopted`; `parcel.value` (`kind`, `amount`, `tax_year`);
  `county.name`; `address.normalized`; the `X-Request-Id` header, shown so you can quote it.
- An error answer is `{ "error": { "code", "message" } }`; the page shows its message.
