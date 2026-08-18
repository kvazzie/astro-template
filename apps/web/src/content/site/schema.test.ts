import { describe, expect, it } from "vitest";

describe("site content schema", () => {
  it("accepts the metadata translation keys owned by the site entry", () => {
    expect(
      siteContent.siteSchema.safeParse({
        nameKey: siteContent.siteMetadataKeys.name,
        defaultDescriptionKey: siteContent.siteMetadataKeys.defaultDescription,
      }).success,
    ).toBe(true);
  });

  it("rejects a catalog key outside the site metadata boundary", () => {
    expect(
      siteContent.siteSchema.safeParse({
        nameKey: "page.title",
        defaultDescriptionKey: siteContent.siteMetadataKeys.defaultDescription,
      }).success,
    ).toBe(false);
  });
});
