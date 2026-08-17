import { describe, expect, it } from "vitest";

import { siteMetadataKeys, siteSchema } from "./schema";

describe("site content schema", () => {
  it("accepts the metadata translation keys owned by the site entry", () => {
    expect(
      siteSchema.safeParse({
        nameKey: siteMetadataKeys.name,
        defaultDescriptionKey: siteMetadataKeys.defaultDescription,
      }).success,
    ).toBe(true);
  });

  it("rejects a catalog key outside the site metadata boundary", () => {
    expect(
      siteSchema.safeParse({
        nameKey: "page.title",
        defaultDescriptionKey: siteMetadataKeys.defaultDescription,
      }).success,
    ).toBe(false);
  });
});
