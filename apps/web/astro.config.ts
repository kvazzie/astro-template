import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import i18next from "@gutenye/astro-i18next/integration";
import { defineConfig } from "astro/config";

import {
  defaultLocale,
  localeLanguageTags,
  supportedLocales,
} from "./src/i18n/config";

const site = process.env.PUBLIC_SITE_URL ?? "https://example.com";

export default defineConfig({
  output: "static",
  site,
  integrations: [
    i18next({
      preload: [...supportedLocales],
      lng: defaultLocale,
      fallbackLng: defaultLocale,
      defaultNS: "common",
      ns: ["common"],
      backend: {
        loadPath: "src/i18n/locales/{{lng}}/{{ns}}.json",
      },
    }),
    sitemap({
      i18n: {
        defaultLocale,
        locales: localeLanguageTags,
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
