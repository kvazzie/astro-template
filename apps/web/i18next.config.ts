import { transform } from "@astrojs/compiler";
import type createIntegration from "@gutenye/astro-i18next/integration";
import { defineConfig, type Plugin } from "i18next-cli";

import { defaultLocale, supportedLocales } from "./src/i18n";

const defaultCatalogDirectory = `src/assets/i18next/.${defaultLocale}`;

function translationLoadPath(language: string, namespace: string) {
  const localeDirectory =
    language === defaultLocale ? `.${language}` : language;

  return `src/assets/i18next/${localeDirectory}/${namespace}.json`;
}

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
    loadPath: translationLoadPath,
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
