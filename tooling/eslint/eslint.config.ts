import { defineConfig } from "eslint/config";

import { baseConfig, eslintConfigPrettier, nodeConfig } from "./src/index.ts";

export default defineConfig(
  {
    ignores: ["**/dist/**", "**/node_modules/**"],
  },
  ...baseConfig,
  ...nodeConfig,
  ...eslintConfigPrettier,
);
