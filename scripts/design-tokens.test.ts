import { describe, expect, it } from "vitest";

import {
  appendDaisyFeatureTokens,
  REQUIRED_DESIGN_TOKENS,
  validateDesignCss,
} from "./design-tokens.mjs";

describe("generated design tokens", () => {
  it("reports every DaisyUI token missing from generated CSS", () => {
    const css = "@theme { --color-light-base-100: #fff; }";

    const result = validateDesignCss(css);

    expect(result).toEqual({
      ok: false,
      missing: REQUIRED_DESIGN_TOKENS.filter(
        (token) => token !== "--color-light-base-100",
      ),
    });
  });

  it("accepts CSS containing the complete public token contract", () => {
    const css = `@theme { ${REQUIRED_DESIGN_TOKENS.map(
      (token) => `${token}: initial;`,
    ).join(" ")} }`;

    expect(validateDesignCss(css)).toEqual({ ok: true, missing: [] });
  });

  it("exports DaisyUI's unitless theme values from DESIGN.md", () => {
    const design = `---
spacing:
  daisy-depth: 0
  daisy-noise: 1
---`;

    expect(appendDaisyFeatureTokens("@theme {\n}\n", design)).toBe(`@theme {
  --spacing-daisy-depth: 0;
  --spacing-daisy-noise: 1;
}\n`);
  });
});
