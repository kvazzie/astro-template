import { defineConfig } from "i18next-cli";

import { defaultLocale, supportedLocales } from "./src/i18n/config";

export default defineConfig({
  locales: [...supportedLocales],
  extract: {
    input: ["src/**/*.{js,jsx,ts,tsx}"],
    output: "src/i18n/locales/{{language}}/{{namespace}}.json",
    defaultNS: "common",
    primaryLanguage: defaultLocale,
  },
  types: {
    input: [`src/i18n/locales/${defaultLocale}/*.json`],
    basePath: `src/i18n/locales/${defaultLocale}`,
    output: "src/i18n/i18next.d.ts",
    resourcesFile: "src/i18n/resources.generated.d.ts",
  },
});
