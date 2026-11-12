"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import AlternativesPanel from "@/components/AlternativesPanel";
import ExerciseDetails, { MuscleChips } from "@/components/ExerciseDetails";
import ExerciseMedia, { ExerciseThumb } from "@/components/ExerciseMedia";
import { IconAlert, IconCheck, IconPlus, IconSwap, IconTrash } from "@/components/icons";
import RestTimerBar, { useRestTimer } from "@/components/RestTimer";
import { RedFlagButton } from "@/components/Safety";
import { Alert, Badge, Choice, Loading, Modal, NumberField, PageHeader, ProgressBar, Ring } from "@/components/ui";
import { phaseForWeek } from "@/data/program";
import { WARMUP_MAP } from "@/data/warmup";
import { db } from "@/lib/db";
import { formatDateMedium, formatTime } from "@/lib/dates";
import { exerciseText } from "@/lib/exerciseText";
import { formatClock, prescriptionText, repRange, UNIT_LABEL } from "@/lib/format";
import { DIFFICULTY, ENERGY, MOTIVATION, PAIN_LEVELS, painLevelOf, painReminder, type PainLevel } from "@/lib/health";
import { useExercises, useSchedule, useSearchParam, useWorkouts } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { MUSCLES } from "@/lib/labels";
import { pickCurrentSession, type ScheduledSession } from "@/lib/schedule";
import { sessionName, sessionTitle } from "@/lib/sessionText";
import type { Difficulty, Exercise, PlannedSession, WorkoutLog } from "@/lib/types";
import { abandonWorkout, addSet, entryStatus, type EntryStatus, finishWorkout, lastPerformance, removeSet, saveWorkout, startOrResumeWorkout, substituteInWorkout, updateEntry, updateSet, workoutCompletion } from "@/lib/workout";

function StatusChip({ s }: { s: EntryStatus }) {
  const { L } = useI18n();
  const map = {
    completed: { t: L("تم · Completed", "Completed · تم"), tone: "green" as const },
    replaced: { t: L("استبدلت · Replaced", "Replaced · استبدلت"), tone: "accent" as const },
    skipped: { t: L("لم يتم · Skipped", "Skipped · لم يتم"), tone: "amber" as const },
    partial: { t: L("جزئي", "Partial"), tone: "blue" as const },
    pending: { t: L("لم يبدأ", "Not started"), tone: "neutral" as const },
  }[s];
  return <Badge tone={map.tone}>{map.t}</Badge>;
}

/* ---------------- معاينة الحصة ---------------- */
function SessionPreview({ s, map, onStart, otherInProgress }: { s: ScheduledSession; map: Record<string, Exercise>; onStart: () => void; otherInProgress?: ScheduledSession }) {
  const { L, lang, pick } = useI18n();
  const sess = s.session;
  const first = map[sess.exercises[0]?.exerciseId];
  return (
    <div>
      <div className="relative -mx-4 -mt-4 mb-4 h-72 overflow-hidden hero">
        {first && <ExerciseThumb exercise={first} className="absolute inset-0 h-full w-full opacity-90" rounded="rounded-none" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
        <div className="absolute inset-x-4 bottom-4 text-white">
          <div className="mb-1 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold">{pick(phaseForWeek(sess.week).name).split(":")[0]}</span>
            {sess.isDeload && <span className="rounded-full bg-sky-500/80 px-2.5 py-0.5 text-xs font-bold">{L("أسبوع تخفيف", "Deload")}</span>}
          </div>
          <h1 className="display text-4xl">{L(`الحصة ${sess.slot}`, `Session ${sess.slot}`)}</h1>
          <div className="mt-1 text-sm font-bold opacity-90">{sessionTitle(sess, lang)}</div>
          <div className="text-xs opacity-80">
            {L("الأسبوع", "Week")} {sess.week} · {formatDateMedium(s.date, lang)}
          </div>
        </div>
      </div>
      {otherInProgress && (
        <div className="mb-3">
          <Alert tone="amber" title={L("لديك حصة أخرى غير مكتملة", "You have another unfinished session")}>
            <Link className="underline" href={`/workout/?session=${otherInProgress.session.id}`}>
              {L("كمّل حصة الأسبوع", "Resume week")} {otherInProgress.session.week} ({otherInProgress.session.slot})
            </Link>
          </Alert>
        </div>
      )}
      {s.status === "upcoming" && (
        <div className="mb-3">
          <Alert tone="blue">{L(`الحصة دي مقررة يوم ${formatDateMedium(s.date, lang)}. تقدر تبدأها النهارده لو حبيت.`, `This session is planned for ${formatDateMedium(s.date, lang)}. You can start it today if you like.`)}</Alert>
        </div>
      )}
      {s.status === "missed" && (
        <div className="mb-3">
          <Alert tone="amber">{L("دي حصة فائتة. تقدر تعملها دلوقتي أو تعيد جدولتها من الرئيسية.", "This is a missed session. Do it now or reschedule it from Home.")}</Alert>
        </div>
      )}
      <div className="mb-3 grid grid-cols-2 gap-2">
        <div className="card p-3">
          <div className="text-xs text-muted">{L("المدة", "Duration")}</div>
          <b className="ltr text-2xl">~{sess.estimatedMinutes}</b> <span className="text-xs text-muted">{L("دقيقة", "min")}</span>
        </div>
        <div className="card p-3">
          <div className="text-xs text-muted">{L("التمارين", "Exercises")}</div>
          <b className="ltr text-2xl">{sess.exercises.length}</b> <span className="text-xs text-muted">{L("+ إحماء وكارديو", "+ warm-up & cardio")}</span>
        </div>
      </div>
      <p className="mb-3 text-sm">{pick(sess.weekFocus)}</p>

      <Link href={`/warmup/?session=${sess.id}`} className="card mb-2 flex items-center gap-3 p-3" data-testid="preview-warmup">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl surface-2">🔥</span>
        <div className="min-w-0 flex-1">
          <b>
            1 · {L("الإحماء", "Warm-up")} ({sess.warmup.minutes} {L("دقائق", "min")})
          </b>
          <div className="truncate text-xs text-muted">{(sess.warmup.moves ?? []).map((id) => pick(WARMUP_MAP[id]?.name)).join(" · ") || sess.warmup.mobility.map((x) => pick(x)).join(" · ")}</div>
        </div>
      </Link>
      <div className="card mb-2 p-2">
        <div className="px-1 pb-1 pt-1 text-sm font-bold">
          2 · {L("تمارين المقاومة", "Strength exercises")}
        </div>
        <ol>
          {sess.exercises.map((pe, i) => {
            const e = map[pe.exerciseId];
            const t = e ? exerciseText(e, lang) : null;
            return (
              <li key={i} className="flex items-center gap-3 rounded-2xl p-1.5">
                {e && <ExerciseThumb exercise={e} className="h-14 w-14 shrink-0" />}
                <div className="min-w-0 flex-1">
                  <div className="truncate font-bold">{t?.name ?? pe.exerciseId}</div>
                  <div className={`truncate text-xs text-muted ${lang === "ar" ? "ltr text-start" : ""}`}>{t?.otherName}</div>
                  <div className="text-xs">
                    {prescriptionText(pe, lang)} · {L("راحة", "rest")} {pe.restSec}s · RPE {pe.rpe}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="card mb-2 p-3 text-sm">
        <b>3 · {L("الكارديو", "Cardio")}</b> — {map[sess.cardio.exerciseId] ? exerciseText(map[sess.cardio.exerciseId], lang).name : ""}: {sess.cardio.minutes} {L("دقيقة", "min")} · {pick(sess.cardio.intensity)}
      </div>
      <div className="card mb-3 p-3 text-sm">
        <b>4 · {L("التهدئة", "Cool-down")}</b>
        <ul className="mt-1 list-disc ps-5">
          {sess.cooldown.map((c, i) => (
            <li key={i}>{pick(c)}</li>
          ))}
        </ul>
      </div>
      <div className="mb-4">
        <Alert tone="amber" title={L("تعليمات السلامة لهذه الحصة", "Safety for this session")} icon={<IconAlert size={18} />}>
          <ul className="list-disc space-y-1 ps-4">
            {sess.safetyNotes.map((n, i) => (
              <li key={i}>{pick(n)}</li>
            ))}
          </ul>
        </Alert>
      </div>
      <button className="btn-go min-h-14 w-full text-lg" onClick={onStart} data-testid="start-session">
        {L("ابدأ الآن", "Start now")}
      </button>
      <Link href={`/program/session/?id=${sess.id}`} className="btn-secondary mt-2 w-full">
        {L("تعديل تمارين هذه الحصة", "Edit this session's exercises")}
      </Link>
    </div>
  );
}

/* ---------------- احتفال نهاية الحصة ---------------- */
function Celebration({ w, map, saved }: { w: WorkoutLog; map: Record<string, Exercise>; saved: boolean }) {
  const { L, lang } = useI18n();
  const c = workoutCompletion(w);
  const pct = c.totalSets ? Math.round((c.doneSets / c.totalSets) * 100) : 0;
  const end = w.finishedAt ?? Date.now();
  const durationMin = Math.max(1, Math.round((end - w.startedAt) / 60000));
  return (
    <div className="relative" data-testid="celebration">
      <div className="hero pointer-events-none absolute -inset-x-4 -top-4 h-72 opacity-90" aria-hidden="true" />
      <div className="relative text-center text-[rgb(var(--hero-text))]">
        <div className="animate-pop text-5xl">🎉🏆🎉</div>
        <h1 className="display mt-2 text-4xl">{L("عاش! الحصة خلصت", "Workout complete!")}</h1>
        <div className="text-sm opacity-90">
          {sessionName(w.planSnapshot, lang)} · {formatDateMedium(w.date, lang)}
        </div>
        <div className="mt-4 flex justify-center">
          <div className="rounded-full bg-white/10 p-2 backdrop-blur">
            <Ring pct={pct} size={128} stroke={12} sub={L("اكتمال", "complete")} />
          </div>
        </div>
      </div>
      <div className="relative mt-4 grid grid-cols-3 gap-2">
        <div className="card p-3 text-center">
          <b className="ltr text-xl" data-testid="duration">
            {durationMin}
          </b>
          <div className="text-xs text-muted">{L("دقيقة", "minutes")}</div>
        </div>
        <div className="card p-3 text-center">
          <b className="ltr text-xl">
            {c.doneSets}/{c.totalSets}
          </b>
          <div className="text-xs text-muted">{L("مجموعة", "sets")}</div>
        </div>
        <div className="card p-3 text-center">
          <b className="ltr text-xl">{w.entries.filter((e) => entryStatus(e) === "completed" || entryStatus(e) === "replaced").length}</b>
          <div className="text-xs text-muted">{L("تمارين مكتملة", "exercises done")}</div>
        </div>
      </div>
      <div className="card mt-3 p-2">
        {w.entries.map((e, i) => {
          const ex = map[e.exerciseId];
          return (
            <div key={i} className="flex items-center gap-2 border-b border-base p-1.5 last:border-0">
              {ex && <ExerciseThumb exercise={ex} className="h-10 w-10 shrink-0" rounded="rounded-xl" />}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold">{ex ? exerciseText(ex, lang).name : e.exerciseId}</div>
                <div className="ltr truncate text-start text-xs text-muted">
                  {e.sets
                    .filter((s) => s.done)
                    .map((s) => `${s.weight ?? "-"}kg×${s.reps ?? "-"}`)
                    .join("  ")}
                </div>
              </div>
              <StatusChip s={entryStatus(e)} />
            </div>
          );
        })}
        <div className="flex items-center justify-between p-1.5 text-sm">
          <span>{L("الكارديو", "Cardio")}</span>
          <Badge tone={w.cardio.done ? "green" : "amber"}>{w.cardio.done ? `${w.cardio.minutes ?? 0} ${L("د", "min")}` : L("لم يتم", "Skipped")}</Badge>
        </div>
      </div>
      {saved ? (
        <>
          <Alert tone="green" title={L("تم حفظ الحصة", "Session saved")} icon={<IconCheck size={18} />}>
            {w.finishedAt && formatTime(w.finishedAt, lang)}
          </Alert>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link href="/" className="btn-secondary">
              {L("الرئيسية", "Home")}
            </Link>
            <Link href="/progress/" className="btn-primary">
              {L("التقدم", "Progress")}
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default function WorkoutPage() {
  const router = useRouter();
  const sessionParam = useSearchParam("session");
  const { schedule, loaded, today, settings } = useSchedule();
  const workouts = useWorkouts();
  const { map, list } = useExercises();
  const { L } = useI18n();
  const [w, setW] = useState<WorkoutLog | null>(null);
  const [loadingW, setLoadingW] = useState(true);
  const loadedFor = useRef<string | null>(null);
  const timer = useRestTimer({ sound: settings.sound, vibrate: settings.vibrate });

  const target = useMemo(() => {
    if (!loaded) return undefined;
    if (sessionParam) return schedule.find((s) => s.session.id === sessionParam);
    return pickCurrentSession(schedule, today);
  }, [loaded, schedule, sessionParam, today]);

  // استعادة الحصة غير المكتملة بعد إغلاق التطبيق أو تحديث الصفحة
  useEffect(() => {
    if (!target) {
      if (loaded) setLoadingW(false);
      return;
    }
    if (loadedFor.current === target.session.id) return;
    loadedFor.current = target.session.id;
    setLoadingW(true);
    db.workouts
      .where("sessionId")
      .equals(target.session.id)
      .toArray()
      .then((ws) => {
        const active = ws.find((x) => x.status === "in_progress");
        const done = ws.filter((x) => x.status === "completed").sort((a, b) => b.updatedAt - a.updatedAt)[0];
        setW(active ?? done ?? null);
        setLoadingW(false);
      });
  }, [target, loaded]);

  if (!loaded || !workouts || loadingW) return <Loading />;
  if (!target)
    return (
      <div>
        <PageHeader title={L("تمرين اليوم", "Today's workout")} />
        <div className="card">
          {L("لا توجد حصة مطابقة.", "No matching session.")}{" "}
          <Link className="underline" href="/program/">
            {L("اختار حصة من البرنامج", "Pick one from the program")}
          </Link>
        </div>
      </div>
    );

  const otherInProgress = schedule.find((s) => s.status === "in_progress" && s.session.id !== target.session.id);

  if (!w) {
    return (
      <SessionPreview
        s={target}
        map={map}
        otherInProgress={otherInProgress}
        onStart={async () => {
          const created = await startOrResumeWorkout(target.session, target.date);
          setW(created);
          if (!sessionParam) router.replace(`/workout/?session=${target.session.id}`);
        }}
      />
    );
  }
  if (w.status === "completed") return <Celebration w={w} map={map} saved />;

  return <LiveWorkout key={w.id} initial={w} map={map} list={list} settings={settings} timer={timer} workouts={workouts} onFinished={setW} />;
}

/* ---------------- الحصة المباشرة ---------------- */
function LiveWorkout({
  initial,
  map,
  list,
  settings,
  timer,
  workouts,
  onFinished,
}: {
  initial: WorkoutLog;
  map: Record<string, Exercise>;
  list: Exercise[];
  settings: ReturnType<typeof useSchedule>["settings"];
  timer: ReturnType<typeof useRestTimer>;
  workouts: WorkoutLog[];
  onFinished: (w: WorkoutLog | null) => void;
}) {
  const { L, lang, pick, dir } = useI18n();
  const [w, setW] = useState(initial);
  const [saved, setSaved] = useState<number | null>(null);
  const [altOpen, setAltOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState<null | "how" | "mistakes">(null);
  const [confirmAbandon, setConfirmAbandon] = useState(false);
  const [toast, setToast] = useState<{ msg: string; sub: string; undo: WorkoutLog } | null>(null);
  const [painOpen, setPainOpen] = useState(false);
  const [painArea, setPainArea] = useState<"knee" | "back" | "other" | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const pendingPainRef = useRef<PainLevel | null>(null);
  const motivationIdx = useRef(Math.floor(Math.random() * MOTIVATION.length));
  const plan: PlannedSession = w.planSnapshot;
  const n = w.entries.length;
  const step = w.currentIndex; // 0 إحماء، 1..n تمارين، n+1 كارديو، n+2 إنهاء
  const comp = workoutCompletion(w);
  const pct = comp.totalSets ? (comp.doneSets / comp.totalSets) * 100 : 0;

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(id);
  }, [toast]);

  // حفظ تلقائي فوري بعد كل إدخال
  const commit = (next: WorkoutLog) => {
    setW(next);
    saveWorkout(next).then((s) => setSaved(s.updatedAt));
  };
  const go = (i: number) => {
    commit({ ...w, currentIndex: Math.max(0, Math.min(n + 2, i)) });
    window.scrollTo({ top: 0 });
  };
  const motivate = (prev: WorkoutLog, sub: string) => {
    motivationIdx.current = (motivationIdx.current + 1) % MOTIVATION.length;
    setToast({ msg: pick(MOTIVATION[motivationIdx.current]), sub, undo: prev });
  };

  const steps = [{ key: "warmup", label: L("إحماء", "Warm-up") }, ...w.entries.map((_, i) => ({ key: `e${i}`, label: String(i + 1) })), { key: "cardio", label: L("كارديو", "Cardio") }, { key: "finish", label: L("إنهاء", "Finish") }];

  const entryIdx = step - 1;
  const entry = step >= 1 && step <= n ? w.entries[entryIdx] : null;
  const pe = entry ? plan.exercises[entry.slotIndex] : null;
  const ex = entry ? map[entry.exerciseId] : null;
  const baseEx = entry ? map[entry.plannedExerciseId] : null;
  const exT = ex ? exerciseText(ex, lang) : null;
  const prev = entry ? lastPerformance(workouts, entry.exerciseId, w.id) : null;
  const unit = pe?.unit ?? "reps";
  const repLabel = unit.startsWith("seconds") ? L("ثواني", "Seconds") : unit === "meters" ? L("متر", "Meters") : L("تكرارات", "Reps");
  const cardioOptions = list.filter((e) => e.kind === "cardio" && !e.reviewRequired);
  const nextSetIdx = entry ? entry.sets.findIndex((s) => !s.done) : -1;
  const severe = w.severePain ?? [];
  const painLevel = entry ? painLevelOf(Math.max(entry.kneePain ?? -1, entry.backPain ?? -1) < 0 ? null : Math.max(entry.kneePain ?? 0, entry.backPain ?? 0)) : null;

  const completeSet = (j: number) => {
    if (!entry || !pe) return;
    const before = w;
    let next = updateSet(w, entryIdx, j, { done: true });
    const s = next.entries[entryIdx].sets[j];
    if (s.reps == null) next = updateSet(next, entryIdx, j, { reps: pe.repsMax, done: true });
    commit(next);
    timer.start(pe.restSec);
    const allDone = next.entries[entryIdx].sets.every((x) => x.done);
    motivate(before, allDone ? L(`${exT?.name} اكتمل`, `${exT?.name} completed`) : L(`المجموعة ${j + 1} اتسجلت`, `Set ${j + 1} saved`));
  };

  const setPain = (level: PainLevel | null, area: "knee" | "back" | "other" | null) => {
    if (!entry) return;
    const value = level ? PAIN_LEVELS.find((p) => p.id === level)!.value : null;
    let next = updateEntry(w, entryIdx, {
      kneePain: area === "knee" ? value : level === "none" ? 0 : entry.kneePain,
      backPain: area === "back" ? value : level === "none" ? 0 : entry.backPain,
      notes: area === "other" && level && level !== "none" ? `${entry.notes ? entry.notes + " · " : ""}${pick(PAIN_LEVELS.find((p) => p.id === level)!.label)}` : entry.notes,
    });
    if (level === "severe" && area) next = { ...next, severePain: [...new Set([...(next.severePain ?? []), area])] };
    commit(next);
  };

  return (
    <div className="pb-24">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-xs text-muted">
            {L("الأسبوع", "Week")} {plan.week} · {comp.doneSets}/{comp.totalSets} {L("مجموعة", "sets")}
            {saved && (
              <span data-testid="autosaved">
                {" "}
                · {L("حُفظ تلقائيًا", "Autosaved")} {formatTime(saved, lang)}
              </span>
            )}
          </div>
          <h1 className="truncate text-lg font-bold">{sessionName(plan, lang)}</h1>
        </div>
        <Ring pct={pct} size={52} stroke={6} />
      </div>
      <div className="mb-2 flex justify-end">
        <RedFlagButton className="min-h-9 px-2 text-xs" onReport={() => commit({ ...w, redFlagReported: true, notes: `${w.notes}\n[Stopped because of symptoms / أوقفت الحصة بسبب أعراض]`.trim() })} />
      </div>
      <ProgressBar value={pct} label={L("تقدم الحصة", "Session progress")} />

      <nav className="no-print -mx-4 mt-3 flex gap-1.5 overflow-x-auto px-4 pb-2" aria-label={L("خطوات الحصة", "Session steps")}>
        {steps.map((s, i) => {
          const done = i >= 1 && i <= n ? ["completed", "replaced", "skipped"].includes(entryStatus(w.entries[i - 1])) : i === 0 ? w.warmupDone : i === n + 1 ? w.cardio.done : false;
          return (
            <button
              key={s.key}
              onClick={() => go(i)}
              aria-current={i === step ? "step" : undefined}
              className={`min-h-10 shrink-0 rounded-full border px-3 text-sm font-bold ${i === step ? "chip-active" : done ? "border-[rgb(var(--accent))] text-accent" : "border-base"}`}
            >
              {done && i !== step ? "✓ " : ""}
              {s.label}
            </button>
          );
        })}
      </nav>

      {/* ---------- الإحماء ---------- */}
      {step === 0 && (
        <div className="mt-2 space-y-3">
          <div className="card p-3">
            <div className="mb-2 text-lg font-bold">
              {L("الإحماء", "Warm-up")} ({plan.warmup.minutes} {L("دقائق", "min")})
            </div>
            <ul className="list-disc space-y-1 ps-5">
              <li>
                {map[plan.warmup.cardioExerciseId] ? exerciseText(map[plan.warmup.cardioExerciseId], lang).name : ""} {L("بجهد خفيف 5 دقائق", "at an easy effort for 5 minutes")}
              </li>
              {(plan.warmup.moves ?? []).length
                ? plan.warmup.moves!.map((id) => <li key={id}>{pick(WARMUP_MAP[id]?.name)}</li>)
                : plan.warmup.mobility.map((m, i) => <li key={i}>{pick(m)}</li>)}
            </ul>
            <Link href={`/warmup/?session=${plan.id}`} className="btn-secondary mt-3 w-full" data-testid="open-warmup">
              🔥 {L("افتح الإحماء المصوّر", "Open the image-based warm-up")}
            </Link>
          </div>
          <div className="card space-y-3 p-3">
            <div className="font-bold">{L("في ألم قبل ما نبدأ؟", "Any pain before you start?")}</div>
            <Choice
              cols={2}
              options={PAIN_LEVELS.map((p) => ({ id: p.id, label: pick(p.label), emoji: p.emoji, danger: p.id === "severe" }))}
              value={painLevelOf(Math.max(w.painBefore.knee ?? -1, w.painBefore.back ?? -1) < 0 ? null : Math.max(w.painBefore.knee ?? 0, w.painBefore.back ?? 0))}
              onChange={(v) => {
                const value = v ? PAIN_LEVELS.find((p) => p.id === v)!.value : null;
                commit({ ...w, painBefore: { knee: value, back: value } });
              }}
            />
            {((w.painBefore.knee ?? 0) >= 5 || (w.painBefore.back ?? 0) >= 5) && (
              <Alert tone="amber">{L("الألم عالي قبل البدء. فكّر في حصة أخف أو تأجيلها، واستشر متخصص لو استمر.", "Pain is high before starting. Consider a lighter session or postponing, and see a specialist if it persists.")}</Alert>
            )}
          </div>
          <button className="btn-go min-h-14 w-full text-lg" onClick={() => commit({ ...w, warmupDone: true, currentIndex: 1 })} data-testid="warmup-done">
            ✓ {L("تم الإحماء – Complete Warm-up", "Complete Warm-up – تم الإحماء")}
          </button>
        </div>
      )}

      {/* ---------- تمرين ---------- */}
      {entry && ex && pe && exT && (
        <div className="mt-2 space-y-3" data-testid="exercise-step">
          <ExerciseMedia exercise={ex} height={220} />
          <div>
            <div className="text-xs text-muted">
              {L("تمرين", "Exercise")} {entryIdx + 1} {L("من", "of")} {n}
              {entry.substituted && baseEx && (
                <>
                  {" "}
                  · {L("بديل لـ", "Alternative to")} {exerciseText(baseEx, lang).name}
                </>
              )}
            </div>
            <h2 className="display text-3xl" data-testid="exercise-name">
              {exT.name}
            </h2>
            <div className={`font-bold text-muted ${lang === "ar" ? "ltr text-start" : ""}`}>{exT.otherName}</div>
            <div className="mt-2">
              <MuscleChips e={ex} />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="card p-2">
              <div className="text-[10px] text-muted">{L("مجموعات", "Sets")}</div>
              <b className="ltr">{entry.sets.length}</b>
            </div>
            <div className="card p-2">
              <div className="text-[10px] text-muted">{pick(UNIT_LABEL[pe.unit])}</div>
              <b className="ltr">{repRange(pe)}</b>
            </div>
            <div className="card p-2">
              <div className="text-[10px] text-muted">{L("راحة", "Rest")}</div>
              <b className="ltr">{pe.restSec}s</b>
            </div>
            <div className="card p-2">
              <div className="text-[10px] text-muted">RPE</div>
              <b className="ltr">{pe.rpe}</b>
            </div>
          </div>
          {pe.note && <Alert tone="amber">{pick(pe.note)}</Alert>}
          {exT.reviewRequired && <Alert tone="red" title={L("يحتاج مراجعة متخصص", "Needs a specialist's review")}>{exT.reviewRequired}</Alert>}
          {prev && (
            <div className="text-sm text-muted">
              {L("المرة اللي فاتت", "Last time")} ({formatDateMedium(prev.date, lang)}): <span className="ltr">{prev.sets.map((s) => `${s.weight ?? "-"}×${s.reps ?? "-"}`).join(", ")}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button className="btn-secondary" onClick={() => setAltOpen(true)} data-testid="open-alternatives">
              <IconSwap size={18} /> {L("مش لاقي الجهاز؟", "No machine?")}
            </button>
            <button className="btn-secondary" onClick={() => setDetailsOpen("mistakes")} data-testid="open-mistakes">
              ✕/✓ {L("الأخطاء الشائعة", "Common mistakes")}
            </button>
          </div>

          {entry.skipped ? (
            <Alert tone="blue">
              {L("تم تخطي التمرين ده في الحصة دي.", "This exercise was skipped this session.")}{" "}
              <button className="underline" onClick={() => commit(updateEntry(w, entryIdx, { skipped: false }))}>
                {L("تراجع", "Undo")}
              </button>
            </Alert>
          ) : (
            <div className="space-y-2">
              {entry.sets.map((s, j) => (
                <div key={j} className={`card p-3 ${s.done ? "border-[rgb(var(--accent))]" : j === nextSetIdx ? "border-[rgb(var(--accent)/0.6)]" : ""}`} data-testid={`set-${j}`}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-bold">
                      {L("المجموعة", "Set")} {j + 1}
                      {s.done && <span className="ms-2 text-accent">✓</span>}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        className={`btn min-h-9 border px-3 text-xs ${s.done ? "border-[rgb(var(--accent))] text-accent" : "border-base"}`}
                        data-testid={`done-${j}`}
                        onClick={() => (s.done ? commit(updateSet(w, entryIdx, j, { done: false })) : completeSet(j))}
                      >
                        {s.done ? L("✓ تمت", "✓ Done") : L("تم", "Done")}
                      </button>
                      {entry.sets.length > 1 && (
                        <button className="btn-ghost min-h-9 px-2 text-red-600" aria-label={`${L("حذف المجموعة", "Delete set")} ${j + 1}`} onClick={() => commit(removeSet(w, entryIdx, j))}>
                          <IconTrash size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <NumberField label={L("الوزن (كجم)", "Weight (kg)")} value={s.weight} step={2.5} onChange={(v) => commit(updateSet(w, entryIdx, j, { weight: v }))} testId={`weight-${j}`} />
                    <NumberField label={repLabel} value={s.reps} step={1} inputMode="numeric" onChange={(v) => commit(updateSet(w, entryIdx, j, { reps: v }))} testId={`reps-${j}`} />
                  </div>
                  <div className="mt-2">
                    <Choice
                      label={L("كانت إزاي؟", "How did it feel?")}
                      options={DIFFICULTY.map((d) => ({ id: d.id, label: pick(d.label), emoji: d.emoji }))}
                      value={s.difficulty ?? null}
                      onChange={(v: Difficulty | null) => commit(updateSet(w, entryIdx, j, { difficulty: v, rpe: v ? DIFFICULTY.find((d) => d.id === v)!.rpe : null }))}
                      testId={`difficulty-${j}`}
                    />
                  </div>
                </div>
              ))}
              <button className="btn-secondary w-full" onClick={() => commit(addSet(w, entryIdx))}>
                <IconPlus size={18} /> {L("إضافة مجموعة", "Add set")}
              </button>
              {nextSetIdx >= 0 && (
                <button className="btn-go min-h-16 w-full text-xl" onClick={() => completeSet(nextSetIdx)} data-testid="complete">
                  <IconCheck size={22} /> {L("تم – Complete", "Complete – تم")}
                </button>
              )}
            </div>
          )}

          <div className="card space-y-3 p-3">
            <Choice
              label={L("في ألم أثناء التمرين؟", "Any pain during this exercise?")}
              cols={2}
              options={PAIN_LEVELS.map((p) => ({ id: p.id, label: pick(p.label), emoji: p.emoji, danger: p.id === "severe" }))}
              value={painLevel}
              onChange={(v) => {
                if (!v || v === "none") {
                  setPain(v, null);
                  setPainArea(null);
                } else {
                  setPainOpen(true);
                  setPainArea(null);
                  pendingPainRef.current = v;
                }
              }}
              testId="pain-choice"
            />
            {painReminder(Math.max(entry.kneePain ?? -1, entry.backPain ?? -1) < 0 ? null : Math.max(entry.kneePain ?? 0, entry.backPain ?? 0), Math.max(w.painBefore.knee ?? -1, w.painBefore.back ?? -1) < 0 ? null : Math.max(w.painBefore.knee ?? 0, w.painBefore.back ?? 0)) && (
              <Alert tone={painLevel === "severe" ? "red" : "amber"} icon={<IconAlert size={18} />}>
                {pick(painReminder(Math.max(entry.kneePain ?? 0, entry.backPain ?? 0), Math.max(w.painBefore.knee ?? -1, w.painBefore.back ?? -1) < 0 ? null : Math.max(w.painBefore.knee ?? 0, w.painBefore.back ?? 0)))}
              </Alert>
            )}
            {painLevel === "severe" && (
              <div className="grid grid-cols-2 gap-2">
                <button className="btn-secondary" onClick={() => commit({ ...updateEntry(w, entryIdx, { skipped: true }), currentIndex: step + 1 })} data-testid="skip-painful">
                  {L("تخطّي التمرين", "Skip exercise")}
                </button>
                <button className="btn-secondary" onClick={() => go(step + 1)}>
                  {L("التمرين التالي", "Next exercise")}
                </button>
              </div>
            )}
            <button className="text-sm underline" onClick={() => setNotesOpen((x) => !x)}>
              {L("إضافة ملاحظة (اختياري)", "Add a note (optional)")}
            </button>
            {notesOpen && <textarea className="input min-h-20" aria-label={L("ملاحظات", "Notes")} value={entry.notes} onChange={(e) => commit(updateEntry(w, entryIdx, { notes: e.target.value }))} />}
          </div>

          {!entry.skipped && (
            <button className="btn-ghost w-full text-sm text-muted" onClick={() => commit(updateEntry(w, entryIdx, { skipped: true }))}>
              {L("تخطي التمرين ده في الحصة دي", "Skip this exercise this session")}
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button className="btn-secondary min-h-14" onClick={() => go(step - 1)}>
              {dir === "rtl" ? "→" : "←"} {L("السابق", "Previous")}
            </button>
            <button className="btn-primary min-h-14 text-lg" onClick={() => go(step + 1)} data-testid="next-exercise">
              {step === n ? L("الكارديو", "Cardio") : L("التمرين التالي", "Next exercise")} {dir === "rtl" ? "←" : "→"}
            </button>
          </div>

          <Modal open={altOpen} onClose={() => setAltOpen(false)} title={L("البدائل", "Alternatives")}>
            {baseEx && (
              <AlternativesPanel
                base={baseEx}
                currentId={entry.exerciseId}
                settings={settings}
                all={map}
                prescription={pe}
                severePain={severe}
                onSelect={(id, reason) => {
                  commit(substituteInWorkout(w, entryIdx, id, reason));
                  setAltOpen(false);
                }}
              />
            )}
          </Modal>
          <Modal open={!!detailsOpen} onClose={() => setDetailsOpen(null)} title={L("طريقة الأداء والأخطاء", "Form & mistakes")}>
            {detailsOpen && <ExerciseDetails e={ex} settings={settings} showMedia={false} initialTab={detailsOpen} />}
          </Modal>
          <Modal open={painOpen} onClose={() => setPainOpen(false)} title={L("فين الألم؟", "Where is the pain?")}>
            <Choice
              cols={3}
              options={[
                { id: "knee" as const, label: L("الركبة", "Knee"), sub: "Knee" },
                { id: "back" as const, label: L("الظهر", "Back"), sub: "Back" },
                { id: "other" as const, label: L("مكان تاني", "Elsewhere"), sub: "Other" },
              ]}
              value={painArea}
              onChange={(a) => {
                setPainArea(a);
                if (a && pendingPainRef.current) {
                  setPain(pendingPainRef.current, a);
                  setPainOpen(false);
                }
              }}
              testId="pain-area"
              allowClear={false}
            />
          </Modal>
        </div>
      )}

      {/* ---------- الكارديو ---------- */}
      {step === n + 1 && (
        <div className="mt-2 space-y-3">
          <div className="card space-y-3 p-3">
            <div className="text-lg font-bold">{L("الكارديو", "Cardio")}</div>
            <div className="text-sm">
              {L("المخطط:", "Planned:")} {w.cardio.plannedMinutes} {L("دقيقة", "min")} – {pick(plan.cardio.intensity)}
            </div>
            <Choice
              label={L("الجهاز", "Machine")}
              cols={2}
              options={cardioOptions.map((c) => ({ id: c.id, label: exerciseText(c, lang).name }))}
              value={w.cardio.exerciseId}
              onChange={(v) => v && commit({ ...w, cardio: { ...w.cardio, exerciseId: v } })}
              allowClear={false}
            />
            <Choice
              label={L("المدة", "Duration")}
              cols={4}
              options={[...new Set([Math.max(5, w.cardio.plannedMinutes - 5), w.cardio.plannedMinutes, w.cardio.plannedMinutes + 5, w.cardio.plannedMinutes + 10])].map((m) => ({ id: String(m), label: `${m}`, sub: L("دقيقة", "min") }))}
              value={w.cardio.minutes != null ? String(w.cardio.minutes) : null}
              onChange={(v) => commit({ ...w, cardio: { ...w.cardio, minutes: v ? Number(v) : null } })}
            />
            <NumberField label={L("أو اكتب الدقائق", "Or type minutes")} value={w.cardio.minutes} step={1} inputMode="numeric" onChange={(v) => commit({ ...w, cardio: { ...w.cardio, minutes: v } })} testId="cardio-minutes" />
            <button
              className={`${w.cardio.done ? "btn-secondary" : "btn-go"} w-full`}
              onClick={() => {
                const before = w;
                const done = !w.cardio.done;
                commit({ ...w, cardio: { ...w.cardio, done, minutes: w.cardio.minutes ?? w.cardio.plannedMinutes } });
                if (done) motivate(before, L("الكارديو اتسجل", "Cardio saved"));
              }}
              data-testid="cardio-done"
            >
              {w.cardio.done ? L("✓ تم الكارديو", "✓ Cardio done") : L("تم – Complete", "Complete – تم")}
            </button>
            <p className="text-xs text-muted">{L("اعتمد على اختبار الكلام ومقياس الجهد بدل نبض مستهدف، لأن بعض أدوية الضغط بتأثر على النبض.", "Use the talk test and effort scale rather than a target heart rate, since some BP medications affect heart rate.")}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button className="btn-secondary min-h-14" onClick={() => go(step - 1)}>
              {L("السابق", "Previous")}
            </button>
            <button className="btn-primary min-h-14 text-lg" onClick={() => go(step + 1)} data-testid="to-finish">
              {L("الإنهاء", "Finish")}
            </button>
          </div>
        </div>
      )}

      {/* ---------- الإنهاء ---------- */}
      {step === n + 2 && (
        <div className="mt-2 space-y-3">
          <Celebration w={w} map={map} saved={false} />
          <div className="card p-3">
            <div className="mb-1 font-bold">{L("التهدئة", "Cool-down")}</div>
            <ul className="list-disc ps-5 text-sm">
              {plan.cooldown.map((c, i) => (
                <li key={i}>{pick(c)}</li>
              ))}
            </ul>
          </div>
          <div className="card space-y-3 p-3">
            <Choice
              label={L("الألم بعد الحصة", "Pain after the session")}
              cols={2}
              options={PAIN_LEVELS.map((p) => ({ id: p.id, label: pick(p.label), emoji: p.emoji, danger: p.id === "severe" }))}
              value={painLevelOf(Math.max(w.painAfter.knee ?? -1, w.painAfter.back ?? -1) < 0 ? null : Math.max(w.painAfter.knee ?? 0, w.painAfter.back ?? 0))}
              onChange={(v) => {
                const value = v ? PAIN_LEVELS.find((p) => p.id === v)!.value : null;
                commit({ ...w, painAfter: { knee: value, back: value } });
              }}
            />
            <Choice label={L("الطاقة النهارده؟", "Energy today?")} cols={4} options={ENERGY.map((e) => ({ id: e.id, label: pick(e.label) }))} value={w.energy ?? null} onChange={(v) => commit({ ...w, energy: v })} testId="energy" />
            <div>
              <label className="label" htmlFor="w-notes">
                {L("ملاحظات عامة (اختياري)", "General notes (optional)")}
              </label>
              <textarea id="w-notes" className="input min-h-16" value={w.notes} onChange={(e) => commit({ ...w, notes: e.target.value })} />
            </div>
          </div>
          <button
            className="btn-go min-h-16 w-full text-lg"
            data-testid="finish-session"
            onClick={async () => {
              timer.stop();
              onFinished(await finishWorkout(w));
            }}
          >
            {L("حفظ الحصة · Save session", "Save session · حفظ الحصة")}
          </button>
          {comp.doneSets < comp.totalSets && <p className="text-center text-xs text-muted">{L(`سجّلت ${comp.doneSets} من ${comp.totalSets} مجموعة؛ هيتحفظ اللي اتعمل فعلًا.`, `You logged ${comp.doneSets} of ${comp.totalSets} sets; what you did will be saved as is.`)}</p>}
          <button className="btn-ghost w-full text-sm text-red-600" onClick={() => setConfirmAbandon(true)}>
            {L("إلغاء هذه المحاولة", "Discard this attempt")}
          </button>
          <Modal
            open={confirmAbandon}
            onClose={() => setConfirmAbandon(false)}
            title={L("إلغاء المحاولة", "Discard attempt")}
            footer={
              <div className="grid grid-cols-2 gap-2">
                <button className="btn-secondary" onClick={() => setConfirmAbandon(false)}>
                  {L("رجوع", "Back")}
                </button>
                <button
                  className="btn-danger"
                  onClick={async () => {
                    await abandonWorkout(w);
                    timer.stop();
                    onFinished(null);
                  }}
                >
                  {L("إلغاء المحاولة", "Discard")}
                </button>
              </div>
            }
          >
            {L("الحصة مش هتتحسب مكتملة. بياناتك هتفضل محفوظة في السجل كمحاولة ملغاة ومش هتتمسح.", "The session won't count as completed. Your data stays in the log as a discarded attempt and isn't deleted.")}
          </Modal>
        </div>
      )}

      {toast && (
        <div className="no-print animate-pop fixed inset-x-3 bottom-[calc(8.5rem+env(safe-area-inset-bottom))] z-30 mx-auto flex max-w-xl items-center gap-3 rounded-2xl p-3 text-white shadow-2xl" style={{ background: "linear-gradient(135deg,#8E5CFF,#FF7A3D)" }} role="status" data-testid="toast">
          <span className="text-2xl">💪</span>
          <div className="min-w-0 flex-1">
            <b className="block text-sm">{toast.msg}</b>
            <span className="text-xs opacity-90">{toast.sub}</span>
          </div>
          <button
            className="rounded-xl bg-white/25 px-3 py-1.5 text-sm font-bold"
            onClick={() => {
              commit(toast.undo);
              timer.stop();
              setToast(null);
            }}
            data-testid="undo"
          >
            ↶ {L("تراجع", "Undo")}
          </button>
        </div>
      )}

      <RestTimerBar timer={timer} defaultSec={pe?.restSec ?? settings.defaultRestSec} />
    </div>
  );
}
