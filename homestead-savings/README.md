# Texas homestead exemption savings by address

## Who it is for

Realtors and loan officers who want to show a buyer what the Texas school homestead exemption will save at a given
address.

## The formula and its sources

- **Which units:** each unit the API types `school`.
- **Exemption** = the smaller of the value and $140,000, plus $60,000 if the owner is 65 or older or disabled
  ([Tax Code § 11.13(b), (c)](https://statutes.capitol.texas.gov/Docs/TX/htm/TX.11.htm#11.13)).
- **Savings** = exemption × the school district's adopted rate ÷ 100, rounded half up to the cent
  ([Tax Code § 26.09](https://statutes.capitol.texas.gov/Docs/TX/htm/TX.26.htm#26.09)).
- **The amounts, as read and dated:** read 2026-11-23 in the Comptroller's publication 96-1425 (January 2026), for
  2026. The $140,000 applies from tax year 2025; the year the $60,000 took effect is not confirmed here. Older pages
  still show $100,000 and $10,000.
- **Your input, not the API's:** whether the home is a homestead and the owner's age. The page never reads the
  parcel's current exemptions.
- **No adopted rate yet:** the page asks for the school district's rate and never guesses one.
- **Not computed:** a local-option exemption (§ 11.13(n)), a MUD's own homestead exemption, the 10% a year appraisal
  cap ([§ 23.23](https://statutes.capitol.texas.gov/Docs/TX/htm/TX.23.htm#23.23)) and the 65+ school-tax ceiling
  ([§ 11.26](https://statutes.capitol.texas.gov/Docs/TX/htm/TX.11.htm#11.26)).

The math is in `calc.js`; `examples.json` holds worked examples that `calc.test.js` checks.

## Run it

```sh
cp .env.example .env          # from the repo root; then put your key in TEXASTAXAPI_KEY
npm run homestead-savings     # from the repo root; open the address it prints
npm test                      # from the repo root; runs every demo's tests
```

Copying the folder into your own project? Run `node --env-file=.env server.js` beside your `.env`.

## Build your own

The prompt that builds this demo from nothing: paste it into a coding agent in an empty folder, with the key in
`.env`.

```text
Build a Texas homestead savings calculator. A small Node server (no dependencies) takes an address, calls GET https://api.texastaxapi.com/v1/lookup?address=… with my key from .env (header Authorization: Bearer <key>), and returns the JSON. Find the units whose type is school. For each with rates.adopted (per $100 of value), compute the savings as min(value, 140000, plus 60000 if the owner is 65 or older or disabled) × rate / 100, rounded half up to the cent. Prefill the value from parcel.value and let me edit it and a 65-or-older-or-disabled checkbox, recomputing without another request. If a school unit has no adopted rate, ask me for its rate instead of guessing. Say that local-option exemptions and a MUD's own homestead exemption are not computed.
```

## The calls it makes

One call per address, from `server.js`:

- `GET {TEXASTAXAPI_API_URL}/v1/lookup?address=<the address>`, header `Authorization: Bearer <TEXASTAXAPI_KEY>`.
- Fields read: `units[].name`, `type`, `rates.adopted`; `parcel.value` (`kind`, `amount`, `tax_year`); `county.name`;
  `address.normalized`; the `X-Request-Id` header.
- An error answer is `{ "error": { "code", "message" } }`; the page shows its message.
