import {
  astroConfig,
  baseConfig,
  createInternalNamespacesConfig,
  eslintConfigPrettier,
} from "@tooling/eslint";
import { defineConfig } from "eslint/config";
import { relative } from "node:path";
import { fileURLToPath } from "node:url";

import {
  webApplicationGlobals,
  webInternalNamespaces,
} from "./internal-namespaces.ts";

const repositoryRoot = new URL("../../", import.meta.url);
const toWorkspacePath = (repositoryPath: string) =>
  relative(
    import.meta.dirname,
    fileURLToPath(new URL(repositoryPath, repositoryRoot)),
  );

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
    ],
  },
  ...baseConfig,
  ...astroConfig,
  ...createInternalNamespacesConfig({
    consumerScope: {
      ...webInternalNamespaces.consumerScope,
      bootstrapFiles:
        webInternalNamespaces.consumerScope.bootstrapFiles.map(
          toWorkspacePath,
        ),
      sourceDirectory: toWorkspacePath(
        webInternalNamespaces.consumerScope.sourceDirectory,
      ),
    },
    namespaces: webInternalNamespaces.namespaces,
    globals: webApplicationGlobals,
    rootDir: import.meta.dirname,
  }),
  {
    files: ["src/**/*.astro"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "astro/no-exports-from-components": "off",
    },
  },
  ...eslintConfigPrettier,
);
