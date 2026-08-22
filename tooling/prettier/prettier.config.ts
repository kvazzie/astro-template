import type { Config } from "prettier";

import { basePrettierConfig } from "./src/index.ts";

export default {
  ...basePrettierConfig,
} satisfies Config;
