import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import i18next from "@gutenye/astro-i18next/integration";
import { defineConfig, envField } from "astro/config";
import { loadEnv } from "vite";

import { astroI18nextOptions } from "./i18next.config";
import { defaultLocale, localeLanguageTags } from "./src/i18n";

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
    i18next(astroI18nextOptions),
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
