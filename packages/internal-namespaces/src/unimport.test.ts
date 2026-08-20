import { transform } from "@astrojs/compiler";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import autoImport from "unplugin-auto-import/vite";
import { build, createServer, type Plugin } from "vite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { defineInternalNamespaces } from "./index.ts";

describe("internal namespace Unimport integration", () => {
  let internalNamespaces: ReturnType<typeof defineInternalNamespaces>;
  let packageDirectory: string;

  beforeAll(() => {
    packageDirectory = mkdtempSync(
      join(tmpdir(), "internal-namespace-unimport-package-"),
    );

    for (const entrypoint of ["i18n", "content/site"]) {
      const entrypointDirectory = join(packageDirectory, "src", entrypoint);
      mkdirSync(entrypointDirectory, { recursive: true });
      writeFileSync(join(entrypointDirectory, "index.ts"), "export {};\n");
    }

    internalNamespaces = defineInternalNamespaces(
      [
        { namespace: "i18n", from: "#/i18n" },
        { namespace: "siteContent", from: "#/content/site" },
      ],
      {
        consumerScope: {
          bootstrapFiles: ["apps/web/src/content.config.ts"],
          sourceDirectory: "apps/web/src",
          sourceExtensions: ["js", "ts", "tsx", "astro"],
        },
        packageRoot: pathToFileURL(`${packageDirectory}/`),
      },
    );
  });

  afterAll(() => {
    rmSync(packageDirectory, { force: true, recursive: true });
  });

  it("injects a true namespace import for a referenced private module", async () => {
    const transformed = await internalNamespaces.injectImports(
      'import i18next from "i18next";\nconst locale = i18n.defaultLocale;',
      "/repo/apps/web/src/consumer.ts",
    );

    expect(transformed).toContain("import * as i18n from '#/i18n';");
    expect(transformed).toContain('import i18next from "i18next";');
  });

  it("declares the implicit namespace value", async () => {
    const declarations = await internalNamespaces.generateDeclarations();

    expect(declarations).toContain(
      "const siteContent: typeof import('#/content/site')",
    );
    expect(declarations).not.toContain("export type * as siteContent");
  });

  it("keeps Astro type namespaces explicit without injecting a runtime import", async () => {
    const compiled = await transform(`---
import type * as siteContent from "#/content/site";

const locale = i18n.defaultLocale;
type MetadataKey = siteContent.SiteMetadataKey;
---
<span>{locale}</span>
`);
    const transformed = await internalNamespaces.injectImports(
      compiled.code,
      "/repo/apps/web/src/consumer.astro",
    );

    expect(transformed).toContain("import * as i18n from '#/i18n';");
    expect(transformed).not.toContain(
      "import * as siteContent from '#/content/site';",
    );
  });

  it("does not transform bootstrap configuration or standalone scripts", async () => {
    const source = "const locale = i18n.defaultLocale;";

    await expect(
      internalNamespaces.injectImports(
        source,
        "/repo/apps/web/src/content.config.ts",
      ),
    ).resolves.toBe(source);
    await expect(
      internalNamespaces.injectImports(source, "/repo/scripts/example.ts"),
    ).resolves.toBe(source);
  });

  it("keeps unused namespace members out of production output", async () => {
    const entryId = "/repo/apps/web/src/tree-shaking.ts";
    const namespaceModuleId = "\0internal-i18n";
    const virtualModules = {
      [entryId]: "console.log(i18n.used());",
      [namespaceModuleId]: [
        'export const used = () => "used";',
        'export const unused = () => "TREE_SHAKING_SENTINEL";',
      ].join("\n"),
    };
    const virtualModulesPlugin = {
      name: "virtual-internal-namespaces",
      resolveId(id) {
        if (id === "#/i18n") return namespaceModuleId;
        if (id === entryId) return id;
      },
      load(id) {
        return virtualModules[id as keyof typeof virtualModules];
      },
    } satisfies Plugin;
    const result = await build({
      build: {
        minify: false,
        rollupOptions: { input: entryId },
        write: false,
      },
      configFile: false,
      logLevel: "silent",
      plugins: [
        autoImport(internalNamespaces.createAutoImportOptions()),
        virtualModulesPlugin,
      ],
    });

    if (Array.isArray(result) || !("output" in result)) {
      throw new Error("Expected one in-memory production build output");
    }

    const output = result.output
      .filter((item) => "code" in item)
      .map((item) => item.code)
      .join("\n");
    expect(output).toContain("used");
    expect(output).not.toContain("TREE_SHAKING_SENTINEL");
  });

  it("observes registered entrypoint changes after graph invalidation", async () => {
    const entryId = "/repo/apps/web/src/watch-consumer.ts";
    const namespaceModuleId = "\0internal-i18n";
    let namespaceSource = 'export const defaultLocale = "en";';
    const virtualEntryPlugin = {
      name: "virtual-watch-consumer",
      resolveId(id) {
        if (id === "#/i18n") return namespaceModuleId;
        if (id === entryId) return id;
      },
      load(id) {
        if (id === entryId) return "export const locale = i18n.defaultLocale;";
        if (id === namespaceModuleId) return namespaceSource;
      },
    } satisfies Plugin;
    const server = await createServer({
      configFile: false,
      logLevel: "silent",
      plugins: [
        autoImport(internalNamespaces.createAutoImportOptions()),
        virtualEntryPlugin,
      ],
      server: { middlewareMode: true },
    });

    try {
      const before = (await server.ssrLoadModule(entryId)) as {
        locale: string;
      };
      expect(before.locale).toBe("en");

      namespaceSource = 'export const defaultLocale = "fr";';
      const namespaceModule =
        server.environments.ssr.moduleGraph.getModuleById(namespaceModuleId);
      if (!namespaceModule)
        throw new Error("Expected namespace module in graph");
      server.environments.ssr.moduleGraph.invalidateModule(namespaceModule);

      const after = (await server.ssrLoadModule(entryId)) as {
        locale: string;
      };
      expect(after.locale).toBe("fr");
    } finally {
      await server.close();
    }
  });
});
