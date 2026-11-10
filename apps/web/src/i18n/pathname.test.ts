import { describe, expect, it } from "vitest";

describe("localizePathname", () => {
  const locales = ["en", "fr"] as const;

  it("keeps the default locale unprefixed", () => {
    expect(i18n.localizePathname("/fr/about", "en", locales, "en")).toBe(
      "/about",
    );
  });

  it("replaces an existing locale prefix", () => {
    expect(i18n.localizePathname("/fr/about", "fr", locales, "en")).toBe(
      "/fr/about",
    );
  });

  it("preserves a trailing slash at the locale root", () => {
    expect(i18n.localizePathname("/", "fr", locales, "en")).toBe("/fr/");
  });
});
