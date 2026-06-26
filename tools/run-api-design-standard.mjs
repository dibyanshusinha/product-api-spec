import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import YAML from "yaml";

const specPath = process.argv[2] ?? "apispec.yaml";
const extraArgs = process.argv.slice(3);
const sourceRulesetPath = "standards/api-design-standard/spectral.yaml";
const generatedRulesetPath = ".tmp/api-design-standard.spectral.yaml";

const ruleset = YAML.parse(readFileSync(sourceRulesetPath, "utf8"));
const aliases = ruleset.aliases ?? {};

for (const rule of Object.values(ruleset.rules ?? {})) {
  if (rule.given) {
    rule.given = expandGiven(rule.given);
  }
}

delete ruleset.aliases;

mkdirSync(dirname(generatedRulesetPath), { recursive: true });
writeFileSync(generatedRulesetPath, YAML.stringify(ruleset));

const spectralBin = join("node_modules", ".bin", process.platform === "win32" ? "spectral.cmd" : "spectral");
const result = spawnSync(
  spectralBin,
  ["lint", specPath, "--ruleset", generatedRulesetPath, ...extraArgs],
  { stdio: "inherit" },
);

process.exit(result.status ?? 1);

function expandGiven(given) {
  if (Array.isArray(given)) {
    return given.flatMap(expandGiven);
  }

  if (typeof given !== "string" || !given.startsWith("#")) {
    return makeJsonPathFiltersDefensive(given);
  }

  const match = given.match(/^#([A-Za-z0-9_-]+)(.*)$/);
  if (!match) {
    return makeJsonPathFiltersDefensive(given);
  }

  const [, aliasName, suffix] = match;
  const alias = aliases[aliasName];
  if (!alias) {
    return makeJsonPathFiltersDefensive(given);
  }

  const expressions = Array.isArray(alias) ? alias : [alias];
  return expressions.map((expression) => makeJsonPathFiltersDefensive(`${expression}${suffix}`));
}

function makeJsonPathFiltersDefensive(expression) {
  return expression
    .replaceAll("@property.match(", "@property && @property.match(")
    .replaceAll("@.name.match(", "@.name && @.name.match(");
}
