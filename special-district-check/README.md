# MUD, PID and ESD check for a Texas address

## Who it is for

Realtors and title companies who need to know whether a Texas address sits in a special district, what each one
levies, and which purchaser notice it carries.

## The formula and its sources

- **Which units:** each unit the API types as a water district under Water Code chapter 49 (`mud`, `ud`, `wd`,
  `wcid`, `fwsd`, `lid`), a public improvement district (`pid`) or an emergency services district (`esd`).
  Drainage districts and municipal management districts are not in this list.
- **Tax per district** = value × its adopted rate ÷ 100, rounded half up to the cent
  ([Tax Code § 26.09](https://statutes.capitol.texas.gov/Docs/TX/htm/TX.26.htm#26.09)).
  **Share** = its tax ÷ the total tax of every unit on the parcel.
- **Notices:** a water district carries the notice to purchaser of
  [Water Code § 49.452](https://statutes.capitol.texas.gov/Docs/WA/htm/WA.49.htm#49.452) (TREC 20-19 ¶ 6E(3)); a PID
  the notice of [Property Code § 5.014](https://statutes.capitol.texas.gov/Docs/PR/htm/PR.5.htm#5.014) (¶ 6E(7)). An
  ESD carries no purchaser notice; its rate is capped at 10¢
  ([Tex. Const. art. III § 48-e](https://statutes.capitol.texas.gov/Docs/CN/htm/CN.3.htm#3.48-e)).
- **PIDs:** a unit whose `levy` is `assessment` levies an assessment, not a tax rate. It is never summed; its amount
  is shown where the API gives one, and otherwise comes from the city or county.
- **None found:** the page says "this parcel's tax records list no MUD, PID or ESD", never that a notice is not
  required: a lookup returns only the units the county lists.

The math is in `calc.js`; `examples.json` holds worked examples that `calc.test.js` checks.

## Run it

```sh
cp .env.example .env               # from the repo root; then put your key in TEXASTAXAPI_KEY
npm run special-district-check     # from the repo root; open the address it prints
npm test                           # from the repo root; runs every demo's tests
```

Copying the folder into your own project? Run `node --env-file=.env server.js` beside your `.env`.

## Build your own

The prompt that builds this demo from nothing: paste it into a coding agent in an empty folder, with your key in
`TEXASTAXAPI_KEY` (`TEXASTAXAPI_API_URL` defaults to `https://api.texastaxapi.com`; the repo's
`.env.example` names both).

```text
Build a page that checks a Texas address for special districts. A small Node server (no dependencies) takes an address, calls GET {TEXASTAXAPI_API_URL}/v1/lookup?address=… with my key from TEXASTAXAPI_KEY (header Authorization: Bearer <key>), and returns the JSON. Read both from the environment, as the repo's .env.example names them; TEXASTAXAPI_API_URL defaults to https://api.texastaxapi.com. The page reads only parcel.value.amount, county.name and each unit's name, type, levy, rates.adopted and estimated_tax.adopted. Filter units to the types mud, ud, wd, wcid, fwsd, lid, pid and esd. For each, show its adopted rate (rates.adopted, per $100 of value), its tax at an editable value prefilled from parcel.value (value × rate / 100, rounded half up to the cent) and its share of the total tax over every unit, recomputing without another request. Flag the water districts as carrying the Water Code 49.452 notice to purchaser and a PID the Property Code 5.014 notice; an ESD carries no purchaser notice. A unit whose levy is "assessment" (a PID) is never summed as a tax. When nothing matches, say "this parcel's tax records list no MUD, PID or ESD", never that a notice is not required.
```

## The calls it makes

One call per address, from `server.js`:

- `GET {TEXASTAXAPI_API_URL}/v1/lookup?address=<the address>`, header `Authorization: Bearer <TEXASTAXAPI_KEY>`.
- Fields read: `units[].name`, `type`, `levy`, `rates.adopted`, `estimated_tax.adopted` (a PID's amount);
  `parcel.value` (`kind`, `amount`, `tax_year`); `county.name`; `address.normalized`; the `X-Request-Id` header.
- An error answer is `{ "error": { "code", "message" } }`; the page shows its message.
