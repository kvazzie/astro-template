import type { Config } from "prettier";

export default {
  arrowParens: "always",
  bracketSameLine: true,
  bracketSpacing: true,
  embeddedLanguageFormatting: "auto",
  jsxSingleQuote: false,
  plugins: ["prettier-plugin-astro", "prettier-plugin-tailwindcss"],
  quoteProps: "consistent",
  semi: true,
  singleQuote: false,
  tailwindStylesheet: "./apps/web/src/styles/app.css",
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
} satisfies Config;
