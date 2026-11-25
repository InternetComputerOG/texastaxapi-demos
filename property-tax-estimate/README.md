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

Paste this prompt into an agent, or open it in one from [its page](https://texastaxapi.com/demos/property-tax-estimate).
The agent reads this README and the docs, builds your own copy in the form that fits where it runs (an artifact in a
chat app with the texastaxapi.com connector, else what you choose), and walks you through the steps only you can do.

```text
Set up my own copy of the texastaxapi.com demo "Texas property tax calculator by address" (https://texastaxapi.com/demos/property-tax-estimate), and walk me through the steps only I can do.

For the details, read these before you build anything:
- https://raw.githubusercontent.com/InternetComputerOG/texastaxapi-demos/main/property-tax-estimate/README.md: the formula, its sources, the fields it reads and the one API call. The demo's code is in that folder; you may start from it.
- https://texastaxapi.com/llms.txt: the API docs for agents, and the Markdown pages it links.

Build what the README describes and nothing more, in the form that fits where you run:
- In a chat app with the texastaxapi.com connector: look up 13252 George Bush St, Manor, TX 78653 with its tool and build an artifact seeded with that result.
- In a chat app without it: tell me how to connect it (https://texastaxapi.com/docs/agents), or build from figures I give you.
- Anywhere else: ask me how I want it built, suggesting the README's small Node server with no dependencies (run with node --env-file=.env).

The key only ever lives on a server, in a .env file with TEXASTAXAPI_KEY and TEXASTAXAPI_API_URL (default https://api.texastaxapi.com), never in browser code or an artifact. If .env exists, keep its values; if not, create it with an empty TEXASTAXAPI_KEY and that default URL.

For a server build, walk me through, one short step at a time:
1. If TEXASTAXAPI_KEY is empty: get a free key at https://texastaxapi.com/account/login (sign in with your email; your account page shows the key) and paste it after TEXASTAXAPI_KEY= in .env. Never ask me to paste the key into this chat.
2. Give me the exact command that starts the server.
3. Open the address it prints and look up 13252 George Bush St, Manor, TX 78653.

If you cannot create files or run commands here, give me the files and these steps to do on my computer instead.
```

## The calls it makes

One call per address, from `server.js`:

- `GET {TEXASTAXAPI_API_URL}/v1/lookup?address=<the address>`, header `Authorization: Bearer <TEXASTAXAPI_KEY>`.
- Fields read: `units[].name`, `type`, `levy`, `rates.adopted`; `parcel.value` (`kind`, `amount`, `tax_year`);
  `county.name`; `address.normalized`; the `X-Request-Id` header, shown so you can quote it.
- An error answer is `{ "error": { "code", "message" } }`; the page shows its message.
