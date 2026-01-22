import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = join(__dirname, "dist");

const rawBasePath = process.env.BASE_PATH ?? "/index";
const basePath = rawBasePath.startsWith("/") ? rawBasePath : `/${rawBasePath}`;
const normalizedBasePath = basePath.endsWith("/")
  ? basePath.slice(0, -1)
  : basePath;

const port = Number(process.env.PORT ?? "8080");
const host = process.env.HOST ?? "0.0.0.0";

const mimeTypes = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

const sendNotFound = (res) => {
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found");
};

const sendFile = async (res, filePath) => {
  const data = await readFile(filePath);
  const mimeType = mimeTypes[extname(filePath)] ?? "application/octet-stream";
  res.writeHead(200, { "Content-Type": mimeType });
  res.end(data);
};

createServer(async (req, res) => {
  if (!req.url) {
    sendNotFound(res);
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/") {
    res.writeHead(302, { Location: `${normalizedBasePath}/` });
    res.end();
    return;
  }

  if (url.pathname === normalizedBasePath) {
    res.writeHead(302, { Location: `${normalizedBasePath}/` });
    res.end();
    return;
  }

  if (!url.pathname.startsWith(`${normalizedBasePath}/`)) {
    sendNotFound(res);
    return;
  }

  const relativePath = url.pathname.replace(normalizedBasePath, "") || "/";
  const filePath = join(distDir, relativePath);

  try {
    const fileStat = await stat(filePath);
    if (fileStat.isFile()) {
      await sendFile(res, filePath);
      return;
    }
  } catch {
    // Fall back to index.html for SPA routes.
  }

  try {
    await sendFile(res, join(distDir, "index.html"));
  } catch {
    sendNotFound(res);
  }
}).listen(port, host, () => {
  console.log(
    `Server running at http://${host}:${port}${normalizedBasePath}/`
  );
});
