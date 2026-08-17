import { z } from "astro/zod";

import type { TranslationKey } from "#/i18n/resources";

export const siteMetadataKeys = {
  name: "site.name",
  defaultDescription: "site.description",
} as const satisfies Record<string, TranslationKey>;

export type SiteMetadataKey =
  (typeof siteMetadataKeys)[keyof typeof siteMetadataKeys];

export const siteSchema = z.object({
  nameKey: z.literal(siteMetadataKeys.name),
  defaultDescriptionKey: z.literal(siteMetadataKeys.defaultDescription),
});
