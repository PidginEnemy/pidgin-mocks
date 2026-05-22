import { spawn } from "node:child_process";
import fs from "fs";
import path from "path";
import {
  DEFAULT_PORT,
  MAX_PORT,
  MIN_PORT,
} from "@/lib/settings/constants";

export type AppSettings = {
  port: number;
};

const SETTINGS_FILENAME = "settings.json";

function getSettingsPath(): string {
  return path.join(process.cwd(), "data", SETTINGS_FILENAME);
}

function ensureDataDir(): void {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

export function readSettings(): AppSettings {
  ensureDataDir();
  const settingsPath = getSettingsPath();

  if (!fs.existsSync(settingsPath)) {
    return { port: DEFAULT_PORT };
  }

  try {
    const raw = fs.readFileSync(settingsPath, "utf8");
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    const port = Number(parsed.port);

    if (!Number.isInteger(port) || port < MIN_PORT || port > MAX_PORT) {
      return { port: DEFAULT_PORT };
    }

    return { port };
  } catch {
    return { port: DEFAULT_PORT };
  }
}

export function writeSettings(settings: AppSettings): void {
  ensureDataDir();
  fs.writeFileSync(getSettingsPath(), `${JSON.stringify(settings, null, 2)}\n`, "utf8");
}

export function getConfiguredPort(): number {
  return readSettings().port;
}

export function getRuntimePort(): number {
  const envPort = Number(process.env.PORT);
  if (Number.isInteger(envPort) && envPort >= MIN_PORT && envPort <= MAX_PORT) {
    return envPort;
  }
  return getConfiguredPort();
}

export function scheduleServerRestart(): void {
  const mode = process.env.PIDGIN_MODE === "dev" ? "dev" : "start";
  const scriptPath = path.join(process.cwd(), "scripts", "restart.mjs");

  const child = spawn(process.execPath, [scriptPath, mode], {
    detached: true,
    stdio: "ignore",
    cwd: process.cwd(),
    env: process.env,
  });
  child.unref();

  setTimeout(() => process.exit(0), 400);
}
