import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { buildSwaggerUi } from "./build-swagger-ui.mjs";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const port = Number.parseInt(process.env.PORT ?? process.argv[2] ?? "8081", 10);
const host = process.env.HOST ?? "127.0.0.1";

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".yaml": "application/yaml; charset=utf-8",
  ".yml": "application/yaml; charset=utf-8"
};

function resolveRequestPath(requestUrl) {
  const url = new URL(requestUrl, `http://localhost:${port}`);
  const pathname = url.pathname === "/" ? "/docs/" : url.pathname;
  const relativePath = decodeURIComponent(pathname).replace(/^\/+/, "");
  const candidatePath = normalize(resolve(projectRoot, relativePath));

  if (candidatePath !== projectRoot && !candidatePath.startsWith(projectRoot + sep)) {
    return null;
  }

  return candidatePath;
}

const server = createServer(async (request, response) => {
  const filePath = resolveRequestPath(request.url ?? "/");

  if (!filePath) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  let resolvedFilePath = filePath;
  if (existsSync(filePath) && (await stat(filePath)).isDirectory()) {
    resolvedFilePath = join(filePath, "index.html");
  }

  if (!existsSync(resolvedFilePath)) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "Content-Type": contentTypes[extname(resolvedFilePath)] ?? "application/octet-stream"
  });
  createReadStream(resolvedFilePath).pipe(response);
});

await buildSwaggerUi();

server.listen(port, host, () => {
  console.log(`Product API Swagger UI: http://${host}:${port}/docs/`);
  console.log(`OpenAPI YAML:           http://${host}:${port}/openapi.yaml`);
});
