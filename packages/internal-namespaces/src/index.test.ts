import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { defineInternalNamespaces } from "./index.ts";

describe("defineInternalNamespaces", () => {
  let packageDirectory: string;

  beforeAll(() => {
    packageDirectory = mkdtempSync(
      join(tmpdir(), "internal-namespace-package-"),
    );

    for (const entrypoint of ["i18n", "localization", "content/site"]) {
      const entrypointDirectory = join(packageDirectory, "src", entrypoint);
      mkdirSync(entrypointDirectory, { recursive: true });
      writeFileSync(join(entrypointDirectory, "index.ts"), "export {};\n");
    }
  });

  afterAll(() => {
    rmSync(packageDirectory, { force: true, recursive: true });
  });

  function define(
    definitions: Parameters<typeof defineInternalNamespaces>[0],
    globalIdentifiers: Iterable<string> = [],
  ) {
    return defineInternalNamespaces(definitions, {
      consumerScope: {
        bootstrapFiles: ["apps/web/src/content.config.ts"],
        sourceDirectory: "apps/web/src",
        sourceExtensions: ["js", "ts", "tsx", "astro"],
      },
      globalIdentifiers,
      packageRoot: pathToFileURL(`${packageDirectory}/`),
    });
  }

  it("returns an immutable configured module for a valid registry", () => {
    const definitions = [{ namespace: "i18n", from: "#/i18n" }];
    const internalNamespaces = define(definitions);

    expect(internalNamespaces.namespaces).toEqual(definitions);
    expect(internalNamespaces.namespaces).not.toBe(definitions);
    expect(Object.isFrozen(internalNamespaces)).toBe(true);
    expect(Object.isFrozen(internalNamespaces.namespaces)).toBe(true);
    expect(Object.isFrozen(internalNamespaces.namespaces[0])).toBe(true);
    expect(Object.isFrozen(internalNamespaces.consumerScope)).toBe(true);
  });

  it("rejects workspace packages from the implicit namespace seam", () => {
    expect(() =>
      define([{ namespace: "shared", from: "@workspace/shared" }]),
    ).toThrow(
      'Internal namespace "shared" must use a current-package #/ specifier, received "@workspace/shared"',
    );
  });

  it("rejects duplicate namespace bindings", () => {
    expect(() =>
      define([
        { namespace: "i18n", from: "#/i18n" },
        { namespace: "i18n", from: "#/localization" },
      ]),
    ).toThrow('Internal namespace "i18n" is registered more than once');
  });

  it("rejects multiple names for the same module interface", () => {
    expect(() =>
      define([
        { namespace: "translations", from: "#/i18n" },
        { namespace: "i18n", from: "#/i18n" },
      ]),
    ).toThrow(
      'Internal namespace entrypoint "#/i18n" is registered more than once',
    );
  });

  it("rejects namespace names that cannot be referenced as identifiers", () => {
    expect(() =>
      define([{ namespace: "site-content", from: "#/content/site" }]),
    ).toThrow(
      'Internal namespace "site-content" must be a valid non-reserved JavaScript identifier',
    );
  });

  it("rejects identifiers forbidden as strict ESM bindings", () => {
    expect(() =>
      define([{ namespace: "eval", from: "#/content/site" }]),
    ).toThrow(
      'Internal namespace "eval" must be a valid non-reserved JavaScript identifier',
    );
  });

  it("rejects namespace names that collide with configured globals", () => {
    expect(() =>
      define([{ namespace: "Astro", from: "#/content/site" }], ["Astro"]),
    ).toThrow('Internal namespace "Astro" collides with a configured global');
  });

  it("rejects entrypoints that escape the current package source root", () => {
    expect(() =>
      define([{ namespace: "shared", from: "#/../packages/shared" }]),
    ).toThrow(
      'Internal namespace "shared" must not escape the current-package source root, received "#/../packages/shared"',
    );
  });

  it("rejects registered folders without a public entrypoint", () => {
    expect(() =>
      define([{ namespace: "missing", from: "#/missing" }]),
    ).toThrow(
      'Internal namespace "missing" must resolve to a folder index.ts entrypoint for "#/missing"',
    );
  });

  it("rejects an entrypoint that imports its own registered interface", () => {
    const entrypointDirectory = join(packageDirectory, "src/self-module");
    mkdirSync(entrypointDirectory, { recursive: true });
    writeFileSync(
      join(entrypointDirectory, "index.ts"),
      'export { value } from "#/self-module/private";\n',
    );

    expect(() =>
      define([{ namespace: "selfModule", from: "#/self-module" }]),
    ).toThrow(
      'Internal namespace "selfModule" entrypoint must not import its own registered interface "#/self-module"',
    );
  });
});
