import { defineCollection } from "astro:content";
import { file } from "astro/loaders";
import { z } from "astro/zod";

import { isTranslationKey, type TranslationKey } from "#/i18n/resources";

const translationKey = z.custom<TranslationKey>(
  (value) => typeof value === "string" && isTranslationKey(value),
  { message: "Expected a key from the default i18n catalog" },
);

const site = defineCollection({
  loader: file("src/content/site/default.json"),
  schema: z.object({
    nameKey: translationKey,
    defaultDescriptionKey: translationKey,
  }),
});

export const collections = { site };
