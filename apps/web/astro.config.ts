import sitemap from "@astrojs/sitemap";
import * as Crush from "@kvazzie/crush";
import tailwindcss from "@tailwindcss/vite";
import i18next from "@gutenye/astro-i18next/integration";
import { defineConfig, envField } from "astro/config";
import autoImport from "unplugin-auto-import/astro";
import { loadEnv } from "vite";

import * as i18nextConfig from "./i18next.config";
import * as internalNamespaces from "./internal-namespaces";
import * as i18n from "./src/i18n";

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
    Crush.integration(),
    autoImport(
      internalNamespaces.webInternalNamespaces.createAutoImportOptions(
        "src/@types/internal-namespaces.d.ts",
      ),
    ),
    // This integration injects Astro's native i18n config from `preload` and
    // `lng`; declaring a second top-level config creates duplicate routes.
    i18next(i18nextConfig.astroI18nextOptions),
    sitemap({
      i18n: {
        defaultLocale: i18n.defaultLocale,
        locales: i18n.localeLanguageTags,
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
