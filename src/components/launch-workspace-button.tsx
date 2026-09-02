"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LaunchWorkspaceButton({ label = "Launch workspace" }: { label?: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "starting" | "error">("idle");
  async function launch() {
    setState("starting");
    try {
      const response = await fetch("/api/demo-runs", { method: "POST" });
      if (!response.ok) throw new Error("Unable to create demo run");
      router.push("/dashboard");
      router.refresh();
    } catch { setState("error"); }
  }
  return <div><button onClick={launch} disabled={state === "starting"} className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-wait disabled:opacity-70">{state === "starting" ? "Creating private run…" : label}</button>{state === "error" && <p className="mt-2 text-sm text-rose-700">Could not start a demo run. Please try again.</p>}</div>;
}
