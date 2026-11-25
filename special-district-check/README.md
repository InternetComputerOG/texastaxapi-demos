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

Paste this prompt into a coding agent in an empty folder, or open it in one from [its page](https://texastaxapi.com/demos/special-district-check).
The agent reads this README and the docs, builds your own copy, and walks you through the few steps only you can
do, getting a free key among them.

```text
Set up my own copy of the texastaxapi.com demo "MUD, PID and ESD check for a Texas address" (https://texastaxapi.com/demos/special-district-check) in this folder, and walk me through the steps only I can do.

For the details, read these before you write anything:
- https://raw.githubusercontent.com/InternetComputerOG/texastaxapi-demos/main/special-district-check/README.md: the formula, its sources, the fields it reads and the one API call. The demo's code is in that folder; you may start from it.
- https://texastaxapi.com/llms.txt: the API docs for agents, and the Markdown pages it links.

Build what the README describes and nothing more: a small Node server with no dependencies that serves one page and keeps the key on the server. It reads TEXASTAXAPI_KEY and TEXASTAXAPI_API_URL from a .env file (run it with node --env-file=.env); TEXASTAXAPI_API_URL defaults to https://api.texastaxapi.com. If .env exists, keep its values. If not, create it with an empty TEXASTAXAPI_KEY and that default URL.

Then walk me through, one short step at a time:
1. If TEXASTAXAPI_KEY is empty: get a free key at https://texastaxapi.com/account/login (sign in with your email; your account page shows the key) and paste it after TEXASTAXAPI_KEY= in .env. Never ask me to paste the key into this chat.
2. Give me the exact command that starts the server.
3. Open the address it prints and look up 13252 George Bush St, Manor, TX 78653.

If you cannot create files or run commands here, give me the files and these steps to do on my computer instead.
```

## The calls it makes

One call per address, from `server.js`:

- `GET {TEXASTAXAPI_API_URL}/v1/lookup?address=<the address>`, header `Authorization: Bearer <TEXASTAXAPI_KEY>`.
- Fields read: `units[].name`, `type`, `levy`, `rates.adopted`, `assessment.annual` (a PID's amount);
  `parcel.value` (`kind`, `amount`, `tax_year`); `county.name`; `address.normalized`; the `X-Request-Id` header.
- An error answer is `{ "error": { "code", "message" } }`; the page shows its message.
