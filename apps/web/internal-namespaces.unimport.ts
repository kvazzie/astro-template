import { createUnimport, type Import } from "unimport";
import type { ImportsMap, Options } from "unplugin-auto-import/types";

import {
  webInternalNamespaceConsumerScope,
  webInternalNamespaces,
} from "./internal-namespaces.ts";

const escapedSourceDirectory =
  webInternalNamespaceConsumerScope.sourceDirectory.replace(
    /[.*+?^${}()|[\]\\]/gu,
    "\\$&",
  );
const escapedSourceExtensions =
  webInternalNamespaceConsumerScope.sourceExtensions.join("|");
const applicationSourcePattern = new RegExp(
  `/${escapedSourceDirectory}/.*\\.(?:${escapedSourceExtensions})(?:\\?.*)?$`,
  "u",
);
const bootstrapAndEntrypointPatterns = [
  ...webInternalNamespaceConsumerScope.bootstrapFiles.map(
    (file) =>
      new RegExp(
        `/${file.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}(?:\\?.*)?$`,
        "u",
      ),
  ),
  ...webInternalNamespaces.map(
    ({ from }) =>
      new RegExp(
        `/${webInternalNamespaceConsumerScope.sourceDirectory}/${from
          .slice(2)
          .replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}/index\\.ts(?:\\?.*)?$`,
        "u",
      ),
  ),
];

function isInternalNamespaceConsumer(id: string) {
  const normalizedId = id.replaceAll("\\", "/");

  return (
    applicationSourcePattern.test(normalizedId) &&
    !bootstrapAndEntrypointPatterns.some((pattern) =>
      pattern.test(normalizedId),
    )
  );
}

export const internalNamespaceImports = webInternalNamespaces.flatMap(
  ({ namespace, from }): Import[] => [{ name: "*", as: namespace, from }],
);

const valueImports = Object.fromEntries(
  webInternalNamespaces.map(({ namespace, from }) => [
    from,
    [["*", namespace]],
  ]),
) as ImportsMap;

export function createInternalNamespaceAutoImportOptions(
  dts: Options["dts"] = false,
) {
  return {
    dts,
    dtsMode: "overwrite",
    exclude: bootstrapAndEntrypointPatterns,
    include: [applicationSourcePattern],
    imports: [valueImports],
    viteOptimizeDeps: false,
  } satisfies Options;
}

export async function generateInternalNamespaceDeclarations() {
  const unimport = createUnimport({ imports: internalNamespaceImports });

  return unimport.generateTypeDeclarations();
}

export async function injectInternalNamespaceImports(
  source: string,
  id: string,
) {
  if (!isInternalNamespaceConsumer(id)) return source;

  const unimport = createUnimport({ imports: internalNamespaceImports });
  const result = await unimport.injectImports(source, id);

  return result.code;
}
