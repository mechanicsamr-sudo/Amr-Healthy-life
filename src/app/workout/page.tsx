"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import AlternativesPanel from "@/components/AlternativesPanel";
import ExerciseDetails, { MuscleChips } from "@/components/ExerciseDetails";
import ExerciseImage from "@/components/ExerciseImage";
import { IconAlert, IconCheck, IconPlus, IconSwap, IconTrash } from "@/components/icons";
import RestTimerBar, { useRestTimer } from "@/components/RestTimer";
import { RedFlagButton } from "@/components/Safety";
import { Alert, Badge, Loading, Modal, NumberField, PainScale, PageHeader, ProgressBar } from "@/components/ui";
import { phaseForWeek } from "@/data/program";
import { db } from "@/lib/db";
import { formatDateMedium, formatTime } from "@/lib/dates";
import { painReminder, RPE_SCALE } from "@/lib/health";
import { useExercises, useSchedule, useSearchParam, useWorkouts } from "@/lib/hooks";
import { MUSCLES } from "@/lib/labels";
import { pickCurrentSession, type ScheduledSession } from "@/lib/schedule";
import { prescriptionText } from "@/lib/format";
import type { Exercise, PlannedSession, WorkoutLog } from "@/lib/types";
import {
  abandonWorkout,
  addSet,
  finishWorkout,
  lastPerformance,
  removeSet,
  saveWorkout,
  startOrResumeWorkout,
  substituteInWorkout,
  updateEntry,
  updateSet,
  workoutCompletion,
} from "@/lib/workout";

function SessionPreview({ s, map, onStart, otherInProgress }: { s: ScheduledSession; map: Record<string, Exercise>; onStart: () => void; otherInProgress?: ScheduledSession }) {
  const sess = s.session;
  const phase = phaseForWeek(sess.week);
  return (
    <div>
      <PageHeader
        title="تمرين اليوم"
        subtitle={
          <>
            {sess.name} · الأسبوع {sess.week} · {formatDateMedium(s.date)}
          </>
        }
      />
      {otherInProgress && (
        <div className="mb-3">
          <Alert tone="amber" title="لديك حصة أخرى غير مكتملة">
            <Link className="underline" href={`/workout/?session=${otherInProgress.session.id}`}>
              استكمل حصة الأسبوع {otherInProgress.session.week} ({otherInProgress.session.slot})
            </Link>
          </Alert>
        </div>
      )}
      {s.status === "upcoming" && (
        <div className="mb-3">
          <Alert tone="blue">هذه الحصة مقررة في {formatDateMedium(s.date)}. يمكنك الاطلاع عليها الآن، أو بدءها إذا قررت التمرين اليوم.</Alert>
        </div>
      )}
      {s.status === "missed" && (
        <div className="mb-3">
          <Alert tone="amber">هذه حصة فائتة من {formatDateMedium(s.date)}. يمكنك أداؤها الآن أو إعادة جدولتها من الرئيسية.</Alert>
        </div>
      )}
      <div className="card mb-3">
        <div className="mb-1 flex flex-wrap gap-1.5">
          <Badge tone="green">{phase.nameAr}</Badge>
          {sess.isDeload && <Badge tone="blue">أسبوع تخفيف</Badge>}
          <Badge>حوالي {sess.estimatedMinutes} دقيقة</Badge>
        </div>
        <p className="mt-2 text-sm">{sess.weekFocus}</p>
        <div className="mt-2 text-xs text-muted">العضلات المستهدفة: {sess.targetMuscles.map((m) => MUSCLES[m].ar).join("، ")}</div>
      </div>

      <div className="card mb-3">
        <div className="mb-1 font-bold">1. الإحماء ({sess.warmup.minutes} دقائق)</div>
        <ul className="list-disc ps-5 text-sm">
          <li>{map[sess.warmup.cardioExerciseId]?.nameAr} بجهد خفيف 5 دقائق</li>
          {sess.warmup.mobility.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      </div>

      <div className="card mb-3">
        <div className="mb-2 font-bold">2. تمارين المقاومة ({sess.exercises.length} تمارين)</div>
        <ol className="space-y-2">
          {sess.exercises.map((pe, i) => {
            const e = map[pe.exerciseId];
            return (
              <li key={i} className="flex items-start gap-2 border-b border-base pb-2 last:border-0">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{e?.nameAr ?? pe.exerciseId}</div>
                  <div className="ltr text-start text-xs text-muted">{e?.nameEn}</div>
                  <div className="text-sm">
                    {prescriptionText(pe)} · راحة {pe.restSec} ث · جهد {pe.rpe}/10
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="card mb-3">
        <div className="mb-1 font-bold">3. الكارديو</div>
        <div className="text-sm">
          {map[sess.cardio.exerciseId]?.nameAr}: {sess.cardio.minutes} دقيقة – {sess.cardio.intensity}
        </div>
      </div>

      <div className="card mb-3">
        <div className="mb-1 font-bold">4. التهدئة</div>
        <ul className="list-disc ps-5 text-sm">
          {sess.cooldown.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </div>

      <div className="mb-4">
        <Alert tone="amber" title="تعليمات السلامة لهذه الحصة" icon={<IconAlert size={18} />}>
          <ul className="list-disc space-y-1 ps-4">
            {sess.safetyNotes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </Alert>
      </div>

      <button className="btn-primary min-h-16 w-full text-lg" onClick={onStart} data-testid="start-session">
        ابدأ الحصة
      </button>
      <Link href={`/program/session/?id=${sess.id}`} className="btn-secondary mt-2 w-full">
        تعديل تمارين هذه الحصة
      </Link>
    </div>
  );
}

function CompletedView({ w, map }: { w: WorkoutLog; map: Record<string, Exercise> }) {
  const c = workoutCompletion(w);
  return (
    <div>
      <PageHeader title="الحصة مكتملة" subtitle={`${w.planSnapshot.name} · ${formatDateMedium(w.date)}`} />
      <Alert tone="green" title="تم تسجيل إنهاء الحصة" icon={<IconCheck size={18} />}>
        {c.doneSets} من {c.totalSets} مجموعة · كارديو {w.cardio.done ? w.cardio.minutes ?? 0 : 0} دقيقة
        {w.finishedAt && <> · انتهت {formatTime(w.finishedAt)}</>}
      </Alert>
      <div className="card mt-3">
        {w.entries.map((e, i) => (
          <div key={i} className="border-b border-base py-2 last:border-0">
            <div className="font-medium">
              {map[e.exerciseId]?.nameAr ?? e.exerciseId}
              {e.substituted && <span className="text-xs text-muted"> (بديل لـ {map[e.plannedExerciseId]?.nameAr})</span>}
              {e.skipped && <span className="text-xs text-muted"> (تم تخطيه)</span>}
            </div>
            <div className="ltr text-start text-sm text-muted">
              {e.sets
                .filter((s) => s.done)
                .map((s) => `${s.weight ?? "-"}kg×${s.reps ?? "-"}${s.rpe ? ` @${s.rpe}` : ""}`)
                .join("  |  ") || "—"}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link href="/" className="btn-secondary">
          الرئيسية
        </Link>
        <Link href="/progress/" className="btn-primary">
          التقدم
        </Link>
      </div>
    </div>
  );
}

export default function WorkoutPage() {
  const router = useRouter();
  const sessionParam = useSearchParam("session");
  const { schedule, loaded, today, settings } = useSchedule();
  const workouts = useWorkouts();
  const { map, list } = useExercises();
  const [w, setW] = useState<WorkoutLog | null>(null);
  const [loadingW, setLoadingW] = useState(true);
  const loadedFor = useRef<string | null>(null);
  const timer = useRestTimer({ sound: settings.sound, vibrate: settings.vibrate });

  const target = useMemo(() => {
    if (!loaded) return undefined;
    if (sessionParam) return schedule.find((s) => s.session.id === sessionParam);
    return pickCurrentSession(schedule, today);
  }, [loaded, schedule, sessionParam, today]);

  // تحميل الحصة غير المكتملة (استعادة بعد إغلاق التطبيق أو تحديث الصفحة)
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
        <PageHeader title="تمرين اليوم" />
        <div className="card">لا توجد حصة مطابقة. <Link className="underline" href="/program/">اختر حصة من البرنامج</Link></div>
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
  if (w.status === "completed") return <CompletedView w={w} map={map} />;

  return <LiveWorkout key={w.id} initial={w} map={map} list={list} settings={settings} timer={timer} workouts={workouts} onFinished={setW} />;
}

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
  const [w, setW] = useState(initial);
  const [saved, setSaved] = useState<number | null>(null);
  const [altOpen, setAltOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [confirmAbandon, setConfirmAbandon] = useState(false);
  const plan: PlannedSession = w.planSnapshot;
  const n = w.entries.length;
  const step = w.currentIndex; // 0 إحماء، 1..n تمارين، n+1 كارديو، n+2 إنهاء
  const comp = workoutCompletion(w);

  // حفظ تلقائي فوري بعد كل إدخال
  const commit = (next: WorkoutLog) => {
    setW(next);
    saveWorkout(next).then((s) => setSaved(s.updatedAt));
  };
  const go = (i: number) => {
    commit({ ...w, currentIndex: Math.max(0, Math.min(n + 2, i)) });
    window.scrollTo({ top: 0 });
  };

  const steps = [{ key: "warmup", label: "إحماء" }, ...w.entries.map((_, i) => ({ key: `e${i}`, label: String(i + 1) })), { key: "cardio", label: "كارديو" }, { key: "finish", label: "إنهاء" }];

  const entryIdx = step - 1;
  const entry = step >= 1 && step <= n ? w.entries[entryIdx] : null;
  const pe = entry ? plan.exercises[entry.slotIndex] : null;
  const ex = entry ? map[entry.exerciseId] : null;
  const baseEx = entry ? map[entry.plannedExerciseId] : null;
  const prev = entry ? lastPerformance(workouts, entry.exerciseId, w.id) : null;
  const unit = pe?.unit ?? "reps";
  const repLabel = unit.startsWith("seconds") ? "ثوانٍ" : unit === "meters" ? "متر" : "تكرارات";
  const cardioOptions = list.filter((e) => e.kind === "cardio" && !e.reviewRequired);

  return (
    <div className="pb-20">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-xl font-bold">{plan.name}</h1>
          <div className="text-xs text-muted">
            الأسبوع {plan.week} · {comp.doneSets}/{comp.totalSets} مجموعة
            {saved && <span data-testid="autosaved"> · حُفظ تلقائيًا {formatTime(saved)}</span>}
          </div>
        </div>
        <RedFlagButton className="min-h-10 shrink-0 px-2 text-sm" onReport={() => commit({ ...w, redFlagReported: true, notes: `${w.notes}\n[أوقفت الحصة بسبب أعراض]`.trim() })} />
      </div>
      <ProgressBar value={comp.totalSets ? (comp.doneSets / comp.totalSets) * 100 : 0} label="تقدم الحصة" />

      <nav className="no-print -mx-4 mt-3 flex gap-1.5 overflow-x-auto px-4 pb-2" aria-label="خطوات الحصة">
        {steps.map((s, i) => {
          const done = i >= 1 && i <= n ? w.entries[i - 1].sets.every((x) => x.done) || w.entries[i - 1].skipped : i === 0 ? w.warmupDone : i === n + 1 ? w.cardio.done : false;
          return (
            <button
              key={s.key}
              onClick={() => go(i)}
              aria-current={i === step ? "step" : undefined}
              className={`min-h-10 shrink-0 rounded-full border px-3 text-sm font-medium ${i === step ? "border-brand-600 bg-brand-600 text-white" : done ? "border-brand-400 text-brand-700 dark:text-brand-300" : "border-base"}`}
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
          <div className="card">
            <div className="mb-2 text-lg font-bold">الإحماء ({plan.warmup.minutes} دقائق)</div>
            <ul className="list-disc space-y-1 ps-5">
              <li>{map[plan.warmup.cardioExerciseId]?.nameAr} بجهد خفيف 5 دقائق</li>
              {plan.warmup.mobility.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </div>
          <div className="card space-y-3">
            <div className="font-bold">الألم قبل البدء (اختياري)</div>
            <PainScale label="الركبة" value={w.painBefore.knee} onChange={(v) => commit({ ...w, painBefore: { ...w.painBefore, knee: v } })} />
            <PainScale label="الظهر" value={w.painBefore.back} onChange={(v) => commit({ ...w, painBefore: { ...w.painBefore, back: v } })} />
            {((w.painBefore.knee ?? 0) >= 5 || (w.painBefore.back ?? 0) >= 5) && (
              <Alert tone="amber">الألم مرتفع قبل البدء. فكّر في حصة أخف أو تأجيلها، واستشر مختصًا إذا استمر.</Alert>
            )}
          </div>
          <button
            className="btn-primary min-h-14 w-full text-lg"
            onClick={() => commit({ ...w, warmupDone: true, currentIndex: 1 })}
            data-testid="warmup-done"
          >
            أنهيت الإحماء – التمرين الأول
          </button>
        </div>
      )}

      {/* ---------- تمرين ---------- */}
      {entry && ex && pe && (
        <div className="mt-2 space-y-3" data-testid="exercise-step">
          <ExerciseImage exercise={ex} compact />
          <div>
            <div className="text-xs text-muted">
              تمرين {entryIdx + 1} من {n}
              {entry.substituted && baseEx && <> · بديل لـ {baseEx.nameAr}</>}
            </div>
            <h2 className="text-2xl font-bold" data-testid="exercise-name">
              {ex.nameAr}
            </h2>
            <div className="ltr text-start text-muted">{ex.nameEn}</div>
            <div className="mt-2">
              <MuscleChips e={ex} />
            </div>
          </div>

          <div className="card grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-xs text-muted">المستهدف</div>
              <div className="font-bold">{prescriptionText({ ...pe, sets: entry.sets.length })}</div>
            </div>
            <div>
              <div className="text-xs text-muted">الراحة</div>
              <div className="font-bold">{pe.restSec} ث</div>
            </div>
            <div>
              <div className="text-xs text-muted">الجهد المستهدف</div>
              <div className="font-bold">{pe.rpe}/10</div>
            </div>
          </div>
          {pe.note && <Alert tone="amber">{pe.note}</Alert>}
          {ex.reviewRequired && <Alert tone="red" title="يحتاج مراجعة متخصص">{ex.reviewRequired}</Alert>}
          {prev && (
            <div className="text-sm text-muted">
              المرة السابقة ({formatDateMedium(prev.date)}): <span className="ltr">{prev.sets.map((s) => `${s.weight ?? "-"}×${s.reps ?? "-"}`).join(", ")}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button className="btn-secondary" onClick={() => setAltOpen(true)} data-testid="open-alternatives">
              <IconSwap size={18} /> البدائل
            </button>
            <button className="btn-secondary" onClick={() => setDetailsOpen(true)}>
              طريقة الأداء
            </button>
          </div>

          {entry.skipped ? (
            <Alert tone="blue">
              تم تخطي هذا التمرين في هذه الحصة.{" "}
              <button className="underline" onClick={() => commit(updateEntry(w, entryIdx, { skipped: false }))}>
                تراجع
              </button>
            </Alert>
          ) : (
            <div className="space-y-2">
              {entry.sets.map((s, j) => (
                <div key={j} className={`card p-3 ${s.done ? "border-brand-500" : ""}`} data-testid={`set-${j}`}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-bold">المجموعة {j + 1}</span>
                    {entry.sets.length > 1 && (
                      <button className="btn-ghost min-h-9 px-2 text-red-600" aria-label={`حذف المجموعة ${j + 1}`} onClick={() => commit(removeSet(w, entryIdx, j))}>
                        <IconTrash size={18} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <NumberField label="الوزن (كجم)" value={s.weight} step={2.5} onChange={(v) => commit(updateSet(w, entryIdx, j, { weight: v }))} testId={`weight-${j}`} />
                    <NumberField label={repLabel} value={s.reps} step={1} inputMode="numeric" onChange={(v) => commit(updateSet(w, entryIdx, j, { reps: v }))} testId={`reps-${j}`} />
                  </div>
                  <div className="mt-2 flex items-end gap-2">
                    <div className="flex-1">
                      <label className="label" htmlFor={`rpe-${entryIdx}-${j}`}>
                        مستوى المجهود (RPE)
                      </label>
                      <select
                        id={`rpe-${entryIdx}-${j}`}
                        className="input"
                        value={s.rpe ?? ""}
                        onChange={(e) => commit(updateSet(w, entryIdx, j, { rpe: e.target.value ? Number(e.target.value) : null }))}
                      >
                        <option value="">—</option>
                        {RPE_SCALE.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      className={`${s.done ? "btn-secondary" : "btn-primary"} min-w-24`}
                      data-testid={`done-${j}`}
                      onClick={() => {
                        const done = !s.done;
                        commit(updateSet(w, entryIdx, j, { done }));
                        if (done) timer.start(pe.restSec);
                      }}
                    >
                      {s.done ? "✓ تمت" : "تم"}
                    </button>
                  </div>
                </div>
              ))}
              <button className="btn-secondary w-full" onClick={() => commit(addSet(w, entryIdx))}>
                <IconPlus size={18} /> إضافة مجموعة
              </button>
            </div>
          )}

          <div className="card space-y-3">
            <div className="font-bold">الألم والملاحظات</div>
            <PainScale label="ألم الركبة" value={entry.kneePain} onChange={(v) => commit(updateEntry(w, entryIdx, { kneePain: v }))} testId="knee-pain" />
            {painReminder(entry.kneePain, w.painBefore.knee) && <Alert tone={(entry.kneePain ?? 0) >= 7 ? "red" : "amber"}>{painReminder(entry.kneePain, w.painBefore.knee)}</Alert>}
            <PainScale label="ألم الظهر" value={entry.backPain} onChange={(v) => commit(updateEntry(w, entryIdx, { backPain: v }))} />
            {painReminder(entry.backPain, w.painBefore.back) && <Alert tone={(entry.backPain ?? 0) >= 7 ? "red" : "amber"}>{painReminder(entry.backPain, w.painBefore.back)}</Alert>}
            <div>
              <label className="label" htmlFor="ex-notes">
                ملاحظات (ضبط الجهاز، الإحساس…)
              </label>
              <textarea id="ex-notes" className="input min-h-20" value={entry.notes} onChange={(e) => commit(updateEntry(w, entryIdx, { notes: e.target.value }))} />
            </div>
          </div>

          {!entry.skipped && (
            <button className="btn-ghost w-full text-sm text-muted" onClick={() => commit(updateEntry(w, entryIdx, { skipped: true }))}>
              تخطي هذا التمرين في هذه الحصة
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button className="btn-secondary min-h-14" onClick={() => go(step - 1)}>
              السابق
            </button>
            <button className="btn-primary min-h-14 text-lg" onClick={() => go(step + 1)} data-testid="next-exercise">
              {step === n ? "الكارديو" : "التمرين التالي"}
            </button>
          </div>

          <Modal open={altOpen} onClose={() => setAltOpen(false)} title="البدائل">
            {baseEx && (
              <AlternativesPanel
                base={baseEx}
                currentId={entry.exerciseId}
                settings={settings}
                all={map}
                onSelect={(id, reason) => {
                  commit(substituteInWorkout(w, entryIdx, id, reason));
                  setAltOpen(false);
                }}
              />
            )}
          </Modal>
          <Modal open={detailsOpen} onClose={() => setDetailsOpen(false)} title="طريقة الأداء">
            <ExerciseDetails e={ex} settings={settings} showImage={false} />
          </Modal>
        </div>
      )}

      {/* ---------- الكارديو ---------- */}
      {step === n + 1 && (
        <div className="mt-2 space-y-3">
          <div className="card space-y-3">
            <div className="text-lg font-bold">الكارديو</div>
            <div className="text-sm">
              المخطط: {w.cardio.plannedMinutes} دقيقة – {plan.cardio.intensity}
            </div>
            <div>
              <label className="label" htmlFor="cardio-type">
                الجهاز
              </label>
              <select id="cardio-type" className="input" value={w.cardio.exerciseId} onChange={(e) => commit({ ...w, cardio: { ...w.cardio, exerciseId: e.target.value } })}>
                {cardioOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameAr} ({c.nameEn})
                  </option>
                ))}
              </select>
            </div>
            <NumberField label="الدقائق الفعلية" value={w.cardio.minutes} step={1} inputMode="numeric" onChange={(v) => commit({ ...w, cardio: { ...w.cardio, minutes: v } })} testId="cardio-minutes" />
            <button
              className={`${w.cardio.done ? "btn-secondary" : "btn-primary"} w-full`}
              onClick={() => commit({ ...w, cardio: { ...w.cardio, done: !w.cardio.done, minutes: w.cardio.minutes ?? w.cardio.plannedMinutes } })}
              data-testid="cardio-done"
            >
              {w.cardio.done ? "✓ تم الكارديو" : "تم الكارديو"}
            </button>
            <p className="text-xs text-muted">يُفضَّل اختبار الكلام ومقياس الجهد بدل نبض مستهدف، لأن بعض أدوية الضغط تؤثر على النبض.</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button className="btn-secondary min-h-14" onClick={() => go(step - 1)}>
              السابق
            </button>
            <button className="btn-primary min-h-14 text-lg" onClick={() => go(step + 1)} data-testid="to-finish">
              الإنهاء
            </button>
          </div>
        </div>
      )}

      {/* ---------- الإنهاء ---------- */}
      {step === n + 2 && (
        <div className="mt-2 space-y-3">
          <div className="card">
            <div className="mb-2 text-lg font-bold">التهدئة</div>
            <ul className="list-disc ps-5 text-sm">
              {plan.cooldown.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
          <div className="card space-y-3">
            <div className="font-bold">الألم بعد الحصة</div>
            <PainScale label="الركبة" value={w.painAfter.knee} onChange={(v) => commit({ ...w, painAfter: { ...w.painAfter, knee: v } })} />
            <PainScale label="الظهر" value={w.painAfter.back} onChange={(v) => commit({ ...w, painAfter: { ...w.painAfter, back: v } })} />
            <div>
              <label className="label" htmlFor="w-notes">
                ملاحظات عامة
              </label>
              <textarea id="w-notes" className="input min-h-20" value={w.notes} onChange={(e) => commit({ ...w, notes: e.target.value })} />
            </div>
          </div>
          <div className="card text-sm">
            المجموعات المكتملة: {comp.doneSets} من {comp.totalSets} · الكارديو: {w.cardio.done ? `${w.cardio.minutes ?? 0} دقيقة` : "لم يُسجل"}
          </div>
          <button
            className="btn-primary min-h-16 w-full text-lg"
            data-testid="finish-session"
            onClick={async () => {
              if (comp.doneSets < comp.totalSets) setConfirmFinish(true);
              else {
                timer.stop();
                onFinished(await finishWorkout(w));
              }
            }}
          >
            إنهاء الحصة وتسجيلها
          </button>
          <button className="btn-ghost w-full text-sm text-red-600" onClick={() => setConfirmAbandon(true)}>
            إلغاء هذه المحاولة
          </button>
          <Modal
            open={confirmFinish}
            onClose={() => setConfirmFinish(false)}
            title="مجموعات غير مكتملة"
            footer={
              <div className="grid grid-cols-2 gap-2">
                <button className="btn-secondary" onClick={() => setConfirmFinish(false)}>
                  رجوع
                </button>
                <button
                  className="btn-primary"
                  data-testid="confirm-finish"
                  onClick={async () => {
                    setConfirmFinish(false);
                    timer.stop();
                    onFinished(await finishWorkout(w));
                  }}
                >
                  إنهاء على أي حال
                </button>
              </div>
            }
          >
            سجّلت {comp.doneSets} من {comp.totalSets} مجموعة. هل تريد تسجيل الحصة كمكتملة بما تم فعلًا؟ سيتم حفظ ما سجلته كما هو.
          </Modal>
          <Modal
            open={confirmAbandon}
            onClose={() => setConfirmAbandon(false)}
            title="إلغاء المحاولة"
            footer={
              <div className="grid grid-cols-2 gap-2">
                <button className="btn-secondary" onClick={() => setConfirmAbandon(false)}>
                  رجوع
                </button>
                <button
                  className="btn-danger"
                  onClick={async () => {
                    await abandonWorkout(w);
                    timer.stop();
                    onFinished(null);
                  }}
                >
                  إلغاء المحاولة
                </button>
              </div>
            }
          >
            لن تُحتسب الحصة مكتملة. ستبقى بياناتك المسجلة محفوظة في السجل كمحاولة ملغاة ولن تُحذف.
          </Modal>
        </div>
      )}

      <RestTimerBar timer={timer} defaultSec={pe?.restSec ?? settings.defaultRestSec} />
    </div>
  );
}
