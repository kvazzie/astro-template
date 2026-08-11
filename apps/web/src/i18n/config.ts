export const supportedLocales = ["en"] as const;

export type SupportedLocale = (typeof supportedLocales)[number];

export const defaultLocale = "en" satisfies SupportedLocale;

export const localeLanguageTags = {
  en: "en-US",
} as const satisfies Record<SupportedLocale, string>;
