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
cp ../.env.example .env   # then put your key in TEXASTAXAPI_KEY
npm run <slug>            # from the repo root; open the address it prints
npm test                  # from the repo root; runs every demo's tests
```

## Build your own

The prompt that builds this demo from nothing: paste it into a coding agent in an empty folder, with the key in
`.env`.

```text
<the build prompt>
```

## The calls it makes

Each API call: method, path, the parameters sent, and the fields read from the response.
