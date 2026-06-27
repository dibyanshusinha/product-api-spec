import { copyFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const swaggerUiPackageJson = require.resolve("swagger-ui-dist/package.json");
const swaggerUiDist = dirname(swaggerUiPackageJson);
const outputDir = join(projectRoot, "docs", "swagger-ui");

const assetFiles = [
  "swagger-ui.css",
  "swagger-ui-bundle.js",
  "swagger-ui-standalone-preset.js"
];

export async function buildSwaggerUi() {
  await mkdir(outputDir, { recursive: true });
  await Promise.all(
    assetFiles.map((assetFile) => copyFile(join(swaggerUiDist, assetFile), join(outputDir, assetFile)))
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await buildSwaggerUi();
  console.log(`Swagger UI assets generated in ${outputDir}`);
}
