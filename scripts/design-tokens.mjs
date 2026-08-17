import { spawnSync } from "node:child_process";
import {
  closeSync,
  mkdtempSync,
  openSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { mkdir, rename, writeFile } from "node:fs/promises";
import { watch } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parse as parseYaml } from "yaml";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const designPath = path.join(repositoryRoot, "DESIGN.md");
const outputPath = path.join(
  repositoryRoot,
  "apps/web/src/assets/.generated/design.css",
);
const designMdEntrypoint = fileURLToPath(
  import.meta.resolve("@google/design.md"),
);

const colorRoles = [
  "base-100",
  "base-200",
  "base-300",
  "base-content",
  "primary",
  "primary-content",
  "secondary",
  "secondary-content",
  "accent",
  "accent-content",
  "neutral",
  "neutral-content",
  "info",
  "info-content",
  "success",
  "success-content",
  "warning",
  "warning-content",
  "error",
  "error-content",
];

export const REQUIRED_DESIGN_TOKENS = [
  ...["light", "dark"].flatMap((theme) =>
    colorRoles.map((role) => `--color-${theme}-${role}`),
  ),
  "--font-body",
  "--radius-control-selector",
  "--radius-control-field",
  "--radius-container-box",
  "--spacing-selector-unit",
  "--spacing-field-unit",
  "--spacing-border",
  "--spacing-focus-ring",
  "--spacing-focus-offset",
  "--spacing-daisy-depth",
  "--spacing-daisy-noise",
  "--spacing-sm",
  "--spacing-md",
];

export function validateDesignCss(css) {
  const missing = REQUIRED_DESIGN_TOKENS.filter(
    (token) => !css.includes(`${token}:`),
  );

  return { ok: missing.length === 0, missing };
}

export function appendDaisyFeatureTokens(css, designSource) {
  const frontmatter = designSource.match(/^---\r?\n([\s\S]*?)\r?\n---/);

  if (!frontmatter) {
    throw new Error("DESIGN.md must begin with YAML front matter");
  }

  const design = parseYaml(frontmatter[1]);
  const features = {
    "daisy-depth": design?.spacing?.["daisy-depth"],
    "daisy-noise": design?.spacing?.["daisy-noise"],
  };

  for (const [name, value] of Object.entries(features)) {
    if (typeof value !== "number" || value < 0 || value > 1) {
      throw new Error(`spacing.${name} must be a number between 0 and 1`);
    }
  }

  const declarations = Object.entries(features)
    .map(([name, value]) => `  --spacing-${name}: ${value};`)
    .join("\n");

  return css.replace(/\n}\s*$/, `\n${declarations}\n}\n`);
}

function runDesignMd(args) {
  // designmd's async CLI currently flushes output only when stdout is inherited
  // or file-backed. A temporary file keeps generation deterministic while still
  // letting us validate the complete output before replacing the target.
  const temporaryDirectory = mkdtempSync(path.join(tmpdir(), "designmd-"));
  const stdoutPath = path.join(temporaryDirectory, "stdout");
  const stdout = openSync(stdoutPath, "w");

  try {
    const result = spawnSync(process.execPath, [designMdEntrypoint, ...args], {
      cwd: repositoryRoot,
      encoding: "utf8",
      stdio: ["ignore", stdout, "pipe"],
    });

    closeSync(stdout);
    const output = readFileSync(stdoutPath, "utf8");

    if (result.status !== 0) {
      const detail = [output, result.stderr].filter(Boolean).join("\n");
      throw new Error(`designmd ${args[0]} failed\n${detail}`);
    }

    return output;
  } finally {
    try {
      closeSync(stdout);
    } catch {
      // The descriptor was already closed after a successful spawn.
    }
    rmSync(temporaryDirectory, { force: true, recursive: true });
  }
}

function exportDesignCss() {
  runDesignMd(["lint", designPath]);
  const designSource = readFileSync(designPath, "utf8");
  const css = appendDaisyFeatureTokens(
    runDesignMd(["export", "--format", "css-tailwind", designPath]),
    designSource,
  );
  const validation = validateDesignCss(css);

  if (!validation.ok) {
    throw new Error(
      `DESIGN.md is missing required DaisyUI bridge tokens:\n${validation.missing.join("\n")}`,
    );
  }

  return css;
}

async function generateDesignCss() {
  const css = exportDesignCss();
  const temporaryPath = `${outputPath}.${process.pid}.tmp`;

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(temporaryPath, css, "utf8");
  await rename(temporaryPath, outputPath);
  console.log(`Generated ${path.relative(repositoryRoot, outputPath)}`);
}

function checkDesignCss() {
  exportDesignCss();
  console.log("DESIGN.md and the DaisyUI token contract are valid");
}

async function watchDesignCss() {
  await generateDesignCss();
  let timer;

  console.log("Watching DESIGN.md for changes");
  watch(designPath, () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      generateDesignCss().catch((error) => {
        console.error(error instanceof Error ? error.message : error);
      });
    }, 75);
  });
}

async function main(command) {
  switch (command) {
    case "check":
      checkDesignCss();
      break;
    case "generate":
      await generateDesignCss();
      break;
    case "watch":
      await watchDesignCss();
      break;
    default:
      throw new Error("Usage: design-tokens.mjs <check|generate|watch>");
  }
}

const isEntrypoint = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
  : false;

if (isEntrypoint) {
  main(process.argv[2]).catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
