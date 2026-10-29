"use client";

import { useState, type ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDateShort } from "@/lib/dates";

const axis = { fontSize: 11, fill: "rgb(var(--muted))" };
const tooltipStyle = {
  contentStyle: { background: "rgb(var(--surface))", border: "1px solid rgb(var(--border))", borderRadius: 12, direction: "rtl" as const, fontSize: 13 },
  labelStyle: { color: "rgb(var(--text))", fontWeight: 700 },
  itemStyle: { color: "rgb(var(--text))" },
};

export interface SeriesDef {
  key: string;
  label: string;
  color: "var(--series-1)" | "var(--series-2)";
}

/** إطار للرسم مع زر عرض الجدول (لإمكانية الوصول) */
function ChartFrame({ title, table, children, empty }: { title: string; table: ReactNode; children: ReactNode; empty: boolean }) {
  const [showTable, setShowTable] = useState(false);
  return (
    <figure className="card">
      <div className="mb-2 flex items-center justify-between gap-2">
        <figcaption className="font-bold">{title}</figcaption>
        {!empty && (
          <button className="text-xs text-muted underline" onClick={() => setShowTable((x) => !x)}>
            {showTable ? "عرض الرسم" : "عرض كجدول"}
          </button>
        )}
      </div>
      {empty ? <div className="py-8 text-center text-sm text-muted">لا توجد بيانات مسجلة بعد.</div> : showTable ? table : <div className="ltr h-56">{children}</div>}
    </figure>
  );
}

function DataTable<T extends Record<string, unknown>>({ data, xKey, series, xFormat }: { data: T[]; xKey: string; series: SeriesDef[]; xFormat?: (v: string) => string }) {
  return (
    <div className="max-h-56 overflow-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-muted">
            <th className="p-1 text-start">التاريخ</th>
            {series.map((s) => (
              <th key={s.key} className="p-1 text-start">
                {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <tr key={i} className="border-t border-base">
              <td className="p-1">{xFormat ? xFormat(String(d[xKey])) : String(d[xKey])}</td>
              {series.map((s) => (
                <td key={s.key} className="ltr p-1 text-start">
                  {d[s.key] == null ? "—" : String(d[s.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LineTrend<T extends Record<string, unknown>>({
  title,
  data,
  xKey = "date",
  series,
  unit = "",
  xIsDate = true,
  domain,
}: {
  title: string;
  data: T[];
  xKey?: string;
  series: SeriesDef[];
  unit?: string;
  xIsDate?: boolean;
  domain?: [number | "auto" | "dataMin" | "dataMax", number | "auto" | "dataMin" | "dataMax"];
}) {
  const fmt = xIsDate ? (v: string) => formatDateShort(v) : undefined;
  return (
    <ChartFrame title={title} empty={data.length === 0} table={<DataTable data={data} xKey={xKey} series={series} xFormat={fmt} />}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
          <CartesianGrid stroke="var(--grid)" vertical={false} />
          <XAxis dataKey={xKey} tick={axis} tickFormatter={fmt} stroke="var(--grid)" minTickGap={16} />
          <YAxis tick={axis} stroke="var(--grid)" domain={domain ?? ["auto", "auto"]} unit={unit} width={48} />
          <Tooltip {...tooltipStyle} labelFormatter={(l) => (fmt ? fmt(String(l)) : String(l))} formatter={(v, n) => [`${v}${unit}`, n]} />
          {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12, direction: "rtl" }} />}
          {series.map((s) => (
            <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2} dot={{ r: 4, strokeWidth: 2, stroke: "rgb(var(--surface))", fill: s.color }} activeDot={{ r: 6 }} connectNulls />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function BarTrend<T extends Record<string, unknown>>({ title, data, xKey, series, unit = "", xLabel, domain }: { title: string; data: T[]; xKey: string; series: SeriesDef[]; unit?: string; xLabel?: (v: string) => string; domain?: [number, number] }) {
  return (
    <ChartFrame title={title} empty={data.length === 0} table={<DataTable data={data} xKey={xKey} series={series} xFormat={xLabel} />}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -12 }} barCategoryGap={4}>
          <CartesianGrid stroke="var(--grid)" vertical={false} />
          <XAxis dataKey={xKey} tick={axis} tickFormatter={xLabel} stroke="var(--grid)" />
          <YAxis tick={axis} stroke="var(--grid)" unit={unit} width={48} domain={domain ?? [0, "auto"]} allowDecimals={false} />
          <Tooltip {...tooltipStyle} cursor={{ fill: "rgba(127,127,127,0.12)" }} labelFormatter={(l) => (xLabel ? xLabel(String(l)) : String(l))} formatter={(v, n) => [`${v}${unit}`, n]} />
          {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12, direction: "rtl" }} />}
          {series.map((s) => (
            <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[4, 4, 0, 0]} maxBarSize={28} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
