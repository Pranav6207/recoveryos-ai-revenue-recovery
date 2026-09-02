import Link from "next/link";
import type { ReactNode } from "react";

const links = [
  ["Dashboard", "/dashboard"], ["Cases", "/cases"], ["Playbooks", "/playbooks/payment_degradation"], ["Operations", "/operations"], ["Integration lab", "/integration-lab"], ["Verification", "/verification"],
];

export function WorkspaceShell({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-slate-50 text-slate-900"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4"><Link href="/dashboard" className="font-black tracking-tight text-slate-950">Recovery<span className="text-blue-700">OS</span><span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-slate-600">Test Mode</span></Link><nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-slate-600">{links.map(([label, href]) => <Link key={href} className="hover:text-blue-700" href={href}>{label}</Link>)}</nav></div></header><main className="mx-auto max-w-7xl px-5 py-8">{children}</main></div>;
}
