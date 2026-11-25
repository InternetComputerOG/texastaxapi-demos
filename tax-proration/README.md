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

Paste this prompt into an agent, or open it in one from [its page](https://texastaxapi.com/demos/tax-proration).
The agent reads this README and the docs, builds your own copy in the form that fits where it runs (an artifact in a
chat app with the texastaxapi.com connector, else what you choose), and walks you through the steps only you can do.

```text
Set up my own copy of the texastaxapi.com demo "Texas property tax proration at closing" (https://texastaxapi.com/demos/tax-proration), and walk me through the steps only I can do.

For the details, read these before you build anything:
- https://raw.githubusercontent.com/InternetComputerOG/texastaxapi-demos/main/tax-proration/README.md: the formula, its sources, the fields it reads and the one API call. The demo's code is in that folder; you may start from it.
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
- Fields read: `units[].name`, `levy`, `rates.adopted`; `parcel.value` (`kind`, `amount`, `tax_year`); `county.name`;
  `address.normalized`; the `X-Request-Id` header.
- An error answer is `{ "error": { "code", "message" } }`; the page shows its message.
