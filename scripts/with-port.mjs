import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const DEFAULT_PORT = 4000;
const MIN_PORT = 1024;
const MAX_PORT = 65535;

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");
const settingsPath = join(projectRoot, "data", "settings.json");
const nextBin = join(projectRoot, "node_modules", ".bin", "next");

function readPort() {
  if (!existsSync(settingsPath)) {
    return DEFAULT_PORT;
  }

  try {
    const { port } = JSON.parse(readFileSync(settingsPath, "utf8"));
    const value = Number(port);
    if (Number.isInteger(value) && value >= MIN_PORT && value <= MAX_PORT) {
      return value;
    }
  } catch {
    // ignore invalid settings
  }

  return DEFAULT_PORT;
}

const mode = process.argv[2] === "dev" ? "dev" : "start";
const port = readPort();
const args = [mode, "-p", String(port)];

const child = spawn(nextBin, args, {
  cwd: projectRoot,
  stdio: "inherit",
  env: {
    ...process.env,
    PORT: String(port),
    PIDGIN_MODE: mode,
  },
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});
