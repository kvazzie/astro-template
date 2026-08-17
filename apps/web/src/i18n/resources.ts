import type { ParseKeys } from "i18next";

import common from "#/assets/i18next/.en/common.json";

export type TranslationKey = ParseKeys<"common">;

function collectKeys(
  value: Record<string, unknown>,
  prefix = "",
): TranslationKey[] {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;

    return typeof child === "string"
      ? [path as TranslationKey]
      : collectKeys(child as Record<string, unknown>, path);
  });
}

export const translationKeys = new Set<TranslationKey>(collectKeys(common));

export function isTranslationKey(value: string): value is TranslationKey {
  return translationKeys.has(value as TranslationKey);
}
