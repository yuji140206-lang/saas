#!/usr/bin/env node
// Zero-dependency static file server for previewing dist/.
const http = require("http");
const fs = require("fs");
const path = require("path");
const { ROOT } = require("./lib");

const DIST = path.join(ROOT, "dist");
const PORT = Number(process.env.PORT) || 4173;

const MIME = { ".html": "text/html", ".css": "text/css", ".js": "application/javascript" };

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split("?")[0]);
  if (reqPath === "/") reqPath = "/index.html";
  const filePath = path.join(DIST, reqPath);

  if (!filePath.startsWith(DIST)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found. Run `npm run generate` first.");
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Serving affiliate-hub/dist at http://localhost:${PORT}`);
});
