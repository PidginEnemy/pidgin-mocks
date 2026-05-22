import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { setTimeout } from "node:timers/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");
const withPortScript = join(projectRoot, "scripts", "with-port.mjs");
const mode = process.argv[2] === "dev" ? "dev" : "start";

await setTimeout(800);

const child = spawn(process.execPath, [withPortScript, mode], {
  cwd: projectRoot,
  detached: true,
  stdio: "ignore",
  env: process.env,
});

child.unref();
