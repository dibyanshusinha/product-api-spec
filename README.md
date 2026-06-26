# Product API Spec

Independent OpenAPI contract project for the Product API.

This project owns the API shape. Spring Boot services consume this repository as a git submodule and generate server interfaces/models from `apispec.yaml`.

## Layout

```text
apispec.yaml
paths/
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
node standards/api-design-standard/tools/run-api-design-standard.mjs apispec.yaml
```

The lint command uses:

```text
standards/api-design-standard/spectral.yaml
```

Update the standard submodule when the shared standard changes:

```bash
git submodule update --remote standards/api-design-standard
```
