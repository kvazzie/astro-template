import { defineCollection } from "astro:content";
import { file } from "astro/loaders";

import * as siteContent from "./content/site";

const site = defineCollection({
  loader: file("src/content/site/default.json"),
  schema: siteContent.siteSchema,
});

export const collections = { site };
