# <Demo title>

Copy this file to `<slug>/README.md` and fill every section. A demo folder holds `README.md`, `calc.js`,
`calc.test.js`, `examples.json`, `index.html` and `server.js`, with no dependency.

## Who it is for

One or two sentences: the person with this question and what they get.

## The formula and its sources

The formula in plain terms, each input named, and where each number comes from (the API field, a statute, a
published rate), with a link.

## Run it

```sh
cp .env.example .env      # from the repo root; then put your key in TEXASTAXAPI_KEY
npm run <slug>            # from the repo root; open the address it prints
npm test                  # from the repo root; runs every demo's tests
```

## Build your own

Paste this prompt into an agent, or open it in one from the demo's page.
The agent reads this README and the docs, builds your own copy in the form that fits where it runs (an artifact in a
chat app with the texastaxapi.com connector, else what you choose), and walks you through the steps only you can do.

Keep this form, with `<Demo title>` and `<slug>` filled in, so the prompt matches the page's build prompt.

```text
Set up my own copy of the texastaxapi.com demo "<Demo title>" (https://texastaxapi.com/demos/<slug>), and walk me through the steps only I can do.

For the details, read these before you build anything:
- https://raw.githubusercontent.com/InternetComputerOG/texastaxapi-demos/main/<slug>/README.md: the formula, its sources, the fields it reads and the one API call. The demo's code is in that folder; you may start from it.
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

Each API call: method, path, the parameters sent, and the fields read from the response.
