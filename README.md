# Product API Spec

Independent OpenAPI contract project for the Product API.

This project owns the API shape. Backend services consume this repository as a git submodule and generate server interfaces/models from `openapi.yaml`.

## Layout

```text
openapi.yaml
components/
standards/
  api-design-standard/   -> reusable API design standard rules
```

## Validate The API Design

Install dependencies in the standards submodule:

```bash
npm install --prefix standards/api-design-standard
```

Run the design standard:

```bash
node standards/api-design-standard/tools/run-api-design-standard.mjs openapi.yaml
```

The lint command uses:

```text
standards/api-design-standard/spectral.yaml
```

Update the standard submodule when the shared standard changes:

```bash
git submodule update --remote standards/api-design-standard
```

## Build And Preview Swagger UI

The latest `main` branch Swagger UI preview is published to GitHub Pages:

```text
https://dibyanshusinha.github.io/product-api-spec/docs/
```

Swagger UI can be served directly from this OpenAPI project without starting the Spring Boot application:

```bash
npm install
npm run docs
```

Then open:

```text
http://localhost:8081/docs/
```

The preview serves `openapi.yaml` and the `components/` files from this directory so relative `$ref` links resolve the same way they do during backend code generation. `npm run docs` first generates local Swagger UI assets under `docs/swagger-ui/`, so the browser does not load Swagger UI from a CDN. Set a different port if needed:

```bash
PORT=9091 npm run docs
```
