"use client";

import Link from "next/link";
import { useState } from "react";
import { ExerciseThumb } from "@/components/ExerciseMedia";
import { IconAlert, IconBook, IconSwap } from "@/components/icons";
import { RedFlagList } from "@/components/Safety";
import { Alert, Badge, Loading, Modal, Ring } from "@/components/ui";
import { phaseForWeek } from "@/data/program";
import { WARMUP_MAP } from "@/data/warmup";
import { updateSettings } from "@/lib/db";
import { addDays, diffDays, formatDateLong, formatDateMedium, formatDayName, isValidISODate } from "@/lib/dates";
import { DISCLAIMER, MOTIVATION } from "@/lib/health";
import { useExercises, useMeasurements, useSchedule } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { LEVELS } from "@/lib/labels";
import { mediaFor, ytThumb } from "@/lib/media";
import { pickCurrentSession, programProgress, programWeekOf, weekRange, type ScheduledSession } from "@/lib/schedule";
import { latestWeight } from "@/lib/stats";
import { sessionTitle } from "@/lib/sessionText";
import { patchOverride } from "@/lib/workout";

function MissedRow({ s, today }: { s: ScheduledSession; today: string }) {
  const { L, lang, pick } = useI18n();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(today);
  const valid = isValidISODate(date) && date >= today;
  return (
    <li className="flex flex-wrap items-center gap-2 border-b border-base py-2 last:border-0" data-testid="missed-row">
      <div className="min-w-0 flex-1">
        <div className="font-medium">
          {L("الأسبوع", "Week")} {s.session.week} – {L("الحصة", "Session")} {s.session.slot}
        </div>
        <div className="text-xs text-muted">
          {L("كانت مقررة:", "Was planned:")} {formatDateMedium(s.date, lang)}
        </div>
      </div>
      <button className="btn-secondary min-h-10 px-3 text-sm" onClick={() => setOpen(true)}>
        {L("إعادة جدولة", "Reschedule")}
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={L("إعادة جدولة الحصة", "Reschedule session")}
        footer={
          <div className="grid grid-cols-2 gap-2">
            <button
              className="btn-secondary"
              onClick={async () => {
                await patchOverride(s.session.id, { skipped: true });
                setOpen(false);
              }}
            >
              {L("تخطي الحصة", "Skip session")}
            </button>
            <button
              className="btn-primary"
              disabled={!valid}
              onClick={async () => {
                await patchOverride(s.session.id, { rescheduledDate: date, skipped: false });
                setOpen(false);
              }}
            >
              {L("حفظ الموعد", "Save date")}
            </button>
          </div>
        }
      >
        <p className="mb-3 text-sm">
          {pick(s.session.name)}. {L("اختار تاريخ جديد يدويًا. باقي الحصص مش هتتغير.", "Pick a new date manually. No other session changes.")}
        </p>
        <label className="label" htmlFor={`d-${s.session.id}`}>
          {L("التاريخ الجديد", "New date")}
        </label>
        <input id={`d-${s.session.id}`} type="date" className="input ltr" min={today} value={date} onChange={(e) => setDate(e.target.value)} />
        {!valid && <p className="mt-1 text-xs text-red-600">{L("اختار تاريخ صحيح النهارده أو بعده.", "Choose a valid date today or later.")}</p>}
        <p className="mt-3 text-xs text-muted">{L("يفضل ترك يوم راحة بين حصص المقاومة.", "Leaving a rest day between strength sessions is best.")}</p>
      </Modal>
    </li>
  );
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${max === min ? 15 : 26 - ((v - min) / (max - min)) * 22}`).join(" ");
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="mt-1 h-7 w-full" aria-hidden="true">
      <polyline points={pts} fill="none" stroke="rgb(var(--accent))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export default function HomePage() {
  const { schedule, loaded, today, settings } = useSchedule();
  const measurements = useMeasurements();
  const { map } = useExercises();
  const { L, lang, pick, dir } = useI18n();
  if (!loaded || !measurements) return <Loading />;

  const p = settings.profile;
  const current = pickCurrentSession(schedule, today);
  const progress = programProgress(schedule);
  const week = programWeekOf(today, p.startDate);
  const viewWeek = week ?? (today < p.startDate ? 1 : 26);
  const range = weekRange(viewWeek, p.startDate);
  const weekSessions = schedule.filter((s) => s.date >= range.start && s.date <= range.end);
  const completedThisWeek = schedule.filter((s) => s.session.week === viewWeek && s.status === "completed").length;
  const missed = schedule.filter((s) => s.status === "missed").sort((a, b) => b.date.localeCompare(a.date));
  const weights = measurements.filter((m) => m.weightKg != null).sort((a, b) => a.date.localeCompare(b.date) || a.createdAt - b.createdAt);
  const lw = latestWeight(measurements);
  const beforeStart = today < p.startDate;
  const motivation = MOTIVATION[Math.abs(diffDays(today, "2026-01-01")) % MOTIVATION.length];
  const streak = (() => {
    const done = schedule.filter((s) => s.status === "completed" || s.status === "missed").sort((a, b) => b.date.localeCompare(a.date));
    let n = 0;
    for (const s of done) {
      if (s.status !== "completed") break;
      n++;
    }
    return n;
  })();
  const firstEx = current ? map[current.session.exercises[0]?.exerciseId] : undefined;
  const warmVideo = current?.session.warmup.moves?.map((id) => mediaFor(id).video).find(Boolean);

  return (
    <div className="relative">
      <div className="hero pointer-events-none absolute -inset-x-4 -top-4 h-80 opacity-90" style={{ maskImage: "linear-gradient(to bottom, black 40%, transparent)" }} aria-hidden="true" />
      <div className="relative">
        <div className="flex items-center justify-between gap-2 text-[rgb(var(--hero-text))]">
          <div>
            <div className="font-bold">
              {L("أهلاً", "Hi")} {p.name || (lang === "en" ? "Amr" : "عمرو")}!
            </div>
            <div className="text-xs opacity-80">
              ⚡ {pick(LEVELS[p.level])}
              {week ? ` · ${pick(phaseForWeek(week).name).split(":")[0]}` : ""}
            </div>
          </div>
          {streak > 0 && (
            <span className="chip border-white/20 bg-white/15 text-white" data-testid="streak">
              🔥 {streak} {L("حصص متتالية", "in a row")}
            </span>
          )}
        </div>
        <h1 className="display mt-3 text-[44px] text-[rgb(var(--hero-text))]" data-testid="home-title">
          {L("تمرين", "Daily")}
          <br />
          {L("النهارده", "Workout")}
        </h1>
        <div className="mt-1 text-sm text-[rgb(var(--hero-text))] opacity-85" data-testid="today-date">
          {formatDateLong(today, lang)}
          {week && ` · ${L("الأسبوع", "Week")} ${week} ${L("من", "of")} 26`}
        </div>

        {!settings.safetyAcknowledgedAt && (
          <div className="mt-4 space-y-2">
            <Alert tone="blue" title={L("قبل البدء", "Before you start")}>
              <p>{pick(DISCLAIMER)}</p>
            </Alert>
            <RedFlagList />
            <button className="btn-primary w-full" onClick={() => updateSettings((s) => ({ ...s, safetyAcknowledgedAt: Date.now() }))}>
              {L("قرأت التنبيهات", "I've read the warnings")}
            </button>
          </div>
        )}

        {beforeStart && (
          <div className="mt-4">
            <Alert tone="green" title={L(`البرنامج يبدأ بعد ${diffDays(p.startDate, today)} يوم`, `Program starts in ${diffDays(p.startDate, today)} days`)}>
              {L("تاريخ البداية:", "Start date:")} {formatDateLong(p.startDate, lang)}
            </Alert>
          </div>
        )}

        {current && (
          <Link href={`/warmup/?session=${current.session.id}`} className="glass mt-4 flex items-center gap-3 p-2.5" data-testid="warmup-card">
            <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-2xl hero">
              {warmVideo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={ytThumb(warmVideo.id)} alt="" className="h-full w-full object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
              )}
              <span className="absolute inset-0 m-auto flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-black">▶</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold">
                {L("الإحماء", "Warm-up")} · {current.session.warmup.minutes} {L("دقائق", "min")}
              </div>
              <div className="truncate text-xs text-muted">
                {(current.session.warmup.moves ?? []).slice(0, 3).map((id) => pick(WARMUP_MAP[id]?.name)).join(" · ")}
              </div>
            </div>
            <span className="text-accent">{dir === "rtl" ? "‹" : "›"}</span>
          </Link>
        )}

        {missed.length > 0 && (
          <div className="card mt-4 border-amber-400/60" data-testid="missed-alert">
            <div className="mb-2 flex items-center gap-2 font-bold text-amber-600 dark:text-amber-300">
              <IconAlert size={20} /> {L(`لديك ${missed.length} حصة فائتة`, `You have ${missed.length} missed session${missed.length > 1 ? "s" : ""}`)}
            </div>
            <ul>
              {missed.slice(0, 3).map((s) => (
                <MissedRow key={s.session.id} s={s} today={today} />
              ))}
            </ul>
            {missed.length > 3 && (
              <Link href="/program/" className="mt-2 block text-sm underline">
                {L("عرض كل الحصص الفائتة", "View all missed sessions")}
              </Link>
            )}
          </div>
        )}

        {current ? (
          <div className="mt-4 overflow-hidden rounded-[26px] text-[#16122e]" style={{ background: "linear-gradient(160deg,#E9D9FF 0%,#C9B6FF 42%,#FFB37A 100%)" }} data-testid="current-session">
            <div className="p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-[#2E6BFF] px-2.5 py-0.5 text-xs font-bold text-white">
                  {current.status === "in_progress" ? L("قيد التنفيذ", "In progress") : current.date === today ? L("حصة اليوم", "Today") : L("الحصة القادمة", "Next session")} · {current.session.slot}
                </span>
                <span className="rounded-full bg-white/70 px-2.5 py-0.5 text-xs font-bold">
                  ~{current.session.estimatedMinutes} {L("د", "min")}
                </span>
              </div>
              <div className="display mt-2 text-[28px]">{sessionTitle(current.session, lang)}</div>
              <div className="mt-1 text-xs opacity-75">
                {formatDateMedium(current.date, lang)} · {current.session.exercises.length} {L("تمارين", "exercises")}
                {current.session.isDeload && ` · ${L("أسبوع تخفيف", "Deload week")}`}
                {current.rescheduled && ` · ${L("معاد جدولتها", "Rescheduled")}`}
              </div>
              <div className="mt-3 flex items-end justify-between gap-2">
                <div className="flex -space-x-2 rtl:space-x-reverse">
                  {current.session.exercises.slice(0, 4).map((pe, i) => {
                    const e = map[pe.exerciseId];
                    return e ? <ExerciseThumb key={i} exercise={e} className="h-11 w-11 border-2 border-white" rounded="rounded-full" /> : null;
                  })}
                </div>
                <Link href={`/workout/?session=${current.session.id}`} className="inline-flex items-center gap-2 rounded-full bg-white py-1 pe-1 ps-4 font-bold text-black shadow" data-testid="start-today">
                  {current.status === "in_progress" ? L("كمّل", "Resume") : current.date === today ? L("ابدأ", "Start") : L("عرض", "View")}
                  <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "rgb(var(--go))", color: "rgb(var(--on-go))" }}>
                    {dir === "rtl" ? "←" : "→"}
                  </span>
                </Link>
              </div>
            </div>
            {firstEx && <ExerciseThumb exercise={firstEx} className="mx-3 mb-0 h-28 rounded-b-none" rounded="rounded-t-[20px]" />}
          </div>
        ) : (
          <div className="card mt-4">{L("لا توجد حصص متبقية. راجع التقرير الشامل من صفحة التقدم.", "No sessions left. See the full report on the Progress page.")}</div>
        )}

        <div className="card mt-4 p-3" data-testid="week-calendar">
          <div className="mb-2 flex items-center justify-between">
            <b className="text-sm">{L("هذا الأسبوع", "This week")}</b>
            <span className="text-xs text-muted">
              {completedThisWeek} / {weekSessions.length || 3} {L("حصص", "sessions")}
            </span>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: 7 }, (_, i) => {
              const d = addDays(range.start, i);
              const s = weekSessions.find((x) => x.date === d);
              const st = s?.status;
              const style =
                st === "completed"
                  ? { background: "rgb(var(--accent))", color: "rgb(var(--on-accent))" }
                  : st === "missed"
                    ? { background: "rgb(239 68 68 / 0.18)", color: "#ef4444" }
                    : d === today
                      ? { border: "2px solid rgb(var(--accent))" }
                      : s
                        ? { background: "rgb(var(--surface-2))", border: "1px dashed rgb(var(--accent) / 0.6)" }
                        : { background: "rgb(var(--surface-2))" };
              return (
                <div key={d}>
                  <div className="text-[10px] text-muted">{formatDayName(d, lang)}</div>
                  <div className="mx-auto mt-1 flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold" style={style} title={s ? pick(s.session.name) : undefined}>
                    {st === "completed" ? "✓" : st === "missed" ? "!" : s ? s.session.slot : "·"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="card flex items-center gap-3 p-3">
            <Ring pct={progress.pct} size={60} stroke={7} />
            <div className="min-w-0">
              <div className="text-xs text-muted">{L("البرنامج", "Program")}</div>
              <b className="ltr text-sm" data-testid="program-pct">
                {progress.pct}%
              </b>
              <div className="text-[11px] text-muted">
                {progress.completed}/{progress.total} {L("حصة", "sessions")}
              </div>
            </div>
          </div>
          <Link href="/progress/" className="card p-3">
            <div className="text-xs text-muted">{L("الوزن", "Weight")}</div>
            <b className="ltr text-xl">
              {lw ? lw.weightKg : p.startWeightKg} <span className="text-xs text-muted">{L("كجم", "kg")}</span>
            </b>
            <Sparkline values={weights.slice(-8).map((m) => m.weightKg!)} />
            {!lw && <div className="text-[11px] text-muted">{L("الوزن الابتدائي", "Starting weight")}</div>}
          </Link>
          <div className="card p-3">
            <div className="text-xs text-muted">{L("المرحلة الحالية", "Current phase")}</div>
            <b className="text-sm">{pick(phaseForWeek(viewWeek).name)}</b>
          </div>
          <div className="card p-3">
            <div className="text-xs text-muted">{L("حصص مكتملة", "Workouts done")}</div>
            <b className="ltr text-xl">{progress.completed}</b>
            <div className="text-[11px] text-muted">
              {completedThisWeek} {L("هذا الأسبوع", "this week")}
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <Link href="/library/" className="card p-3 text-center">
            <div className="mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-2xl surface-2 text-accent">
              <IconBook size={20} />
            </div>
            <div className="text-xs font-bold">{L("الأجهزة", "Equipment")}</div>
          </Link>
          <Link href={current ? `/alternatives/?session=${current.session.id}` : "/library/"} className="card p-3 text-center" data-testid="alternatives-shortcut">
            <div className="mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-2xl surface-2 text-accent">
              <IconSwap size={20} />
            </div>
            <div className="text-xs font-bold">{L("البدائل", "Alternatives")}</div>
          </Link>
          <Link href={current ? `/warmup/?session=${current.session.id}` : "/warmup/"} className="card p-3 text-center">
            <div className="mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-2xl surface-2 text-xl">🔥</div>
            <div className="text-xs font-bold">{L("الإحماء", "Warm-up")}</div>
          </Link>
        </div>

        <div className="card mt-3 flex items-center gap-3 p-3" data-testid="motivation">
          <span className="text-2xl">💪</span>
          <div>
            <b className="text-sm">{pick(motivation)}</b>
            <div className="text-xs text-muted">
              {progress.completed > 0 ? L(`${progress.completed} حصة مكتملة · كمّل كده`, `${progress.completed} sessions done · keep going`) : L("أول حصة هي أهم حصة.", "Your first session is the most important one.")}
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <Link href="/program/" className="btn-secondary text-sm">
            {L("البرنامج", "Program")}
          </Link>
          <Link href="/reports/" className="btn-secondary text-sm">
            {L("التقارير", "Reports")}
          </Link>
          <Link href="/safety/" className="btn-secondary text-sm">
            {L("السلامة", "Safety")}
          </Link>
        </div>
        {current && (
          <div className="mt-2 text-center">
            <Badge>
              {L("المدة المتوقعة", "Estimated")} ~{current.session.estimatedMinutes} {L("دقيقة", "min")}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
