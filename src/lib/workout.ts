import { PROGRAM_VERSION } from "@/data/program";
import { db, uid, type GymDB } from "./db";
import { todayISO } from "./dates";
import type { ExerciseEntry, PlannedExercise, PlannedSession, SessionOverride, SetLog, WorkoutLog } from "./types";

export function emptySets(n: number): SetLog[] {
  return Array.from({ length: n }, () => ({ weight: null, reps: null, rpe: null, done: false }));
}

export function entryFromPlan(pe: PlannedExercise, slotIndex: number): ExerciseEntry {
  return {
    slotIndex,
    plannedExerciseId: pe.exerciseId,
    exerciseId: pe.exerciseId,
    substituted: false,
    sets: emptySets(pe.sets),
    kneePain: null,
    backPain: null,
    notes: "",
  };
}

export function newWorkout(session: PlannedSession, scheduledDate: string, now = Date.now()): WorkoutLog {
  return {
    id: uid("w_"),
    sessionId: session.id,
    scheduledDate,
    date: todayISO(new Date(now)),
    startedAt: now,
    updatedAt: now,
    finishedAt: null,
    status: "in_progress",
    // نسخة ثابتة من خطة الحصة وقت البدء: تعديل البرنامج لاحقًا لا يغير السجلات القديمة
    planSnapshot: structuredClone(session),
    programVersion: PROGRAM_VERSION,
    currentIndex: 0,
    warmupDone: false,
    entries: session.exercises.map(entryFromPlan),
    cardio: { exerciseId: session.cardio.exerciseId, plannedMinutes: session.cardio.minutes, minutes: null, done: false },
    painBefore: { knee: null, back: null },
    painAfter: { knee: null, back: null },
    notes: "",
    redFlagReported: false,
  };
}

export async function startOrResumeWorkout(session: PlannedSession, scheduledDate: string, database: GymDB = db): Promise<WorkoutLog> {
  const existing = await database.workouts.where("sessionId").equals(session.id).and((w) => w.status === "in_progress").first();
  if (existing) return existing;
  const w = newWorkout(session, scheduledDate);
  await database.workouts.put(w);
  return w;
}

/** حفظ تلقائي: يُستدعى بعد كل إدخال */
export async function saveWorkout(w: WorkoutLog, database: GymDB = db): Promise<WorkoutLog> {
  const next = { ...w, updatedAt: Date.now() };
  await database.workouts.put(next);
  return next;
}

export function updateSet(w: WorkoutLog, entryIdx: number, setIdx: number, patch: Partial<SetLog>): WorkoutLog {
  const entries = w.entries.map((e, i) => {
    if (i !== entryIdx) return e;
    const sets = e.sets.map((s, j) => (j === setIdx ? { ...s, ...patch, ts: Date.now() } : s));
    // عند إنهاء مجموعة: اقتراح نفس الوزن للمجموعة التالية إن كانت فارغة (المستخدم يعدله بحرية)
    const next = sets[setIdx + 1];
    if (patch.done && next && next.weight == null && sets[setIdx].weight != null) sets[setIdx + 1] = { ...next, weight: sets[setIdx].weight };
    return { ...e, sets };
  });
  return { ...w, entries };
}

export function addSet(w: WorkoutLog, entryIdx: number): WorkoutLog {
  const entries = w.entries.map((e, i) => {
    if (i !== entryIdx) return e;
    const last = e.sets[e.sets.length - 1];
    return { ...e, sets: [...e.sets, { weight: last?.weight ?? null, reps: null, rpe: null, done: false }] };
  });
  return { ...w, entries };
}

export function removeSet(w: WorkoutLog, entryIdx: number, setIdx: number): WorkoutLog {
  const entries = w.entries.map((e, i) => (i === entryIdx && e.sets.length > 1 ? { ...e, sets: e.sets.filter((_, j) => j !== setIdx) } : e));
  return { ...w, entries };
}

export function updateEntry(w: WorkoutLog, entryIdx: number, patch: Partial<ExerciseEntry>): WorkoutLog {
  return { ...w, entries: w.entries.map((e, i) => (i === entryIdx ? { ...e, ...patch } : e)) };
}

/**
 * استبدال تمرين في هذه الحصة فقط. البرنامج الأساسي و planSnapshot يبقيان كما هما،
 * ويُحفظ التمرين الأصلي في plannedExerciseId.
 */
export function substituteInWorkout(w: WorkoutLog, entryIdx: number, newExerciseId: string, reason: string): WorkoutLog {
  return updateEntry(w, entryIdx, {
    exerciseId: newExerciseId,
    substituted: newExerciseId !== w.entries[entryIdx].plannedExerciseId,
    substitutionReason: newExerciseId === w.entries[entryIdx].plannedExerciseId ? undefined : reason,
    // البيانات المسجلة للتمرين السابق لا تنطبق على البديل
    sets: w.entries[entryIdx].sets.map(() => ({ weight: null, reps: null, rpe: null, done: false })),
  });
}

export function workoutCompletion(w: WorkoutLog): { doneSets: number; totalSets: number } {
  let doneSets = 0;
  let totalSets = 0;
  for (const e of w.entries) {
    if (e.skipped) continue;
    totalSets += e.sets.length;
    doneSets += e.sets.filter((s) => s.done).length;
  }
  return { doneSets, totalSets };
}

export async function finishWorkout(w: WorkoutLog, database: GymDB = db): Promise<WorkoutLog> {
  const next: WorkoutLog = { ...w, status: "completed", finishedAt: Date.now(), updatedAt: Date.now() };
  await database.workouts.put(next);
  return next;
}

export async function abandonWorkout(w: WorkoutLog, database: GymDB = db): Promise<void> {
  await database.workouts.put({ ...w, status: "abandoned", updatedAt: Date.now() });
}

/** آخر أداء مسجل لتمرين معين (لعرض "المرة السابقة") */
export function lastPerformance(workouts: WorkoutLog[], exerciseId: string, excludeWorkoutId?: string): { date: string; sets: SetLog[] } | null {
  const sorted = workouts
    .filter((w) => w.id !== excludeWorkoutId && w.status !== "abandoned")
    .sort((a, b) => b.updatedAt - a.updatedAt);
  for (const w of sorted) {
    const e = w.entries.find((x) => x.exerciseId === exerciseId && x.sets.some((s) => s.done));
    if (e) return { date: w.date, sets: e.sets.filter((s) => s.done) };
  }
  return null;
}

// ---------- تعديلات البرنامج لحصة واحدة (لا تحذف أي سجل قديم) ----------

export async function getOverride(sessionId: string, database: GymDB = db): Promise<SessionOverride | undefined> {
  return database.overrides.get(sessionId);
}

export async function patchOverride(sessionId: string, patch: Partial<SessionOverride>, database: GymDB = db): Promise<void> {
  await database.transaction("rw", database.overrides, async () => {
    const prev = await database.overrides.get(sessionId);
    await database.overrides.put({ ...(prev ?? { sessionId }), ...patch, sessionId, updatedAt: Date.now() });
  });
}

export async function resetSessionExercises(sessionId: string, database: GymDB = db): Promise<void> {
  const prev = await database.overrides.get(sessionId);
  if (!prev) return;
  const { exercises: _drop, ...rest } = prev;
  await database.overrides.put({ ...rest, updatedAt: Date.now() });
}
