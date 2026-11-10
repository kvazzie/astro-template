import { basePrettierConfig } from "@tooling/prettier";
import type { Config } from "prettier";

export default {
  ...basePrettierConfig,
  tailwindStylesheet: "./apps/web/src/styles/app.css",
} satisfies Config;
