import { fileURLToPath } from "node:url";

import autoImport from "unplugin-auto-import/vite";
import { defineConfig } from "vitest/config";

import * as internalNamespaces from "./apps/web/internal-namespaces.unimport.ts";

export default defineConfig({
  plugins: [
    autoImport(internalNamespaces.createInternalNamespaceAutoImportOptions()),
  ],
  resolve: {
    alias: {
      "#": fileURLToPath(new URL("./apps/web/src", import.meta.url)),
    },
  },
  test: {
    include: ["scripts/**/*.test.ts", "apps/**/*.test.ts"],
  },
});
