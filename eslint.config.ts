import { baseConfig, eslintConfigPrettier, nodeConfig } from "@tooling/eslint";
import { defineConfig } from "eslint/config";

export default defineConfig(
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "apps/**",
      "packages/**",
      "tooling/**",
    ],
  },
  {
    files: ["*.{js,mjs,ts}", "scripts/**/*.{js,mjs,ts}"],
    extends: [...baseConfig, ...nodeConfig, ...eslintConfigPrettier],
  },
);
