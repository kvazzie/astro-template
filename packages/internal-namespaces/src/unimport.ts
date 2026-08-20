import { createUnimport, type Import } from "unimport";
import type { ImportsMap, Options } from "unplugin-auto-import/types";

import type {
  InternalNamespaceConsumerScope,
  InternalNamespaceDefinition,
} from "./index.ts";

export function createInternalNamespaceUnimport(
  namespaces: readonly InternalNamespaceDefinition[],
  consumerScope: InternalNamespaceConsumerScope,
) {
  const escapedSourceDirectory = consumerScope.sourceDirectory.replace(
    /[.*+?^${}()|[\]\\]/gu,
    "\\$&",
  );
  const escapedSourceExtensions = consumerScope.sourceExtensions.join("|");
  const applicationSourcePattern = new RegExp(
    `/${escapedSourceDirectory}/.*\\.(?:${escapedSourceExtensions})(?:\\?.*)?$`,
    "u",
  );
  const bootstrapAndEntrypointPatterns = [
    ...consumerScope.bootstrapFiles.map(
      (file) =>
        new RegExp(
          `/${file.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}(?:\\?.*)?$`,
          "u",
        ),
    ),
    ...namespaces.map(
      ({ from }) =>
        new RegExp(
          `/${escapedSourceDirectory}/${from
            .slice(2)
            .replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}/index\\.ts(?:\\?.*)?$`,
          "u",
        ),
    ),
  ];
  const namespaceImports = namespaces.flatMap(
    ({ namespace, from }): Import[] => [{ name: "*", as: namespace, from }],
  );
  const valueImports = Object.fromEntries(
    namespaces.map(({ namespace, from }) => [from, [["*", namespace]]]),
  ) as ImportsMap;

  function isConsumer(id: string) {
    const normalizedId = id.replaceAll("\\", "/");

    return (
      applicationSourcePattern.test(normalizedId) &&
      !bootstrapAndEntrypointPatterns.some((pattern) =>
        pattern.test(normalizedId),
      )
    );
  }

  function createAutoImportOptions(dts: Options["dts"] = false) {
    return {
      dts,
      dtsMode: "overwrite",
      exclude: bootstrapAndEntrypointPatterns,
      include: [applicationSourcePattern],
      imports: [valueImports],
      viteOptimizeDeps: false,
    } satisfies Options;
  }

  async function generateDeclarations() {
    const unimport = createUnimport({ imports: namespaceImports });

    return unimport.generateTypeDeclarations();
  }

  async function injectImports(source: string, id: string) {
    if (!isConsumer(id)) return source;

    const unimport = createUnimport({ imports: namespaceImports });
    const result = await unimport.injectImports(source, id);

    return result.code;
  }

  return Object.freeze({
    createAutoImportOptions,
    generateDeclarations,
    injectImports,
  });
}
