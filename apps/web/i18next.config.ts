import { transform } from "@astrojs/compiler";
import type createIntegration from "@gutenye/astro-i18next/integration";
import { defineConfig, type Plugin } from "i18next-cli";

import * as i18n from "./src/i18n";

const defaultCatalogDirectory = `src/assets/i18next/.${i18n.defaultLocale}`;

function translationLoadPath(language: string, namespace: string) {
  const localeDirectory =
    language === i18n.defaultLocale ? `.${language}` : language;

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
  preload: [...i18n.supportedLocales],
  lng: i18n.defaultLocale,
  fallbackLng: i18n.defaultLocale,
  defaultNS: "common",
  ns: ["common"],
  backend: {
    loadPath: translationLoadPath,
  },
} satisfies Parameters<typeof createIntegration>[0];

export default defineConfig({
  locales: [i18n.defaultLocale],
  extract: {
    input: ["src/**/*.{astro,js,jsx,ts,tsx}"],
    ignore: ["src/**/*.test.{js,jsx,ts,tsx}"],
    output: "src/assets/i18next/.{{language}}/{{namespace}}.json",
    defaultNS: "common",
    primaryLanguage: i18n.defaultLocale,
  },
  types: {
    input: [`${defaultCatalogDirectory}/*.json`],
    basePath: defaultCatalogDirectory,
    output: "src/@types/i18next.d.ts",
    resourcesFile: "src/@types/resources.d.ts",
  },
  plugins: [astroPlugin],
});
