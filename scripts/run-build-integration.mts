import { spawnSync } from "node:child_process";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

function run(command: string, args: string[], env = process.env): void {
  const result = spawnSync(command, args, {
    cwd: root,
    env,
    stdio: "inherit",
  });

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run(npmCommand, ["run", "build"], {
  ...process.env,
  LEAD_DELIVERY_ENDPOINT: "https://h6-build-sentinel.invalid/leads",
  LEAD_DELIVERY_AUTHORIZATION: "Bearer h6-build-sentinel-authorization",
});

run(process.execPath, [
  "--import",
  "tsx",
  "--test",
  "tests/build-output.integration.mts",
]);
