import { ESLint } from "eslint";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import eslintConfig from "../apps/web/eslint.config";

const eslint = new ESLint({
  baseConfig: eslintConfig,
  cwd: fileURLToPath(new URL("../apps/web/", import.meta.url)),
  overrideConfigFile: true,
});

describe("application workspace lint boundary", () => {
  it("rejects registered private imports", async () => {
    const [result] = await eslint.lintText(
      'import { defaultLocale } from "#/i18n";\nvoid defaultLocale;',
      { filePath: "src/example.ts" },
    );

    expect(result.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ruleId: "no-restricted-imports" }),
      ]),
    );
  });

  it("accepts allowed imports", async () => {
    const [result] = await eslint.lintText(
      'import type * as siteContent from "#/content/site";\ntype Key = siteContent.SiteMetadataKey;\nvoid (0 as unknown as Key);',
      { filePath: "src/example.ts" },
    );

    expect(result.messages.filter(({ severity }) => severity === 2)).toEqual(
      [],
    );
  });
});
