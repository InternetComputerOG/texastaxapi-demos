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

Paste this prompt into an agent, or open it in one from [its page](https://texastaxapi.com/demos/homestead-savings).
The agent reads this README and the docs, builds your own copy in the form that fits where it runs (an artifact in a
chat app with the texastaxapi.com connector, else what you choose), and walks you through the steps only you can do.

```text
Set up my own copy of the texastaxapi.com demo "Texas homestead exemption savings by address" (https://texastaxapi.com/demos/homestead-savings), and walk me through the steps only I can do.

For the details, read these before you build anything:
- https://raw.githubusercontent.com/InternetComputerOG/texastaxapi-demos/main/homestead-savings/README.md: the formula, its sources, the fields it reads and the one API call. The demo's code is in that folder; you may start from it.
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
- Fields read: `units[].name`, `type`, `rates.adopted`; `parcel.value` (`kind`, `amount`, `tax_year`); `county.name`;
  `address.normalized`; the `X-Request-Id` header.
- An error answer is `{ "error": { "code", "message" } }`; the page shows its message.
