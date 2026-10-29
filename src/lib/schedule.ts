import { allSessions, PROGRAM_WEEKS } from "@/data/program";
import { addDays, diffDays, weekday } from "./dates";
import type { PlannedSession, SessionOverride, WorkoutLog } from "./types";

export const DEFAULT_START_DATE = "2026-10-31";
export const DEFAULT_TRAINING_DAYS = [6, 1, 3]; // السبت، الاثنين، الأربعاء

export function programEndDate(startDate: string): string {
  return addDays(startDate, PROGRAM_WEEKS * 7 - 1);
}

/** ترتيب أيام التدريب نسبةً إلى يوم بداية البرنامج */
export function orderedOffsets(startDate: string, trainingDays: number[]): number[] {
  const startDow = weekday(startDate);
  const offsets = [...new Set(trainingDays)].map((d) => (d - startDow + 7) % 7).sort((x, y) => x - y);
  return offsets.slice(0, 3);
}

export function plannedDate(session: PlannedSession, startDate: string, trainingDays: number[]): string {
  const offsets = orderedOffsets(startDate, trainingDays);
  const slotIdx = session.index % 3;
  const offset = offsets[slotIdx] ?? slotIdx * 2;
  return addDays(startDate, (session.week - 1) * 7 + offset);
}

export type SessionStatus = "completed" | "in_progress" | "skipped" | "missed" | "today" | "upcoming";

export interface ScheduledSession {
  session: PlannedSession;
  plannedDate: string;
  date: string; // بعد إعادة الجدولة
  rescheduled: boolean;
  status: SessionStatus;
  workout?: WorkoutLog;
  override?: SessionOverride;
}

export function effectiveSession(session: PlannedSession, override?: SessionOverride): PlannedSession {
  if (!override?.exercises) return session;
  return { ...session, exercises: override.exercises };
}

export function buildSchedule(
  startDate: string,
  trainingDays: number[],
  overrides: SessionOverride[],
  workouts: WorkoutLog[],
  today: string,
): ScheduledSession[] {
  const ovMap = new Map(overrides.map((o) => [o.sessionId, o]));
  // آخر سجل لكل حصة (المكتمل له الأولوية)
  const wMap = new Map<string, WorkoutLog>();
  for (const w of workouts) {
    if (w.status === "abandoned") continue;
    const prev = wMap.get(w.sessionId);
    if (!prev || (prev.status !== "completed" && (w.status === "completed" || w.updatedAt > prev.updatedAt))) wMap.set(w.sessionId, w);
  }
  return allSessions().map((s) => {
    const override = ovMap.get(s.id);
    const pd = plannedDate(s, startDate, trainingDays);
    const date = override?.rescheduledDate || pd;
    const workout = wMap.get(s.id);
    let status: SessionStatus;
    if (workout?.status === "completed") status = "completed";
    else if (workout?.status === "in_progress") status = "in_progress";
    else if (override?.skipped) status = "skipped";
    else if (date < today) status = "missed";
    else if (date === today) status = "today";
    else status = "upcoming";
    return {
      session: effectiveSession(s, override),
      plannedDate: pd,
      date,
      rescheduled: !!override?.rescheduledDate && override.rescheduledDate !== pd,
      status,
      workout,
      override,
    };
  });
}

/** حصة اليوم: قيد التنفيذ أولًا، ثم المجدولة اليوم، ثم الحصة القادمة */
export function pickCurrentSession(schedule: ScheduledSession[], today: string): ScheduledSession | undefined {
  const inProgress = schedule.find((s) => s.status === "in_progress");
  if (inProgress) return inProgress;
  const todays = schedule.filter((s) => s.date === today && s.status === "today");
  if (todays.length) return todays[0];
  return schedule
    .filter((s) => s.status === "upcoming")
    .sort((a, b) => (a.date === b.date ? a.session.index - b.session.index : a.date < b.date ? -1 : 1))[0];
}

export function programProgress(schedule: ScheduledSession[]) {
  const completed = schedule.filter((s) => s.status === "completed").length;
  return { completed, total: schedule.length, pct: Math.round((completed / schedule.length) * 100) };
}

/** رقم أسبوع البرنامج لتاريخ معين (1..26) أو null خارج البرنامج */
export function programWeekOf(date: string, startDate: string): number | null {
  const d = diffDays(date, startDate);
  if (d < 0) return null;
  const w = Math.floor(d / 7) + 1;
  return w > PROGRAM_WEEKS ? null : w;
}

export function weekRange(week: number, startDate: string): { start: string; end: string } {
  const start = addDays(startDate, (week - 1) * 7);
  return { start, end: addDays(start, 6) };
}
