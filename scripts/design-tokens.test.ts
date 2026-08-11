import { describe, expect, it } from "vitest";

import {
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
});
