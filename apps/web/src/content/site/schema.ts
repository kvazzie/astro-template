import { z } from "astro/zod";
import type { ParseKeys } from "i18next";

import type * as Crush from "@kvazzie/crush";

type TranslationKey = ParseKeys<"common">;

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

export const siteEntrySchema = z.object({
  body: z.string().optional(),
  collection: z.literal("site"),
  data: siteSchema,
  digest: z.union([z.string(), z.number()]).optional(),
  filePath: z.string().optional(),
  id: z.string(),
  rendered: z
    .object({
      html: z.string(),
      metadata: z.looseObject({ imagePaths: z.array(z.string()) }).optional(),
    })
    .optional(),
});

export const Site = {
  id: "site",
  schema: siteEntrySchema.catch({
    collection: "site",
    data: {
      defaultDescriptionKey: siteMetadataKeys.defaultDescription,
      nameKey: siteMetadataKeys.name,
    },
    id: "default",
  }),
} as const satisfies Crush.CollectionContract;
