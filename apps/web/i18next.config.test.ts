import { describe, expect, it } from "vitest";

import { astroI18nextOptions } from "./i18next.config";

describe("i18next runtime catalog paths", () => {
  it("isolates the generated default catalog from tracked secondary locales", () => {
    const loadPath = astroI18nextOptions.backend.loadPath;

    expect(loadPath("en", "common")).toBe(
      "src/assets/i18next/.en/common.json",
    );
    expect(loadPath("ru", "common")).toBe("src/assets/i18next/ru/common.json");
  });
});
