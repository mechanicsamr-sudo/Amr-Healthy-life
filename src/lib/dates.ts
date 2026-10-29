// دوال التاريخ تعمل على نص بصيغة YYYY-MM-DD لتجنّب مشاكل المناطق الزمنية.

const DAY = 86_400_000;

export function parseISODate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** تاريخ اليوم حسب التوقيت المحلي للجهاز */
export function todayISO(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(iso: string, n: number): string {
  return toISODate(new Date(parseISODate(iso).getTime() + n * DAY));
}

export function diffDays(a: string, b: string): number {
  return Math.round((parseISODate(a).getTime() - parseISODate(b).getTime()) / DAY);
}

/** 0 = الأحد ... 6 = السبت */
export function weekday(iso: string): number {
  return parseISODate(iso).getUTCDay();
}

export function isValidISODate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = parseISODate(s);
  return !Number.isNaN(d.getTime()) && toISODate(d) === s;
}

const fmtCache = new Map<string, Intl.DateTimeFormat>();
function fmt(opts: Intl.DateTimeFormatOptions) {
  const key = JSON.stringify(opts);
  let f = fmtCache.get(key);
  if (!f) {
    // أرقام لاتينية لسهولة القراءة أثناء التمرين مع أسماء الأيام والشهور بالعربية
    f = new Intl.DateTimeFormat("ar-EG-u-nu-latn", { timeZone: "UTC", ...opts });
    fmtCache.set(key, f);
  }
  return f;
}

export function formatDateLong(iso: string): string {
  return fmt({ weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(parseISODate(iso));
}

export function formatDateShort(iso: string): string {
  return fmt({ day: "numeric", month: "short" }).format(parseISODate(iso));
}

export function formatDateMedium(iso: string): string {
  return fmt({ weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(parseISODate(iso));
}

export function formatMonth(iso: string): string {
  return fmt({ month: "long", year: "numeric" }).format(parseISODate(iso));
}

export function formatTime(ts: number): string {
  return new Intl.DateTimeFormat("ar-EG-u-nu-latn", { hour: "numeric", minute: "2-digit" }).format(new Date(ts));
}

export function formatDuration(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}
