import common from "./locales/en/common.json";

export const defaultResources = { common } as const;

type Join<Prefix extends string, Key extends string> = Prefix extends ""
  ? Key
  : `${Prefix}.${Key}`;

type LeafKeys<Value, Prefix extends string = ""> = Value extends string
  ? Prefix
  : {
      [Key in keyof Value & string]: LeafKeys<Value[Key], Join<Prefix, Key>>;
    }[keyof Value & string];

export type TranslationKey = LeafKeys<typeof common>;

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
