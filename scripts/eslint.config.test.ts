import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

import eslintConfig from "../eslint.config";

const eslint = new ESLint({
  baseConfig: eslintConfig,
  overrideConfigFile: true,
});

describe("module import convention", () => {
  it("allows public Astro component contracts", async () => {
    const [result] = await eslint.lintText(
      `---
export interface Props {
  title: string;
}

export const componentName = "example";
---
<h1>{Astro.props.title}</h1>`,
      { filePath: "apps/web/src/layouts/Layout.astro" },
    );

    expect(result.messages.filter(({ severity }) => severity === 2)).toEqual(
      [],
    );
  });

  it("rejects explicit bound imports of registered private modules in application source", async () => {
    const [result] = await eslint.lintText(
      'import { defaultLocale } from "#/i18n";\nvoid defaultLocale;',
      { filePath: "apps/web/src/example.ts" },
    );

    expect(result.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining(
            'Use the implicit "i18n" namespace instead of importing "#/i18n" in application source.',
          ),
          ruleId: "no-restricted-imports",
        }),
      ]),
    );
  });

  it("rejects private subpath imports behind a registered namespace", async () => {
    const [result] = await eslint.lintText(
      'import { siteSchema } from "#/content/site/schema";\nvoid siteSchema;',
      { filePath: "apps/web/src/example.ts" },
    );

    expect(result.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ruleId: "no-restricted-imports" }),
      ]),
    );
  });

  it("rejects relative imports that bypass a registered module interface", async () => {
    const [result] = await eslint.lintText(
      'import { defaultLocale } from "../i18n";\nvoid defaultLocale;',
      { filePath: "apps/web/src/pages/example.ts" },
    );

    expect(result.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: "internal-namespaces/no-private-relative-imports",
        }),
      ]),
    );
  });

  it("rejects type imports that bypass the public folder entrypoint", async () => {
    const [result] = await eslint.lintText(
      'import type { SiteMetadataKey } from "#/content/site/schema";\ntype Key = SiteMetadataKey;\nvoid (0 as unknown as Key);',
      { filePath: "apps/web/src/example.ts" },
    );

    expect(result.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ruleId: "no-restricted-imports" }),
      ]),
    );
  });

  it("accepts explicit type namespaces for registered modules", async () => {
    const [result] = await eslint.lintText(
      'import type * as siteContent from "#/content/site";\ntype Key = siteContent.SiteMetadataKey;\nvoid (0 as unknown as Key);',
      { filePath: "apps/web/src/example.ts" },
    );

    expect(result.messages.filter(({ severity }) => severity === 2)).toEqual(
      [],
    );
  });

  it("rejects named type imports from registered module entrypoints", async () => {
    const [result] = await eslint.lintText(
      'import type { SiteMetadataKey } from "#/content/site";\ntype Key = SiteMetadataKey;\nvoid (0 as unknown as Key);',
      { filePath: "apps/web/src/example.ts" },
    );

    expect(result.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: "internal-namespaces/type-import-style",
        }),
      ]),
    );
  });

  it("accepts explicit internal namespaces in bootstrap configuration", async () => {
    const [result] = await eslint.lintText(
      'import * as siteContent from "./content/site";\nvoid siteContent.siteSchema;',
      { filePath: "apps/web/src/content.config.ts" },
    );

    expect(result.messages.filter(({ severity }) => severity === 2)).toEqual(
      [],
    );
  });

  it("rejects implicit namespaces where the transform is unavailable", async () => {
    const [bootstrapResult] = await eslint.lintText(
      "void i18n.defaultLocale;",
      { filePath: "apps/web/src/content.config.ts" },
    );
    const [entrypointResult] = await eslint.lintText(
      "void siteContent.siteSchema;",
      { filePath: "apps/web/src/i18n/index.ts" },
    );

    for (const result of [bootstrapResult, entrypointResult]) {
      expect(result.messages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ ruleId: "no-restricted-globals" }),
        ]),
      );
    }
  });

  it("rejects declarations that shadow an implicit namespace", async () => {
    const [result] = await eslint.lintText(
      "const i18n = { defaultLocale: 'en' };\nvoid i18n.defaultLocale;",
      { filePath: "apps/web/src/example.ts" },
    );

    expect(result.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: "internal-namespaces/no-shadow",
        }),
      ]),
    );
  });

  it("rejects unrelated type imports that shadow an implicit namespace", async () => {
    const [result] = await eslint.lintText(
      'import type * as i18n from "external-package";\ntype Locale = typeof i18n;\nvoid (0 as unknown as Locale);',
      { filePath: "apps/web/src/example.ts" },
    );

    expect(result.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: "internal-namespaces/no-shadow",
        }),
      ]),
    );
  });

  it("requires named imports for framework and environment APIs", async () => {
    const [result] = await eslint.lintText(
      'import path from "node:path";\nvoid path;',
      { filePath: "scripts/example.ts" },
    );

    expect(result.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: "Framework and environment APIs must use named imports.",
          ruleId: "no-restricted-syntax",
        }),
      ]),
    );
  });

  it("accepts named framework imports and package-defined external defaults", async () => {
    const [result] = await eslint.lintText(
      [
        'import { resolve } from "node:path";',
        'import externalDefault from "external-package";',
        "void resolve;",
        "void externalDefault;",
      ].join("\n"),
      { filePath: "scripts/example.ts" },
    );

    expect(result.messages.filter(({ severity }) => severity === 2)).toEqual(
      [],
    );
  });

  it("accepts explicit workspace packages, components, contracts, and side effects", async () => {
    const [result] = await eslint.lintText(
      [
        'import workspacePackage from "@workspace/shared";',
        'import Layout, { type Props } from "#/layouts/Layout.astro";',
        'import "#/styles/app.css";',
        "type LayoutProps = Props;",
        "void workspacePackage;",
        "void Layout;",
        "void (0 as unknown as LayoutProps);",
      ].join("\n"),
      { filePath: "apps/web/src/example.ts" },
    );

    expect(result.messages.filter(({ severity }) => severity === 2)).toEqual(
      [],
    );
  });

  it("requires Astro components to use their default export", async () => {
    const [result] = await eslint.lintText(
      'import * as Layout from "#/layouts/Layout.astro";\nvoid Layout;',
      { filePath: "apps/web/src/example.ts" },
    );

    expect(result.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: "Astro components must use default imports.",
          ruleId: "no-restricted-syntax",
        }),
      ]),
    );
  });

  it("rejects named-as-default Astro component imports", async () => {
    const [result] = await eslint.lintText(
      'import { default as Layout } from "#/layouts/Layout.astro";\nvoid Layout;',
      { filePath: "apps/web/src/example.ts" },
    );

    expect(result.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: "Astro components must use default imports.",
          ruleId: "no-restricted-syntax",
        }),
      ]),
    );
  });

  it("enforces import shapes in Astro frontmatter", async () => {
    const [result] = await eslint.lintText(
      `---
import * as Layout from "#/layouts/Layout.astro";
import * as content from "astro:content";
---
<Layout />`,
      { filePath: "apps/web/src/pages/[...locale]/index.astro" },
    );

    expect(result.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: "Astro components must use default imports.",
          ruleId: "no-restricted-syntax",
        }),
        expect.objectContaining({
          message: "Framework and environment APIs must use named imports.",
          ruleId: "no-restricted-syntax",
        }),
      ]),
    );
  });
});
