import { describe, expect, it } from "vitest";

import { localizePathname } from "./pathname";

describe("localizePathname", () => {
  const locales = ["en", "fr"] as const;

  it("keeps the default locale unprefixed", () => {
    expect(localizePathname("/fr/about", "en", locales, "en")).toBe("/about");
  });

  it("replaces an existing locale prefix", () => {
    expect(localizePathname("/fr/about", "fr", locales, "en")).toBe(
      "/fr/about",
    );
  });

  it("preserves a trailing slash at the locale root", () => {
    expect(localizePathname("/", "fr", locales, "en")).toBe("/fr/");
  });
});
