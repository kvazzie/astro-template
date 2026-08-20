import js from "@eslint/js";
import type { Rule, Scope } from "eslint";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import { defineConfig } from "eslint/config";
import eslintPluginAstro from "eslint-plugin-astro";
import globals from "globals";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import tseslint from "typescript-eslint";

import {
  webApplicationGlobals,
  webInternalNamespaceConsumerScope,
  webInternalNamespaces,
} from "./apps/web/internal-namespaces.ts";

const internalNamespaceGlobals = Object.fromEntries(
  webInternalNamespaces.map(({ namespace }) => [namespace, "readonly"]),
);
const unavailableImplicitNamespaceRestrictions = webInternalNamespaces.map(
  ({ namespace }) => ({
    message: `The implicit "${namespace}" namespace is unavailable outside the application transform scope; import it explicitly.`,
    name: namespace,
  }),
);
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
const registeredPrivateModuleRestrictions = webInternalNamespaces.map(
  ({ namespace, from }) => ({
    allowTypeImports: true,
    message: `Use the implicit "${namespace}" namespace instead of importing "${from}" in application source.`,
    name: from,
  }),
);
const registeredPrivateSubpathRestrictions = webInternalNamespaces.map(
  ({ namespace, from }) => ({
    regex: `^${from.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}/`,
    message: `Use the implicit "${namespace}" namespace instead of importing a private subpath of "${from}" in application source.`,
  }),
);
const internalNamespaceNames = new Set(
  webInternalNamespaces.map(({ namespace }) => namespace),
);
const registeredPrivateModuleByNamespace = new Map(
  webInternalNamespaces.map(({ namespace, from }) => [namespace, from]),
);
const registeredPrivateNamespaceByModule = new Map(
  webInternalNamespaces.map(({ namespace, from }) => [from, namespace]),
);
const registeredPrivateModuleEntrypoints = webInternalNamespaces.map(
  ({ from }) =>
    `${webInternalNamespaceConsumerScope.sourceDirectory}/${from.slice(2)}/index.ts`,
);
const registeredPrivateModuleRoots = webInternalNamespaces.map(
  ({ namespace, from }) => ({
    namespace,
    root: resolve(
      import.meta.dirname,
      webInternalNamespaceConsumerScope.sourceDirectory,
      from.slice(2),
    ),
  }),
);

function isWithin(candidate: string, root: string) {
  const pathFromRoot = relative(root, candidate);

  return (
    pathFromRoot === "" ||
    (!pathFromRoot.startsWith("..") && !isAbsolute(pathFromRoot))
  );
}

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

        const isTypeOnly =
          node.importKind === "type" ||
          node.specifiers.every(
            (specifier) =>
              specifier.type === "ImportSpecifier" &&
              specifier.importKind === "type",
          );
        if (!isTypeOnly) return;

        const isExpectedTypeNamespace =
          node.importKind === "type" &&
          node.specifiers.length === 1 &&
          node.specifiers[0]?.type === "ImportNamespaceSpecifier" &&
          node.specifiers[0].local.name === namespace;

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
              const isExplicitTypeNamespace =
                definition.type === "ImportBinding" &&
                definition.node.type === "ImportNamespaceSpecifier" &&
                definition.parent.importKind === "type" &&
                definition.parent.source.value === registeredEntrypoint;

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

export default defineConfig(
  {
    ignores: [
      "**/.astro/**",
      "**/dist/**",
      "**/node_modules/**",
      "**/storybook-static/**",
      "**/@types/i18next.d.ts",
      "**/@types/internal-namespaces.d.ts",
      "**/@types/resources.d.ts",
      "**/assets/.generated/**",
      "**/assets/i18next/.en/**",
      ".devenv/**",
      ".direnv/**",
    ],
  },
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
    files: ["*.{js,mjs,ts}", "scripts/**/*.{js,mjs,ts}"],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: [
      `${webInternalNamespaceConsumerScope.sourceDirectory}/**/*.{${webInternalNamespaceConsumerScope.sourceExtensions.join(",")}}`,
    ],
    languageOptions: {
      globals: {
        ...webApplicationGlobals,
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
      ...webInternalNamespaceConsumerScope.bootstrapFiles,
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
  {
    files: ["**/*.d.ts"],
    rules: {
      "@typescript-eslint/triple-slash-reference": "off",
    },
  },
  eslintPluginAstro.configs.recommended,
  eslintPluginAstro.configs["jsx-a11y-recommended"],
  {
    files: ["apps/web/**/*.astro"],
    languageOptions: {
      parserOptions: {
        project: "./apps/web/tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Components publish their Props type and public constants as contracts.
      "astro/no-exports-from-components": "off",
    },
  },
  eslintConfigPrettier,
);
