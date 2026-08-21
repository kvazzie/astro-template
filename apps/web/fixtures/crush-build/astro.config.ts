import { defineConfig } from "astro/config";

import * as Crush from "../../src/crush/index.ts";

export default defineConfig({
  integrations: [Crush.integration()],
  output: "static",
});
