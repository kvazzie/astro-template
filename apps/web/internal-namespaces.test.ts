import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

import * as internalNamespaces from "./internal-namespaces";

describe("internal namespace registry", () => {
  it("rejects workspace packages from the implicit namespace seam", () => {
    expect(() =>
      internalNamespaces.defineInternalNamespaces([
        { namespace: "shared", from: "@workspace/shared" },
      ]),
    ).toThrow(
      'Internal namespace "shared" must use a current-package #/ specifier, received "@workspace/shared"',
    );
  });

  it("rejects duplicate namespace bindings", () => {
    expect(() =>
      internalNamespaces.defineInternalNamespaces([
        { namespace: "i18n", from: "#/i18n" },
        { namespace: "i18n", from: "#/localization" },
      ]),
    ).toThrow('Internal namespace "i18n" is registered more than once');
  });

  it("rejects multiple names for the same module interface", () => {
    expect(() =>
      internalNamespaces.defineInternalNamespaces([
        { namespace: "translations", from: "#/i18n" },
        { namespace: "i18n", from: "#/i18n" },
      ]),
    ).toThrow(
      'Internal namespace entrypoint "#/i18n" is registered more than once',
    );
  });

  it("rejects namespace names that cannot be referenced as identifiers", () => {
    expect(() =>
      internalNamespaces.defineInternalNamespaces([
        { namespace: "site-content", from: "#/content/site" },
      ]),
    ).toThrow(
      'Internal namespace "site-content" must be a valid non-reserved JavaScript identifier',
    );
  });

  it("rejects identifiers forbidden as strict ESM bindings", () => {
    expect(() =>
      internalNamespaces.defineInternalNamespaces([
        { namespace: "eval", from: "#/content/site" },
      ]),
    ).toThrow(
      'Internal namespace "eval" must be a valid non-reserved JavaScript identifier',
    );
  });

  it("rejects namespace names that collide with application globals", () => {
    expect(() =>
      internalNamespaces.defineInternalNamespaces([
        { namespace: "Astro", from: "#/content/site" },
      ]),
    ).toThrow(
      'Internal namespace "Astro" collides with an application global',
    );
  });

  it("rejects entrypoints that escape the current package source root", () => {
    expect(() =>
      internalNamespaces.defineInternalNamespaces([
        { namespace: "shared", from: "#/../packages/shared" },
      ]),
    ).toThrow(
      'Internal namespace "shared" must not escape the current-package source root, received "#/../packages/shared"',
    );
  });

  it("rejects registered folders without a public entrypoint", () => {
    expect(() =>
      internalNamespaces.defineInternalNamespaces([
        { namespace: "missing", from: "#/missing" },
      ]),
    ).toThrow(
      'Internal namespace "missing" must resolve to a folder index.ts entrypoint for "#/missing"',
    );
  });

  it("rejects an entrypoint that imports its own registered interface", () => {
    const packageDirectory = mkdtempSync(
      join(tmpdir(), "internal-namespace-package-"),
    );
    const entrypointDirectory = join(packageDirectory, "src/self-module");
    mkdirSync(entrypointDirectory, { recursive: true });
    writeFileSync(
      join(entrypointDirectory, "index.ts"),
      'export { value } from "#/self-module/private";\n',
    );

    try {
      expect(() =>
        internalNamespaces.defineInternalNamespaces(
          [{ namespace: "selfModule", from: "#/self-module" }],
          pathToFileURL(`${packageDirectory}/`),
        ),
      ).toThrow(
        'Internal namespace "selfModule" entrypoint must not import its own registered interface "#/self-module"',
      );
    } finally {
      rmSync(packageDirectory, { force: true, recursive: true });
    }
  });
});
