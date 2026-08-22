import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

import eslintConfig from "../eslint.config";

const eslint = new ESLint({
  baseConfig: eslintConfig,
  overrideConfigFile: true,
});

describe("root lint ownership", () => {
  it("claims configured root paths", async () => {
    await expect(
      eslint.calculateConfigForFile("scripts/example.ts"),
    ).resolves.toBeDefined();
  });

  it.each(["future-workspace/example.ts", "apps/web/src/example.ts"])(
    "does not claim %s",
    async (filePath) => {
      await expect(
        eslint.calculateConfigForFile(filePath),
      ).resolves.toBeUndefined();
    },
  );
});
