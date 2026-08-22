import { baseConfig, eslintConfigPrettier, nodeConfig } from "@tooling/eslint";
import { defineConfig } from "eslint/config";

export default defineConfig(
  {
    ignores: ["**/dist/**", "**/node_modules/**"],
  },
  ...baseConfig,
  ...nodeConfig,
  ...eslintConfigPrettier,
);
