"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { recoveryTrend } from "@/lib/recovery-data";
import { formatCurrency } from "@/lib/recovery-engine";

export default function RecoveryChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={recoveryTrend} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="recoveryGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#f5b544" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#f5b544" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} dy={8} />
        <Tooltip 
          cursor={{ stroke: "#cbd5e1", strokeDasharray: "3 3" }} 
          contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} 
          formatter={(value) => [`₹${formatCurrency(Number(value) * 1000)}k`, "Recovered"]} 
        />
        <Area type="monotone" dataKey="recovered" stroke="#c97900" strokeWidth={2.5} fill="url(#recoveryGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
