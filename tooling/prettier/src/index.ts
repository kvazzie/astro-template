import type { Config } from "prettier";

export const basePrettierConfig: Config = {
  arrowParens: "always",
  bracketSameLine: true,
  bracketSpacing: true,
  embeddedLanguageFormatting: "auto",
  jsxSingleQuote: false,
  plugins: ["prettier-plugin-astro", "prettier-plugin-tailwindcss"],
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
