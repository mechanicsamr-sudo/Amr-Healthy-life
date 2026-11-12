"use client";

import Link from "next/link";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { IconChevron } from "./icons";

export function PageHeader({ title, subtitle, back, actions, display = false }: { title: string; subtitle?: ReactNode; back?: string; actions?: ReactNode; display?: boolean }) {
  const { L, dir } = useI18n();
  return (
    <header className="mb-4 flex items-start gap-2">
      {back && (
        <Link href={back} className="btn-ghost -ms-2 px-2 no-print" aria-label={L("رجوع", "Back")}>
          <IconChevron className={dir === "rtl" ? "rotate-180" : ""} />
        </Link>
      )}
      <div className="min-w-0 flex-1">
        {title && <h1 className={display ? "display text-4xl" : "text-2xl font-bold leading-tight"}>{title}</h1>}
        {subtitle && <div className="mt-1 text-sm text-muted">{subtitle}</div>}
      </div>
      {actions}
    </header>
  );
}

export function Section({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="mb-5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "green" | "amber" | "red" | "blue" | "accent" }) {
  const tones = {
    neutral: "surface-2 text-[rgb(var(--text))]",
    green: "bg-green-600/15 text-green-600 dark:text-green-400",
    amber: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    red: "bg-red-600/15 text-red-700 dark:text-red-300",
    blue: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
    accent: "bg-[rgb(var(--accent)/0.16)] text-accent",
  };
  return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold ${tones[tone]}`}>{children}</span>;
}

export function Alert({ tone = "amber", title, children, icon }: { tone?: "amber" | "red" | "blue" | "green"; title?: string; children?: ReactNode; icon?: ReactNode }) {
  const tones = {
    amber: "border-amber-400/50 bg-amber-500/10",
    red: "border-red-500/50 bg-red-500/10",
    blue: "border-sky-400/50 bg-sky-500/10",
    green: "border-green-500/50 bg-green-500/10",
  };
  const titleTone = { amber: "text-amber-700 dark:text-amber-300", red: "text-red-700 dark:text-red-300", blue: "text-sky-700 dark:text-sky-300", green: "text-green-700 dark:text-green-300" };
  return (
    <div role={tone === "red" ? "alert" : "note"} className={`rounded-2xl border p-3 text-sm ${tones[tone]}`}>
      <div className="flex gap-2">
        {icon && <div className={`mt-0.5 shrink-0 ${titleTone[tone]}`}>{icon}</div>}
        <div className="min-w-0">
          {title && <div className={`mb-1 font-bold ${titleTone[tone]}`}>{title}</div>}
          {children}
        </div>
      </div>
    </div>
  );
}

export function Modal({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const { L, dir } = useI18n();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-labelledby={id}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className="m-0 mt-auto max-h-[92vh] w-full max-w-none overflow-hidden rounded-t-[28px] p-0 backdrop:bg-black/60 sm:m-auto sm:max-w-lg sm:rounded-[28px]"
      style={{ background: "rgb(var(--surface))", color: "rgb(var(--text))" }}
    >
      {open && (
        <div className="flex max-h-[92vh] flex-col" dir={dir}>
          <div className="flex items-center justify-between border-b border-base px-4 py-3">
            <h2 id={id} className="text-lg font-bold">
              {title}
            </h2>
            <button className="btn-ghost px-3" onClick={onClose} aria-label={L("إغلاق", "Close")}>
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">{children}</div>
          {footer && <div className="border-t border-base p-3">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
  max,
  suffix,
  inputMode = "decimal",
  testId,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  step?: number;
  min?: number;
  max?: number;
  suffix?: string;
  inputMode?: "decimal" | "numeric";
  testId?: string;
}) {
  const id = useId();
  const { L } = useI18n();
  const clamp = (v: number) => Math.min(max ?? Infinity, Math.max(min, Math.round(v * 100) / 100));
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <div className="flex items-stretch gap-1">
        <button type="button" className="btn-secondary w-12 shrink-0 px-0 text-xl" aria-label={`${L("إنقاص", "Decrease")} ${label}`} onClick={() => onChange(clamp((value ?? 0) - step))}>
          −
        </button>
        <div className="relative flex-1">
          <input
            id={id}
            data-testid={testId}
            className="input ltr text-center text-lg font-bold"
            type="number"
            inputMode={inputMode}
            step={step}
            min={min}
            max={max}
            value={value ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "") return onChange(null);
              const n = Number(v);
              if (!Number.isNaN(n)) onChange(clamp(n));
            }}
          />
          {suffix && <span className="pointer-events-none absolute end-2 top-1/2 -translate-y-1/2 text-xs text-muted">{suffix}</span>}
        </div>
        <button type="button" className="btn-secondary w-12 shrink-0 px-0 text-xl" aria-label={`${L("زيادة", "Increase")} ${label}`} onClick={() => onChange(clamp((value ?? 0) + step))}>
          +
        </button>
      </div>
    </div>
  );
}

/** مجموعة اختيار من متعدد بأزرار كبيرة (بديل للكتابة) */
export function Choice<T extends string>({
  label,
  options,
  value,
  onChange,
  cols = 3,
  testId,
  allowClear = true,
}: {
  label?: string;
  options: { id: T; label: string; sub?: string; emoji?: string; danger?: boolean }[];
  value: T | null | undefined;
  onChange: (v: T | null) => void;
  cols?: number;
  testId?: string;
  allowClear?: boolean;
}) {
  return (
    <fieldset>
      {label && <legend className="label">{label}</legend>}
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }} data-testid={testId}>
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={value === o.id}
            className={`choice ${o.danger ? "danger" : ""}`}
            onClick={() => onChange(value === o.id && allowClear ? null : o.id)}
          >
            <span>
              {o.emoji && <span className="me-1">{o.emoji}</span>}
              {o.label}
            </span>
            {o.sub && <span className="sub">{o.sub}</span>}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  return (
    <div className="h-3 w-full overflow-hidden rounded-full surface-2" role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: "rgb(var(--accent))" }} />
    </div>
  );
}

export function Ring({ pct, size = 64, stroke = 7, label, sub }: { pct: number; size?: number; stroke?: number; label?: ReactNode; sub?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${Math.round(pct)}%`}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--border))" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgb(var(--accent))"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${(c * Math.min(100, Math.max(0, pct))) / 100} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dasharray .5s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-tight">
        <b className="ltr" style={{ fontSize: size / 4.3 }}>
          {label ?? `${Math.round(pct)}%`}
        </b>
        {sub && <span className="text-[10px] text-muted">{sub}</span>}
      </div>
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <div className="card p-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 text-xl font-bold">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-muted">{hint}</div>}
    </div>
  );
}

export function Loading() {
  const { L } = useI18n();
  return <div className="py-10 text-center text-muted">{L("جارٍ التحميل…", "Loading…")}</div>;
}
