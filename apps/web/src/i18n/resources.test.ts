import { describe, expect, it } from "vitest";
import i18next from "i18next";

import common from "#/assets/i18next/.en/common.json";

import { isTranslationKey, type TranslationKey } from "./resources";

function verifyGeneratedTranslationTypes() {
  i18next.t("page.title");
  const metadataKey: TranslationKey = "site.name";

  // @ts-expect-error Generated keys reject unknown translation calls.
  i18next.t("page.missing");
  // @ts-expect-error Generated keys reject unknown metadata references.
  const invalidMetadataKey: TranslationKey = "site.missing";

  return { metadataKey, invalidMetadataKey };
}

void verifyGeneratedTranslationTypes;

describe("translation-key boundary", () => {
  it("exposes every default extracted from application source", () => {
    expect(common).toEqual({
      a11y: {
        skipToContent: "Skip to content",
      },
      page: {
        description: "A clean starting point for the next site.",
        heading: "Start building.",
        intro:
          "The project foundation is ready; the product decisions are yours.",
        title: "Home",
      },
      site: {
        description: "An opinionated Astro project foundation.",
        name: "Astro project",
      },
    });
  });

  it("accepts catalog keys and rejects arbitrary authored text", () => {
    expect(isTranslationKey("page.title")).toBe(true);
    expect(isTranslationKey("A title written directly in content")).toBe(
      false,
    );
  });
});
