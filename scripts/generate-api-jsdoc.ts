/**
 * Generates `@openapi` JSDoc headers for every API route handler.
 *
 * Usage:
 *   npm run docs:jsdoc           # write files
 *   npm run docs:jsdoc -- --check # verify coverage without writing
 *
 * The single source of truth is `src/server/openapi/registry.ts`; this script
 * turns each operation into a JSDoc block (human summary + `@openapi` YAML)
 * placed directly above the exported handler so it shows up in IDE hovers and
 * keeps the docs and the code in sync.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  apiOperations,
  type ApiOperation,
  type HttpMethod,
} from "../src/server/openapi/registry";
import { buildOperationObject } from "../src/server/openapi/document";

const ROOT = process.cwd();
const AUTH_LABEL: Record<ApiOperation["auth"], string> = {
  none: "Publik",
  optional: "Opsional — JWT bila tersedia",
  bearer: "Wajib JWT (Authorization: Bearer <token>)",
  admin: "Wajib JWT role `admin` (atau header `x-telemetry-token`)",
};

/* -------------------------------------------------------------------------- */
/* Minimal YAML writer                                                        */
/* -------------------------------------------------------------------------- */

function isPlainString(value: string): boolean {
  return /^[A-Za-z0-9_./:-]+$/.test(value) && !value.endsWith(":");
}

function yamlScalar(value: unknown): string {
  if (typeof value === "string") {
    return isPlainString(value) ? value : JSON.stringify(value);
  }
  if (value === null) return "null";
  return String(value);
}

function yamlLines(value: unknown, indent: number): string[] {
  const pad = " ".repeat(indent);

  if (Array.isArray(value)) {
    if (value.length === 0) return [`${pad}[]`];
    return value.flatMap((item) => {
      if (item !== null && typeof item === "object") {
        const nested = yamlLines(item, indent + 2);
        return [`${pad}-`, ...nested];
      }
      return [`${pad}- ${yamlScalar(item)}`];
    });
  }

  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).filter(
      ([, child]) => child !== undefined,
    );
    if (entries.length === 0) return [`${pad}{}`];

    return entries.flatMap(([key, child]) => {
      const safeKey = isPlainString(key) ? key : JSON.stringify(key);
      if (child !== null && typeof child === "object") {
        if (Array.isArray(child) && child.length === 0) {
          return [`${pad}${safeKey}: []`];
        }
        if (!Array.isArray(child) && Object.keys(child).length === 0) {
          return [`${pad}${safeKey}: {}`];
        }
        return [`${pad}${safeKey}:`, ...yamlLines(child, indent + 2)];
      }
      return [`${pad}${safeKey}: ${yamlScalar(child)}`];
    });
  }

  return [`${pad}${yamlScalar(value)}`];
}

/** Render the request body schema without the enclosing `content` wrapper. */
function bodySchemaFor(operation: ApiOperation): unknown {
  const object = buildOperationObject(operation) as {
    requestBody?: { content?: Record<string, { schema: unknown }> };
  };
  return object.requestBody?.content?.["application/json"]?.schema;
}

/** Render one operation as an OpenAPI `paths` fragment (YAML, 1-space indent). */
function operationYaml(operation: ApiOperation): string {
  const object = buildOperationObject(operation) as Record<string, unknown>;
  const fragment: Record<string, unknown> = {
    [operation.path]: {
      [operation.method]: object,
    },
  };
  return yamlLines(fragment, 1).join("\n");
}

/** Wrap long description text to keep JSDoc lines readable. */
function wrap(text: string, width = 86): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (current.length + word.length + 1 > width) {
      lines.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/** Build the JSDoc block for one handler. */
function jsdocFor(operation: ApiOperation): string {
  const header = `${operation.method.toUpperCase()} ${operation.path} — ${operation.summary}`;
  const body: string[] = [header, ""];
  for (const line of wrap(operation.description)) body.push(line);
  body.push("");
  body.push(`Auth: ${AUTH_LABEL[operation.auth]}.`);
  body.push(`Sumber kontrak: src/server/openapi/registry.ts#${operation.operationId}.`);
  body.push("");
  body.push("@openapi");
  const yaml = operationYaml(operation);

  const lines = ["/**", ...body.map((line) => (line ? ` * ${line}` : " *"))];
  for (const line of yaml.split("\n")) lines.push(` * ${line}`.trimEnd());
  lines.push(" */");

  // Keep the emitted YAML in sync with the zod contract (sanity guard).
  if (operation.body && !bodySchemaFor(operation)) {
    throw new Error(`Body schema missing for ${operation.operationId}`);
  }

  return lines.join("\n");
}

/* -------------------------------------------------------------------------- */
/* Insertion                                                                  */
/* -------------------------------------------------------------------------- */

const HANDLER_RE = /^export async function (get|post|put|patch|delete)\b/gim;
const ANY_JSDOC_RE = /\/\*\*(?:(?!\*\/)[\s\S])*?\*\/\s*$/;

interface PendingEdit {
  start: number;
  end: number;
  text: string;
}

/** Compute the JSDoc edits for a single route file. */
function editsForFile(file: string, operations: ApiOperation[]): PendingEdit[] {
  const source = readFileSync(path.join(ROOT, file), "utf8");
  const edits: PendingEdit[] = [];
  const seen = new Set<string>();

  HANDLER_RE.lastIndex = 0;
  for (const match of source.matchAll(HANDLER_RE)) {
    const method = match[1].toLowerCase() as HttpMethod;
    const operation = operations.find((candidate) => candidate.method === method);
    if (!operation) continue;
    if (seen.has(method)) continue;
    seen.add(method);

    const start = match.index ?? 0;
    // Drop every JSDoc block directly above the handler (previously generated
    // `@openapi` headers and the hand-written summaries they supersede).
    let from = start;
    let existing = source.slice(0, start).match(ANY_JSDOC_RE);
    while (existing) {
      from -= existing[0].length;
      existing = source.slice(0, from).match(ANY_JSDOC_RE);
    }

    edits.push({ start: from, end: start, text: `${jsdocFor(operation)}\n` });
  }

  const missing = operations.filter((operation) => !seen.has(operation.method));
  if (missing.length > 0) {
    throw new Error(
      `${file}: handler not found for ${missing
        .map((operation) => operation.method.toUpperCase())
        .join(", ")}`,
    );
  }

  return edits.sort((a, b) => b.start - a.start);
}

/* -------------------------------------------------------------------------- */
/* Main                                                                       */
/* -------------------------------------------------------------------------- */

function main() {
  const check = process.argv.includes("--check");
  const byFile = new Map<string, ApiOperation[]>();

  for (const operation of apiOperations) {
    const list = byFile.get(operation.file) ?? [];
    list.push(operation);
    byFile.set(operation.file, list);
  }

  let changed = 0;

  for (const [file, operations] of byFile) {
    const absolute = path.join(ROOT, file);
    const original = readFileSync(absolute, "utf8");
    let updated = original;

    for (const edit of editsForFile(file, operations)) {
      updated = updated.slice(0, edit.start) + edit.text + updated.slice(edit.end);
    }

    if (updated !== original) {
      changed += 1;
      if (check) {
        console.error(`out of date: ${file}`);
      } else {
        writeFileSync(absolute, updated, "utf8");
        console.log(`updated ${file}`);
      }
    }
  }

  if (check) {
    if (changed > 0) {
      console.error(`\n${changed} route file(s) need regenerating. Run: npm run docs:jsdoc`);
      process.exit(1);
    }
    console.log(`JSDoc/OpenAPI in sync across ${byFile.size} route files.`);
    return;
  }

  console.log(`\n${byFile.size} route files scanned, ${changed} updated.`);
  console.log(`Covered operations: ${apiOperations.length}.`);
}

main();
