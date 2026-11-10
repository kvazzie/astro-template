import js from "@eslint/js";
import type { Linter, Rule, Scope } from "eslint";
import prettierCompatibilityConfig from "eslint-config-prettier/flat";
import { defineConfig } from "eslint/config";
import eslintPluginAstro from "eslint-plugin-astro";
import * as mdx from "eslint-plugin-mdx";
import globals from "globals";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import tseslint from "typescript-eslint";

const namedImportOnlyModules = [
  "astro",
  "astro/config",
  "astro/loaders",
  "astro/zod",
  "@astrojs/compiler",
  "vite",
  "vitest",
  "vitest/config",
  "eslint/config",
  "i18next-cli",
  "prettier",
] as const;

const namedImportOnlyRestrictions = [
  {
    message: "Framework and environment APIs must use named imports.",
    selector:
      "ImportDeclaration[source.value=/^(?:node:|astro:)/] > :matches(ImportDefaultSpecifier, ImportNamespaceSpecifier)",
  },
  ...namedImportOnlyModules.map((moduleName) => ({
    message: "Framework and environment APIs must use named imports.",
    selector: `ImportDeclaration[source.value=${JSON.stringify(moduleName)}] > :matches(ImportDefaultSpecifier, ImportNamespaceSpecifier)`,
  })),
];

const astroComponentImportRestrictions = [
  {
    message: "Astro components must use default imports.",
    selector:
      "ImportDeclaration[source.value=/\\.astro$/] > ImportNamespaceSpecifier",
  },
  {
    message: "Astro components must use default imports.",
    selector:
      'ImportDeclaration[source.value=/\\.astro$/] > ImportSpecifier[imported.name="default"]',
  },
];

export const baseConfig = defineConfig(
  {
    files: ["**/*.{js,mjs,ts,tsx}"],
    extends: [js.configs.recommended, tseslint.configs.recommended],
  },
  {
    files: ["**/*.{js,mjs,ts,tsx,astro}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...namedImportOnlyRestrictions,
        ...astroComponentImportRestrictions,
      ],
    },
  },
  {
    files: ["**/*.d.ts"],
    rules: {
      "@typescript-eslint/triple-slash-reference": "off",
    },
  },
);

export const nodeConfig = defineConfig({
  files: ["*.{js,mjs,ts}", "scripts/**/*.{js,mjs,ts}"],
  languageOptions: {
    globals: globals.node,
  },
});

export const astroConfig = defineConfig(
  eslintPluginAstro.configs.recommended,
  eslintPluginAstro.configs["jsx-a11y-recommended"],
);

export const mdxConfig = defineConfig(
  {
    ...mdx.flat,
    processor: mdx.createRemarkProcessor({
      ignoreRemarkConfig: true,
      languageMapper: {},
      lintCodeBlocks: false,
    }),
  },
  mdx.flatCodeBlocks,
);

export const eslintConfigPrettier = defineConfig(prettierCompatibilityConfig);

function isWithin(candidate: string, root: string) {
  const pathFromRoot = relative(root, candidate);

  return (
    pathFromRoot === "" ||
    (!pathFromRoot.startsWith("..") && !isAbsolute(pathFromRoot))
  );
}

export interface InternalNamespaceDefinition {
  namespace: string;
  from: string;
}

export interface InternalNamespaceConsumerScope {
  sourceDirectory: string;
  sourceExtensions: readonly string[];
  bootstrapFiles: readonly string[];
}

export interface InternalNamespacesOptions {
  consumerScope: Readonly<InternalNamespaceConsumerScope>;
  namespaces: readonly Readonly<InternalNamespaceDefinition>[];
  globals?: Readonly<Linter.Globals>;
  rootDir?: string;
}

export function createInternalNamespacesConfig(
  options: InternalNamespacesOptions,
) {
  const {
    consumerScope,
    namespaces,
    globals: scopeGlobals = {},
    rootDir = resolve(import.meta.dirname, "../../../"),
  } = options;

  const internalNamespaceGlobals = Object.fromEntries(
    namespaces.map(({ namespace }) => [namespace, "readonly"]),
  );
  const unavailableImplicitNamespaceRestrictions = namespaces.map(
    ({ namespace }) => ({
      message: `The implicit "${namespace}" namespace is unavailable outside the application transform scope; import it explicitly.`,
      name: namespace,
    }),
  );
  const registeredPrivateModuleRestrictions = namespaces.map(
    ({ namespace, from }) => ({
      allowTypeImports: true,
      message: `Use the implicit "${namespace}" namespace instead of importing "${from}" in application source.`,
      name: from,
    }),
  );
  const registeredPrivateSubpathRestrictions = namespaces.map(
    ({ namespace, from }) => ({
      regex: `^${from.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}/`,
      message: `Use the implicit "${namespace}" namespace instead of importing a private subpath of "${from}" in application source.`,
    }),
  );
  const internalNamespaceNames = new Set(
    namespaces.map(({ namespace }) => namespace),
  );
  const registeredPrivateModuleByNamespace = new Map(
    namespaces.map(({ namespace, from }) => [namespace, from]),
  );
  const registeredPrivateNamespaceByModule = new Map(
    namespaces.map(({ namespace, from }) => [from, namespace]),
  );
  const registeredPrivateModuleEntrypoints = namespaces.map(
    ({ from }) => `${consumerScope.sourceDirectory}/${from.slice(2)}/index.ts`,
  );
  const registeredPrivateModuleRoots = namespaces.map(
    ({ namespace, from }) => ({
      namespace,
      root: resolve(rootDir, consumerScope.sourceDirectory, from.slice(2)),
    }),
  );

  const internalTypeImportStyle: Rule.RuleModule = {
    meta: {
      messages: {
        typeImport:
          'Types from "{{from}}" must use `import type * as {{namespace}}`.',
      },
      schema: [],
      type: "problem",
    },
    create(context) {
      return {
        ImportDeclaration(node) {
          if (typeof node.source.value !== "string") return;

          const namespace = registeredPrivateNamespaceByModule.get(
            node.source.value,
          );
          if (!namespace) return;

          const importNode = node as unknown as {
            importKind?: string;
            specifiers: Array<{
              type: string;
              importKind?: string;
              local: { name: string };
            }>;
          };
          const isTypeOnly =
            importNode.importKind === "type" ||
            importNode.specifiers.every(
              (specifier) =>
                specifier.type === "ImportSpecifier" &&
                specifier.importKind === "type",
            );
          if (!isTypeOnly) return;

          const isExpectedTypeNamespace =
            importNode.importKind === "type" &&
            importNode.specifiers.length === 1 &&
            importNode.specifiers[0]?.type === "ImportNamespaceSpecifier" &&
            importNode.specifiers[0].local.name === namespace;

          if (!isExpectedTypeNamespace) {
            context.report({
              data: { from: node.source.value, namespace },
              messageId: "typeImport",
              node,
            });
          }
        },
      };
    },
  };

  const noPrivateRelativeImports: Rule.RuleModule = {
    meta: {
      messages: {
        privateImport:
          'Use the implicit "{{namespace}}" namespace instead of a relative import that bypasses its public entrypoint.',
      },
      schema: [],
      type: "problem",
    },
    create(context) {
      return {
        ImportDeclaration(node) {
          if (
            node.specifiers.length === 0 ||
            typeof node.source.value !== "string" ||
            !node.source.value.startsWith(".")
          ) {
            return;
          }

          const importer = context.filename;
          const importedPath = resolve(dirname(importer), node.source.value);

          for (const registeredModule of registeredPrivateModuleRoots) {
            if (
              isWithin(importedPath, registeredModule.root) &&
              !isWithin(importer, registeredModule.root)
            ) {
              context.report({
                data: { namespace: registeredModule.namespace },
                messageId: "privateImport",
                node,
              });
            }
          }
        },
      };
    },
  };

  const noInternalNamespaceShadow: Rule.RuleModule = {
    meta: {
      messages: {
        shadow:
          '"{{namespace}}" is an implicit internal namespace and must not be shadowed.',
      },
      schema: [],
      type: "problem",
    },
    create(context) {
      return {
        "Program:exit"() {
          const globalScope = context.sourceCode.scopeManager.globalScope;

          if (!globalScope) return;

          const scopes: Scope.Scope[] = [globalScope];

          for (const scope of scopes) {
            scopes.push(...scope.childScopes);

            for (const variable of scope.variables) {
              if (!internalNamespaceNames.has(variable.name)) continue;

              for (const definition of variable.defs) {
                const registeredEntrypoint =
                  registeredPrivateModuleByNamespace.get(variable.name);
                const parentNode = definition.parent as unknown as {
                  importKind?: string;
                  source?: { value?: string };
                };
                const isExplicitTypeNamespace =
                  definition.type === "ImportBinding" &&
                  definition.node.type === "ImportNamespaceSpecifier" &&
                  parentNode.importKind === "type" &&
                  parentNode.source?.value === registeredEntrypoint;

                if (isExplicitTypeNamespace) continue;

                context.report({
                  data: { namespace: variable.name },
                  messageId: "shadow",
                  node: definition.name,
                });
              }
            }
          }
        },
      };
    },
  };

  const internalNamespacesPlugin = {
    rules: {
      "no-private-relative-imports": noPrivateRelativeImports,
      "no-shadow": noInternalNamespaceShadow,
      "type-import-style": internalTypeImportStyle,
    },
  };

  return defineConfig(
    {
      files: [
        `${consumerScope.sourceDirectory}/**/*.{${consumerScope.sourceExtensions.join(",")}}`,
      ],
      languageOptions: {
        globals: {
          ...scopeGlobals,
          ...internalNamespaceGlobals,
        },
      },
      plugins: {
        "internal-namespaces": internalNamespacesPlugin,
      },
      rules: {
        "no-shadow": "off",
        "internal-namespaces/no-private-relative-imports": "error",
        "internal-namespaces/no-shadow": "error",
        "internal-namespaces/type-import-style": "error",
        "no-restricted-imports": [
          "error",
          {
            paths: registeredPrivateModuleRestrictions,
            patterns: registeredPrivateSubpathRestrictions,
          },
        ],
      },
    },
    {
      files: [
        ...consumerScope.bootstrapFiles,
        ...registeredPrivateModuleEntrypoints,
      ],
      rules: {
        "internal-namespaces/no-private-relative-imports": "off",
        "internal-namespaces/no-shadow": "off",
        "no-restricted-globals": [
          "error",
          ...unavailableImplicitNamespaceRestrictions,
        ],
      },
    },
  );
}
