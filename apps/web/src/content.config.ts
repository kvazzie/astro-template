import { defineCollection } from "astro:content";
import { file } from "astro/loaders";

import { siteSchema } from "#/content/site/schema";

const site = defineCollection({
  loader: file("src/content/site/default.json"),
  schema: siteSchema,
});

export const collections = { site };
