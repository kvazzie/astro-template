import { defineInternalNamespaces } from "@workspace/internal-namespaces";
import globals from "globals";
export const webApplicationGlobals = Object.freeze({
  ...globals.browser,
  ...globals.es2026,
  Astro: "readonly",
});

export const webInternalNamespaces = defineInternalNamespaces(
  [
    { namespace: "Crush", from: "#/crush" },
    { namespace: "i18n", from: "#/i18n" },
    { namespace: "siteContent", from: "#/content/site" },
  ],
  {
    consumerScope: {
      bootstrapFiles: ["apps/web/src/content.config.ts"],
      sourceDirectory: "apps/web/src",
      sourceExtensions: ["js", "ts", "tsx", "astro"],
    },
    globalIdentifiers: Object.keys(webApplicationGlobals),
    packageRoot: new URL("./", import.meta.url),
  },
);
