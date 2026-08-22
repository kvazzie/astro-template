import {
  astroConfig,
  baseConfig,
  createInternalNamespacesConfig,
  eslintConfigPrettier,
} from "@tooling/eslint";
import { defineConfig } from "eslint/config";

import {
  webApplicationGlobals,
  webInternalNamespaces,
} from "./internal-namespaces.ts";

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
    consumerScope: webInternalNamespaces.consumerScope,
    namespaces: webInternalNamespaces.namespaces,
    globals: webApplicationGlobals,
  }),
  {
    files: ["apps/web/**/*.astro", "src/**/*.astro"],
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
