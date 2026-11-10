import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const turboExecutable = fileURLToPath(
  new URL("../node_modules/.bin/turbo", import.meta.url),
);

interface TurboPlan {
  packages: string[];
  tasks: Array<{
    command: string;
    package: string;
    task: string;
  }>;
}

describe("Turbo task plans", () => {
  it.each(["check", "fmt", "fmt:check", "lint", "lint:fix"])(
    "runs an executable %s task in every workspace",
    async (taskName) => {
      const { stdout } = await execFileAsync(
        turboExecutable,
        ["run", taskName, "--dry-run=json"],
        { cwd: repositoryRoot },
      );
      const plan = JSON.parse(stdout) as TurboPlan;
      const matchingTasks = plan.tasks.filter(({ task }) => task === taskName);

      expect(
        matchingTasks.map(({ package: packageName }) => packageName).sort(),
      ).toEqual(plan.packages.toSorted());
      expect(matchingTasks.map(({ command }) => command)).not.toContain(
        "<NONEXISTENT>",
      );
    },
  );
});
