import { describe, expect, it } from "vitest";

describe("site content schema", () => {
  it("names the collection and recovers a usable missing entry", () => {
    expect(siteContent.Site.id).toBe("site");
    expect(siteContent.Site.schema.parse(undefined)).toEqual({
      collection: "site",
      data: {
        defaultDescriptionKey: siteContent.siteMetadataKeys.defaultDescription,
        nameKey: siteContent.siteMetadataKeys.name,
      },
      id: "default",
    });
  });

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
