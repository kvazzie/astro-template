import { existsSync, readFileSync } from "node:fs";
import globals from "globals";

export interface InternalNamespaceDefinition {
  namespace: string;
  from: string;
}

const reservedIdentifiers = new Set([
  "arguments",
  "await",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "enum",
  "eval",
  "export",
  "extends",
  "false",
  "finally",
  "for",
  "function",
  "if",
  "implements",
  "import",
  "in",
  "instanceof",
  "interface",
  "let",
  "new",
  "null",
  "package",
  "private",
  "protected",
  "public",
  "return",
  "static",
  "super",
  "switch",
  "this",
  "throw",
  "true",
  "try",
  "typeof",
  "var",
  "void",
  "while",
  "with",
  "yield",
]);
export const webApplicationGlobals = Object.freeze({
  ...globals.browser,
  ...globals.es2026,
  Astro: "readonly",
});
const applicationGlobalIdentifiers = new Set(
  Object.keys(webApplicationGlobals),
);

export const webInternalNamespaceConsumerScope = Object.freeze({
  bootstrapFiles: Object.freeze(["apps/web/src/content.config.ts"]),
  sourceExtensions: Object.freeze(["js", "ts", "tsx", "astro"]),
  sourceDirectory: "apps/web/src",
});

export function defineInternalNamespaces(
  definitions: readonly InternalNamespaceDefinition[],
  packageRoot = new URL("./", import.meta.url),
) {
  const namespaces = new Set<string>();
  const entrypoints = new Set<string>();

  for (const definition of definitions) {
    if (
      !/^[A-Za-z_$][\w$]*$/u.test(definition.namespace) ||
      reservedIdentifiers.has(definition.namespace)
    ) {
      throw new Error(
        `Internal namespace "${definition.namespace}" must be a valid non-reserved JavaScript identifier`,
      );
    }

    if (applicationGlobalIdentifiers.has(definition.namespace)) {
      throw new Error(
        `Internal namespace "${definition.namespace}" collides with an application global`,
      );
    }

    if (!definition.from.startsWith("#/")) {
      throw new Error(
        `Internal namespace "${definition.namespace}" must use a current-package #/ specifier, received "${definition.from}"`,
      );
    }

    if (definition.from.slice(2).split("/").includes("..")) {
      throw new Error(
        `Internal namespace "${definition.namespace}" must not escape the current-package source root, received "${definition.from}"`,
      );
    }

    if (namespaces.has(definition.namespace)) {
      throw new Error(
        `Internal namespace "${definition.namespace}" is registered more than once`,
      );
    }

    if (entrypoints.has(definition.from)) {
      throw new Error(
        `Internal namespace entrypoint "${definition.from}" is registered more than once`,
      );
    }

    const entrypoint = new URL(
      `src/${definition.from.slice(2)}/index.ts`,
      packageRoot,
    );

    if (!existsSync(entrypoint)) {
      throw new Error(
        `Internal namespace "${definition.namespace}" must resolve to a folder index.ts entrypoint for "${definition.from}"`,
      );
    }

    const escapedSpecifier = definition.from.replace(
      /[.*+?^${}()|[\]\\]/gu,
      "\\$&",
    );
    const selfImportPattern = new RegExp(
      `(?:\\bfrom\\s*|\\bimport\\s*)["']${escapedSpecifier}(?:/[^"']*)?["']`,
      "u",
    );

    if (selfImportPattern.test(readFileSync(entrypoint, "utf8"))) {
      throw new Error(
        `Internal namespace "${definition.namespace}" entrypoint must not import its own registered interface "${definition.from}"`,
      );
    }

    namespaces.add(definition.namespace);
    entrypoints.add(definition.from);
  }

  return Object.freeze(
    definitions.map((definition) => Object.freeze({ ...definition })),
  );
}

export const webInternalNamespaces = defineInternalNamespaces([
  { namespace: "i18n", from: "#/i18n" },
  { namespace: "siteContent", from: "#/content/site" },
]);
