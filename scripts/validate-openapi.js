import fs from "node:fs";
import path from "node:path";

const specPath = path.resolve("docs/openapi.json");

function fail(message) {
  console.error(`OpenAPI validation failed: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(specPath)) {
  fail(`missing file at ${specPath}`);
}

let raw = "";
try {
  raw = fs.readFileSync(specPath, "utf8");
} catch (error) {
  fail(`cannot read file (${String(error)})`);
}

let spec;
try {
  spec = JSON.parse(raw);
} catch (error) {
  fail(`invalid JSON (${String(error)})`);
}

if (typeof spec !== "object" || spec === null || Array.isArray(spec)) {
  fail("root must be a JSON object");
}

if (typeof spec.openapi !== "string" || !spec.openapi.startsWith("3.")) {
  fail("`openapi` must exist and start with `3.`");
}

if (typeof spec.info !== "object" || spec.info === null) {
  fail("`info` object is required");
}
if (typeof spec.info.title !== "string" || !spec.info.title.trim()) {
  fail("`info.title` must be a non-empty string");
}
if (typeof spec.info.version !== "string" || !spec.info.version.trim()) {
  fail("`info.version` must be a non-empty string");
}

if (!Array.isArray(spec.servers) || spec.servers.length === 0) {
  fail("`servers` must be a non-empty array");
}
if (
  !spec.servers.every(
    (server) =>
      server &&
      typeof server === "object" &&
      typeof server.url === "string" &&
      server.url.trim(),
  )
) {
  fail("each server must contain a non-empty `url`");
}

if (
  typeof spec.paths !== "object" ||
  spec.paths === null ||
  Array.isArray(spec.paths)
) {
  fail("`paths` must be an object");
}
if (Object.keys(spec.paths).length === 0) {
  fail("`paths` must include at least one endpoint");
}

const validMethods = new Set([
  "get",
  "put",
  "post",
  "delete",
  "options",
  "head",
  "patch",
  "trace",
]);

for (const [route, operations] of Object.entries(spec.paths)) {
  if (!route.startsWith("/")) {
    fail(`path key must start with '/': ${route}`);
  }
  if (
    typeof operations !== "object" ||
    operations === null ||
    Array.isArray(operations)
  ) {
    fail(`path item for ${route} must be an object`);
  }
  const methods = Object.keys(operations).filter((m) => validMethods.has(m));
  if (methods.length === 0) {
    fail(`path ${route} must define at least one HTTP method`);
  }
}

console.log("OpenAPI validation passed");
