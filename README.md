# texastaxapi-demos

Small, runnable examples of using the [Texas Tax API](https://texastaxapi.com) — the tax rates for a Texas address,
including the special districts (MUDs, PIDs, ESDs) other tax sources miss — from AI agents and ordinary code.

## The API

The Texas Tax API takes a Texas address and returns the tax data for it: the county, city, school and special-district
rates, each value with its source. Each demo here calls `/v1/lookup` and does something useful with the result.

## Get a free key

Sign up at <https://texastaxapi.com/account/login>. The account page shows your key.

## Run a demo

Needs Node 22 or later. There is nothing to install: no demo has a dependency.

1. Copy `.env.example` to `.env` and put your key in `TEXASTAXAPI_KEY`. `TEXASTAXAPI_API_URL` already points at
   `https://api.texastaxapi.com`.
2. Start a demo by its folder name: `npm run <slug>`, then open the address it prints.
3. Run every demo's tests with `npm test`.

The key stays on the demo's small server; the page never sees it.

Each folder is self-contained: copy one into your own project and it runs.

## The demos

| Demo | What it does | Folder | Live page |
| --- | --- | --- | --- |
| `property-tax-estimate` | Each taxing unit's adopted rate and tax for a Texas address, and the total | [property-tax-estimate](property-tax-estimate/) | [texastaxapi.com/demos/property-tax-estimate](https://texastaxapi.com/demos/property-tax-estimate) |
| `special-district-check` | Whether a Texas address sits in a MUD, PID or ESD, what each levies, and the purchaser notice it carries | [special-district-check](special-district-check/) | [texastaxapi.com/demos/special-district-check](https://texastaxapi.com/demos/special-district-check) |
| `homestead-savings` | What the school homestead exemption saves at a Texas address, with the 65+ amount | [homestead-savings](homestead-savings/) | [texastaxapi.com/demos/homestead-savings](https://texastaxapi.com/demos/homestead-savings) |
| `tax-proration` | The year's property tax at a Texas address split between seller and buyer at closing, and who credits whom | [tax-proration](tax-proration/) | [texastaxapi.com/demos/tax-proration](https://texastaxapi.com/demos/tax-proration) |
| `mortgage-escrow` | The monthly mortgage payment on a Texas address with its own property tax in escrow, insurance and HOA | [mortgage-escrow](mortgage-escrow/) | [texastaxapi.com/demos/mortgage-escrow](https://texastaxapi.com/demos/mortgage-escrow) |
| `dscr` | coming | — | — |

Each row will link its folder, `https://github.com/InternetComputerOG/texastaxapi-demos/tree/main/<slug>`, and its
live page, `https://texastaxapi.com/demos/<slug>`.

New demos start from [TEMPLATE.md](TEMPLATE.md).

## License

MIT, see [LICENSE](LICENSE).
