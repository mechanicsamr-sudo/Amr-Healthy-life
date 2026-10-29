import type { ScheduledSession } from "./schedule";
import type { Measurement, WellnessLog, WorkoutLog } from "./types";

export function setVolume(w: WorkoutLog): number {
  let v = 0;
  for (const e of w.entries) for (const s of e.sets) if (s.done && s.weight && s.reps) v += s.weight * s.reps;
  return Math.round(v);
}

export function doneSets(w: WorkoutLog): number {
  return w.entries.reduce((n, e) => n + e.sets.filter((s) => s.done).length, 0);
}

export function avgRpe(ws: WorkoutLog[]): number | null {
  const vals: number[] = [];
  for (const w of ws) for (const e of w.entries) for (const s of e.sets) if (s.done && s.rpe != null) vals.push(s.rpe);
  return vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : null;
}

export function cardioMinutes(ws: WorkoutLog[]): number {
  return ws.reduce((n, w) => n + (w.cardio.done ? w.cardio.minutes ?? 0 : 0), 0);
}

export type ExercisePoint = {
  date: string;
  maxWeight: number | null;
  totalReps: number;
  sets: number;
  volume: number;
};

/** تطور تمرين معين عبر الزمن (الحصص المكتملة فقط) */
export function exerciseHistory(ws: WorkoutLog[], exerciseId: string): ExercisePoint[] {
  const pts: ExercisePoint[] = [];
  for (const w of ws.filter((x) => x.status === "completed").sort((a, b) => a.date.localeCompare(b.date))) {
    const sets = w.entries.filter((e) => e.exerciseId === exerciseId).flatMap((e) => e.sets.filter((s) => s.done));
    if (!sets.length) continue;
    const weights = sets.map((s) => s.weight).filter((x): x is number => x != null);
    pts.push({
      date: w.date,
      maxWeight: weights.length ? Math.max(...weights) : null,
      totalReps: sets.reduce((n, s) => n + (s.reps ?? 0), 0),
      sets: sets.length,
      volume: Math.round(sets.reduce((n, s) => n + (s.weight ?? 0) * (s.reps ?? 0), 0)),
    });
  }
  return pts;
}

export function exercisesWithHistory(ws: WorkoutLog[]): string[] {
  const set = new Set<string>();
  for (const w of ws) if (w.status === "completed") for (const e of w.entries) if (e.sets.some((s) => s.done)) set.add(e.exerciseId);
  return [...set];
}

export interface WeekAdherence {
  week: number;
  planned: number;
  completed: number;
  pct: number;
}

/** الالتزام الأسبوعي: للأسابيع التي بدأت فعلًا فقط */
export function weeklyAdherence(schedule: ScheduledSession[], today: string): WeekAdherence[] {
  const byWeek = new Map<number, ScheduledSession[]>();
  for (const s of schedule) {
    const arr = byWeek.get(s.session.week) ?? [];
    arr.push(s);
    byWeek.set(s.session.week, arr);
  }
  const out: WeekAdherence[] = [];
  for (const [week, list] of [...byWeek.entries()].sort((a, b) => a[0] - b[0])) {
    const firstDate = list.map((s) => s.plannedDate).sort()[0];
    if (firstDate > today) continue;
    const planned = list.filter((s) => s.status !== "skipped").length;
    const completed = list.filter((s) => s.status === "completed").length;
    out.push({ week, planned, completed, pct: planned ? Math.round((completed / planned) * 100) : 0 });
  }
  return out;
}

export interface PeriodSummary {
  start: string;
  end: string;
  plannedSessions: number;
  completedSessions: number;
  missedSessions: number;
  skippedSessions: number;
  totalSets: number;
  volume: number;
  cardioMinutes: number;
  avgRpe: number | null;
  avgKneePain: number | null;
  avgBackPain: number | null;
  maxKneePain: number | null;
  maxBackPain: number | null;
  substitutions: number;
  firstWeight: Measurement | null;
  lastWeight: Measurement | null;
  measurements: Measurement[];
  workouts: WorkoutLog[];
  wellness: WellnessLog[];
  painNotes: { date: string; text: string }[];
}

function avg(xs: number[]): number | null {
  return xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : null;
}

export function summarizePeriod(
  start: string,
  end: string,
  schedule: ScheduledSession[],
  workouts: WorkoutLog[],
  measurements: Measurement[],
  wellness: WellnessLog[],
): PeriodSummary {
  const inRange = (d: string) => d >= start && d <= end;
  const sched = schedule.filter((s) => inRange(s.date));
  const ws = workouts.filter((w) => w.status === "completed" && inRange(w.date));
  const ms = measurements.filter((m) => inRange(m.date)).sort((a, b) => a.date.localeCompare(b.date));
  const wl = wellness.filter((x) => inRange(x.date)).sort((a, b) => a.date.localeCompare(b.date));
  const knee: number[] = [];
  const back: number[] = [];
  const painNotes: { date: string; text: string }[] = [];
  for (const w of ws) {
    for (const e of w.entries) {
      if (e.kneePain != null) knee.push(e.kneePain);
      if (e.backPain != null) back.push(e.backPain);
      if (e.notes) painNotes.push({ date: w.date, text: e.notes });
    }
    for (const p of [w.painBefore, w.painAfter]) {
      if (p.knee != null) knee.push(p.knee);
      if (p.back != null) back.push(p.back);
    }
    if (w.notes) painNotes.push({ date: w.date, text: w.notes });
  }
  for (const x of wl) {
    if (x.kneePain != null) knee.push(x.kneePain);
    if (x.backPain != null) back.push(x.backPain);
    if (x.notes) painNotes.push({ date: x.date, text: x.notes });
  }
  const withWeight = ms.filter((m) => m.weightKg != null);
  return {
    start,
    end,
    plannedSessions: sched.length,
    completedSessions: sched.filter((s) => s.status === "completed").length,
    missedSessions: sched.filter((s) => s.status === "missed").length,
    skippedSessions: sched.filter((s) => s.status === "skipped").length,
    totalSets: ws.reduce((n, w) => n + doneSets(w), 0),
    volume: ws.reduce((n, w) => n + setVolume(w), 0),
    cardioMinutes: cardioMinutes(ws),
    avgRpe: avgRpe(ws),
    avgKneePain: avg(knee),
    avgBackPain: avg(back),
    maxKneePain: knee.length ? Math.max(...knee) : null,
    maxBackPain: back.length ? Math.max(...back) : null,
    substitutions: ws.reduce((n, w) => n + w.entries.filter((e) => e.substituted).length, 0),
    firstWeight: withWeight[0] ?? null,
    lastWeight: withWeight[withWeight.length - 1] ?? null,
    measurements: ms,
    workouts: ws,
    wellness: wl,
    painNotes,
  };
}

export function latestWeight(ms: Measurement[]): Measurement | null {
  const w = ms.filter((m) => m.weightKg != null).sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
  return w[0] ?? null;
}

export function bmi(weightKg: number, heightCm: number): number {
  const h = heightCm / 100;
  return Math.round((weightKg / (h * h)) * 10) / 10;
}
