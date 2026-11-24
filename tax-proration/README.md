# Texas property tax proration at closing

## Who it is for

Title companies and realtors who split a Texas address's property tax between seller and buyer at closing.

## The formula and its sources

- **Annual tax** = the sum over the taxing units of value × adopted rate ÷ 100, each rounded half up to the cent
  ([Tax Code § 26.09](https://statutes.capitol.texas.gov/Docs/TX/htm/TX.26.htm#26.09)), or the figure you type from
  the tax statement. A unit with no adopted rate yet is left out and named, so the estimate is low: type the annual
  tax instead. A PID's assessment is not a tax and is left out.
- **Seller's days** = 1 January through the closing date, inclusive, out of 365, or 366 in a leap year. The TREC One
  to Four Family Residential Contract (form 20-19), paragraph 13, prorates taxes "through the Closing Date".
- **Seller's share** = annual tax × seller's days ÷ days in the year, rounded half up to the cent; the **buyer's
  share** is the rest.
- **Who credits whom:** taxes unpaid at closing, the seller credits the buyer the seller's share; already paid, the
  buyer credits the seller the buyer's share.
- The contract adjusts the proration once the year's statements are out; this is the estimate at closing.

The math is in `calc.js`; `examples.json` holds worked examples that `calc.test.js` checks.

## Run it

```sh
cp .env.example .env          # from the repo root; then put your key in TEXASTAXAPI_KEY
npm run tax-proration         # from the repo root; open the address it prints
npm test                      # from the repo root; runs every demo's tests
```

Copying the folder into your own project? Run `node --env-file=.env server.js` beside your `.env`.

## Build your own

The prompt that builds this demo from nothing: paste it into a coding agent in an empty folder, with the key in
`.env`.

```text
Build a Texas closing tax proration calculator. A small Node server (no dependencies) takes an address, calls GET https://api.texastaxapi.com/v1/lookup?address=… with my key from .env (header Authorization: Bearer <key>), and returns the JSON. Estimate the annual tax as the sum over the units with rates.adopted (per $100 of value) of value × rate / 100, each rounded half up to the cent; a PID is an assessment, not a tax. Prefill the value from parcel.value and let me edit it, or type the annual tax myself to override the estimate. Prorate through the closing date: seller days = 1 January through the closing date inclusive, over 365 or 366; seller share = annual × seller days / days in the year, rounded half up; the buyer's share is the rest. If the taxes are unpaid, the seller credits the buyer the seller share; if paid, the buyer credits the seller the buyer share. Recompute as I change the value, the annual tax, the date or the paid box, without another request. If a unit has no adopted rate, say the estimate leaves it out.
```

## The calls it makes

One call per address, from `server.js`:

- `GET {TEXASTAXAPI_API_URL}/v1/lookup?address=<the address>`, header `Authorization: Bearer <TEXASTAXAPI_KEY>`.
- Fields read: `units[].name`, `levy`, `rates.adopted`; `parcel.value` (`kind`, `amount`, `tax_year`); `county.name`;
  `address.normalized`; the `X-Request-Id` header.
- An error answer is `{ "error": { "code", "message" } }`; the page shows its message.
