import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));

interface TurboPlan {
  packages: string[];
  tasks: Array<{
    command: string;
    package: string;
    task: string;
  }>;
}

describe("Turbo lint plan", () => {
  it("runs an executable lint task in every workspace", async () => {
    const { stdout } = await execFileAsync(
      "pnpm",
      ["turbo", "run", "lint", "--dry-run=json"],
      { cwd: repositoryRoot },
    );
    const plan = JSON.parse(stdout) as TurboPlan;
    const lintTasks = plan.tasks.filter(({ task }) => task === "lint");

    expect(
      lintTasks.map(({ package: packageName }) => packageName).sort(),
    ).toEqual(plan.packages.toSorted());
    expect(lintTasks.map(({ command }) => command)).not.toContain(
      "<NONEXISTENT>",
    );
  });
});
