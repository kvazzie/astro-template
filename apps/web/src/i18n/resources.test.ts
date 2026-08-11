import { describe, expect, it } from "vitest";

import { isTranslationKey } from "./resources";

describe("translation-key boundary", () => {
  it("accepts catalog keys and rejects arbitrary authored text", () => {
    expect(isTranslationKey("page.title")).toBe(true);
    expect(isTranslationKey("A title written directly in content")).toBe(
      false,
    );
  });
});
