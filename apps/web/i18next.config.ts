import { transform } from "@astrojs/compiler";
import type createIntegration from "@gutenye/astro-i18next/integration";
import { defineConfig, type Plugin } from "i18next-cli";

import { defaultLocale, supportedLocales } from "./src/i18n";

const defaultCatalogDirectory = `src/assets/i18next/.${defaultLocale}`;

const astroPlugin = {
  name: "astro",
  async onLoad(code, filePath) {
    if (!filePath.endsWith(".astro")) return code;

    const result = await transform(code, { filename: filePath });

    return result.code;
  },
} satisfies Plugin;

export const astroI18nextOptions = {
  preload: [...supportedLocales],
  lng: defaultLocale,
  fallbackLng: defaultLocale,
  defaultNS: "common",
  ns: ["common"],
  backend: {
    // The integration requires a string template for its hot-update matcher.
    // The only configured locale is the CLI-owned default catalog.
    loadPath: "src/assets/i18next/.{{lng}}/{{ns}}.json",
  },
} satisfies Parameters<typeof createIntegration>[0];

export default defineConfig({
  locales: [defaultLocale],
  extract: {
    input: ["src/**/*.{astro,js,jsx,ts,tsx}"],
    ignore: ["src/**/*.test.{js,jsx,ts,tsx}"],
    output: "src/assets/i18next/.{{language}}/{{namespace}}.json",
    defaultNS: "common",
    primaryLanguage: defaultLocale,
  },
  types: {
    input: [`${defaultCatalogDirectory}/*.json`],
    basePath: defaultCatalogDirectory,
    output: "src/@types/i18next.d.ts",
    resourcesFile: "src/@types/resources.d.ts",
  },
  plugins: [astroPlugin],
});
