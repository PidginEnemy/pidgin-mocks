import { NextResponse } from "next/server";
import {
  getRuntimePort,
  readSettings,
  scheduleServerRestart,
  writeSettings,
} from "@/lib/settings/store";
import { settingsInputSchema } from "@/lib/validations/settings";

export async function GET() {
  const settings = readSettings();
  return NextResponse.json({
    port: settings.port,
    runtimePort: getRuntimePort(),
  });
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const parsed = settingsInputSchema.safeParse({
      port: Number(body.port),
    });

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message ?? "Validation failed";
      return NextResponse.json({ error: firstIssue }, { status: 400 });
    }

    const current = readSettings();
    const nextPort = parsed.data.port;

    if (current.port === nextPort && getRuntimePort() === nextPort) {
      return NextResponse.json({
        port: nextPort,
        runtimePort: getRuntimePort(),
        restarted: false,
      });
    }

    writeSettings({ port: nextPort });

    if (getRuntimePort() !== nextPort) {
      scheduleServerRestart();
      return NextResponse.json({
        port: nextPort,
        runtimePort: nextPort,
        restarted: true,
      });
    }

    return NextResponse.json({
      port: nextPort,
      runtimePort: getRuntimePort(),
      restarted: false,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
