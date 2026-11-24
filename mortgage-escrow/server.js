// A tiny server for the demo, Node's standard library only.
//
// It does two things:
//   GET /                 the page (index.html), and /calc.js, the math the page imports
//   GET /lookup?address=  calls the API's GET /v1/lookup with your key and returns its JSON as is
//
// The key is read from .env (`node --env-file=.env`, which `npm run mortgage-escrow` does) and only ever
// leaves this process in the Authorization header to the API. The browser never sees it.

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

const KEY = process.env.TEXASTAXAPI_KEY;
const API = process.env.TEXASTAXAPI_API_URL || "https://api.texastaxapi.com";
const PORT = Number(process.env.PORT) || 3000;

if (!KEY) {
  console.error("TEXASTAXAPI_KEY is not set: copy .env.example to .env and put your key in it.");
  process.exit(1);
}

const FILES = {
  "/": ["index.html", "text/html; charset=utf-8"],
  "/calc.js": ["calc.js", "text/javascript; charset=utf-8"],
};

createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  try {
    if (req.method === "GET" && FILES[url.pathname]) {
      const [file, type] = FILES[url.pathname];
      res.writeHead(200, { "content-type": type });
      return res.end(await readFile(new URL(file, import.meta.url)));
    }
    if (req.method === "GET" && url.pathname === "/lookup") {
      const address = url.searchParams.get("address")?.trim();
      if (!address) {
        res.writeHead(400, { "content-type": "application/json" });
        return res.end(JSON.stringify({ error: { code: "invalid-request", message: "Enter an address." } }));
      }
      // One API call per address. The page recomputes as you change the price or the loan.
      const api = await fetch(`${API}/v1/lookup?address=${encodeURIComponent(address)}`, {
        headers: { authorization: `Bearer ${KEY}` },
      });
      res.writeHead(api.status, {
        "content-type": "application/json",
        // The request id identifies this answer if you ever need to ask about it.
        "x-request-id": api.headers.get("x-request-id") ?? "",
      });
      return res.end(await api.text());
    }
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("Not found");
  } catch (err) {
    console.error(err);
    res.writeHead(502, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: { code: "upstream", message: "The API could not be reached." } }));
  }
}).listen(PORT, () => console.log(`Mortgage escrow: http://localhost:${PORT}`));
