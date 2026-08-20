import { existsSync, readFileSync } from "node:fs";

import { createInternalNamespaceUnimport } from "./unimport.ts";

export interface InternalNamespaceDefinition {
  readonly namespace: string;
  readonly from: string;
}

export interface DefineInternalNamespacesOptions {
  readonly consumerScope: InternalNamespaceConsumerScope;
  readonly globalIdentifiers?: Iterable<string>;
  readonly packageRoot: URL;
}

export interface InternalNamespaceConsumerScope {
  readonly bootstrapFiles: readonly string[];
  readonly sourceDirectory: string;
  readonly sourceExtensions: readonly string[];
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

export function defineInternalNamespaces(
  definitions: readonly InternalNamespaceDefinition[],
  options: DefineInternalNamespacesOptions,
) {
  const globalIdentifiers = new Set(options.globalIdentifiers);
  const namespaceNames = new Set<string>();
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

    if (globalIdentifiers.has(definition.namespace)) {
      throw new Error(
        `Internal namespace "${definition.namespace}" collides with a configured global`,
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

    if (namespaceNames.has(definition.namespace)) {
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
      options.packageRoot,
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

    namespaceNames.add(definition.namespace);
    entrypoints.add(definition.from);
  }

  const namespaces = Object.freeze(
    definitions.map((definition) => Object.freeze({ ...definition })),
  );
  const consumerScope = Object.freeze({
    bootstrapFiles: Object.freeze([...options.consumerScope.bootstrapFiles]),
    sourceDirectory: options.consumerScope.sourceDirectory,
    sourceExtensions: Object.freeze([
      ...options.consumerScope.sourceExtensions,
    ]),
  });
  const unimport = createInternalNamespaceUnimport(namespaces, consumerScope);

  return Object.freeze({
    consumerScope,
    createAutoImportOptions: unimport.createAutoImportOptions,
    generateDeclarations: unimport.generateDeclarations,
    injectImports: unimport.injectImports,
    namespaces,
  });
}
