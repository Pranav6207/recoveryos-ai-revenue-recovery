import { NextResponse } from "next/server";

import { createPrivateDemoRun, DEMO_RUN_COOKIE } from "@/lib/recovery-store";

export const runtime = "nodejs";

export async function POST() {
  const { token, run } = await createPrivateDemoRun();
  const response = NextResponse.json({ run: { id: run.id, expiresAt: run.expiresAt, mode: run.mode } });
  response.cookies.set(DEMO_RUN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(run.expiresAt),
  });
  return response;
}
