import type { Config } from "prettier";
import { fileURLToPath } from "node:url";

const astroPlugin = fileURLToPath(
  import.meta.resolve("prettier-plugin-astro"),
);
const tailwindPlugin = fileURLToPath(
  import.meta.resolve("prettier-plugin-tailwindcss"),
);

export const basePrettierConfig: Config = {
  arrowParens: "always",
  bracketSameLine: true,
  bracketSpacing: true,
  embeddedLanguageFormatting: "auto",
  jsxSingleQuote: false,
  plugins: [astroPlugin, tailwindPlugin],
  quoteProps: "consistent",
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  overrides: [
    {
      files: "*.astro",
      options: { parser: "astro" },
    },
    {
      files: ["*.json", "*.jsonc"],
      options: { trailingComma: "none" },
    },
  ],
};

export default basePrettierConfig;
