import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import i18next from "@gutenye/astro-i18next/integration";
import { defineConfig, envField } from "astro/config";
import { loadEnv } from "vite";

import {
  defaultLocale,
  localeLanguageTags,
  supportedLocales,
} from "./src/i18n/config";

const defaultSiteUrl = "https://example.com";
const environment = loadEnv(
  process.env.NODE_ENV ?? "development",
  process.cwd(),
  "",
);
const site = environment.PUBLIC_SITE_URL ?? defaultSiteUrl;

export default defineConfig({
  output: "static",
  site,
  env: {
    schema: {
      PUBLIC_SITE_URL: envField.string({
        context: "server",
        access: "public",
        default: defaultSiteUrl,
        url: true,
      }),
    },
  },
  integrations: [
    // This integration injects Astro's native i18n config from `preload` and
    // `lng`; declaring a second top-level config creates duplicate routes.
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
