"use client";

import Link from "next/link";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { IconChevron } from "./icons";

export function PageHeader({ title, subtitle, back, actions }: { title: string; subtitle?: ReactNode; back?: string; actions?: ReactNode }) {
  return (
    <header className="mb-4 flex items-start gap-2">
      {back && (
        <Link href={back} className="btn-ghost -ms-2 px-2 no-print" aria-label="رجوع">
          <IconChevron className="rotate-180" />
        </Link>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-bold leading-tight">{title}</h1>
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

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "green" | "amber" | "red" | "blue" }) {
  const tones = {
    neutral: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100",
    green: "bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-100",
    amber: "bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-100",
    red: "bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-100",
    blue: "bg-sky-100 text-sky-900 dark:bg-sky-900/60 dark:text-sky-100",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

export function Alert({ tone = "amber", title, children, icon }: { tone?: "amber" | "red" | "blue" | "green"; title?: string; children?: ReactNode; icon?: ReactNode }) {
  const tones = {
    amber: "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-100",
    red: "border-red-300 bg-red-50 text-red-950 dark:border-red-700 dark:bg-red-950/50 dark:text-red-100",
    blue: "border-sky-300 bg-sky-50 text-sky-950 dark:border-sky-700 dark:bg-sky-950/50 dark:text-sky-100",
    green: "border-brand-300 bg-brand-50 text-brand-900 dark:border-brand-700 dark:bg-brand-950/50 dark:text-brand-100",
  };
  return (
    <div role={tone === "red" ? "alert" : "note"} className={`rounded-xl border p-3 text-sm ${tones[tone]}`}>
      <div className="flex gap-2">
        {icon && <div className="mt-0.5 shrink-0">{icon}</div>}
        <div className="min-w-0">
          {title && <div className="mb-1 font-bold">{title}</div>}
          {children}
        </div>
      </div>
    </div>
  );
}

export function Modal({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
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
      className="m-0 mt-auto max-h-[92vh] w-full max-w-none overflow-hidden rounded-t-3xl p-0 backdrop:bg-black/50 sm:m-auto sm:max-w-lg sm:rounded-3xl"
      style={{ background: "rgb(var(--surface))", color: "rgb(var(--text))" }}
    >
      {open && (
        <div className="flex max-h-[92vh] flex-col" dir="rtl">
          <div className="flex items-center justify-between border-b border-base px-4 py-3">
            <h2 id={id} className="text-lg font-bold">
              {title}
            </h2>
            <button className="btn-ghost px-3" onClick={onClose} aria-label="إغلاق">
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
  const clamp = (v: number) => Math.min(max ?? Infinity, Math.max(min, Math.round(v * 100) / 100));
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <div className="flex items-stretch gap-1">
        <button type="button" className="btn-secondary w-12 shrink-0 px-0 text-xl" aria-label={`إنقاص ${label}`} onClick={() => onChange(clamp((value ?? 0) - step))}>
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
        <button type="button" className="btn-secondary w-12 shrink-0 px-0 text-xl" aria-label={`زيادة ${label}`} onClick={() => onChange(clamp((value ?? 0) + step))}>
          +
        </button>
      </div>
    </div>
  );
}

export function PainScale({ label, value, onChange, testId }: { label: string; value: number | null; onChange: (v: number | null) => void; testId?: string }) {
  return (
    <fieldset>
      <legend className="label">
        {label}: <span className="ltr font-bold">{value ?? "—"}</span> / 10
      </legend>
      <div className="grid grid-cols-11 gap-1" data-testid={testId}>
        {Array.from({ length: 11 }, (_, i) => (
          <button
            key={i}
            type="button"
            aria-pressed={value === i}
            aria-label={`${label} ${i}`}
            onClick={() => onChange(value === i ? null : i)}
            className={`min-h-10 rounded-lg border text-sm font-bold ${
              value === i ? (i >= 7 ? "border-red-600 bg-red-600 text-white" : i >= 4 ? "border-amber-500 bg-amber-500 text-white" : "border-brand-600 bg-brand-600 text-white") : "border-base surface-2"
            }`}
          >
            {i}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  return (
    <div>
      <div className="h-3 w-full overflow-hidden rounded-full surface-2" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
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
  return <div className="py-10 text-center text-muted">جارٍ التحميل…</div>;
}

export function DemoTag() {
  return <Badge tone="blue">بيانات تجريبية</Badge>;
}
