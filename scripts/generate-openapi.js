import fs from "node:fs";
import path from "node:path";

const workerPath = path.resolve("modules/mobile-app-shell/worker.ts");
const specPath = path.resolve("docs/openapi.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function extractRouteOps(workerSource) {
  const routeOps = new Map();
  const pattern =
    /url\.pathname === "([^"]+)"[\s\S]{0,120}?request\.method === "(GET|POST|PUT|PATCH|DELETE)"/g;

  for (const match of workerSource.matchAll(pattern)) {
    const route = match[1];
    const method = match[2].toLowerCase();
    if (!route.startsWith("/api/")) continue;
    if (!routeOps.has(route)) routeOps.set(route, new Set());
    routeOps.get(route).add(method);
  }

  // Regex-routed API paths in worker.ts
  routeOps.set(
    "/api/events/{eventId}/clone",
    new Set(["post", ...(routeOps.get("/api/events/{eventId}/clone") || [])]),
  );
  routeOps.set(
    "/api/events/{slug}/public",
    new Set(["get", ...(routeOps.get("/api/events/{slug}/public") || [])]),
  );

  // Remove catch-all not-found branch
  routeOps.delete("/api/");

  return routeOps;
}

function buildPaths(existingPaths, routeOps) {
  const nextPaths = {};

  for (const route of [...routeOps.keys()].sort()) {
    nextPaths[route] = {};
    const methods = [...routeOps.get(route)].sort();
    for (const method of methods) {
      const existingOp = existingPaths?.[route]?.[method];
      nextPaths[route][method] =
        existingOp || {
          summary: `Auto-generated: ${method.toUpperCase()} ${route}`,
          responses: {
            "200": { description: "OK" },
          },
        };
    }
  }

  return nextPaths;
}

const workerSource = fs.readFileSync(workerPath, "utf8");
const currentSpec = readJson(specPath);
const routeOps = extractRouteOps(workerSource);
const nextSpec = {
  ...currentSpec,
  paths: buildPaths(currentSpec.paths || {}, routeOps),
};

fs.writeFileSync(specPath, `${JSON.stringify(nextSpec, null, 2)}\n`, "utf8");
console.log(`OpenAPI regenerated at ${specPath}`);
