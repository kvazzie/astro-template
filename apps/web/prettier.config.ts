import { basePrettierConfig } from "@tooling/prettier";
import type { Config } from "prettier";

export default {
  ...basePrettierConfig,
  tailwindStylesheet: "./src/styles/app.css",
} satisfies Config;
