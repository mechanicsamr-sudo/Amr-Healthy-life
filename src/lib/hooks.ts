"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useMemo, useState } from "react";
import { EXERCISES, EXERCISE_MAP } from "@/data/exercises";
import { db, DEFAULT_SETTINGS, mergeSettings } from "./db";
import { todayISO } from "./dates";
import { buildSchedule, type ScheduledSession } from "./schedule";
import type { Exercise, Settings } from "./types";

export function useSettings(): { settings: Settings; loaded: boolean } {
  const row = useLiveQuery(() => db.kv.get("settings").then((r) => r ?? null), []);
  return useMemo(
    () => ({ settings: row ? mergeSettings(row.value as Partial<Settings>) : DEFAULT_SETTINGS, loaded: row !== undefined }),
    [row],
  );
}

export function useWorkouts() {
  return useLiveQuery(() => db.workouts.toArray(), []);
}

export function useMeasurements() {
  return useLiveQuery(() => db.measurements.toArray(), []);
}

export function useWellness() {
  return useLiveQuery(() => db.wellness.toArray(), []);
}

export function useOverrides() {
  return useLiveQuery(() => db.overrides.toArray(), []);
}

export function useMedia() {
  return useLiveQuery(() => db.media.toArray(), []);
}

/** التمارين المدمجة + التمارين المخصصة التي أضافها المستخدم */
export function useExercises(): { list: Exercise[]; map: Record<string, Exercise>; loaded: boolean } {
  const custom = useLiveQuery(() => db.customExercises.toArray(), []);
  return useMemo(() => {
    const list = [...EXERCISES, ...(custom ?? [])];
    return { list, map: { ...EXERCISE_MAP, ...Object.fromEntries((custom ?? []).map((c) => [c.id, c])) }, loaded: custom !== undefined };
  }, [custom]);
}

/** تاريخ اليوم يتحدث تلقائيًا بعد منتصف الليل */
export function useToday(): string {
  const [today, setToday] = useState(() => todayISO());
  useEffect(() => {
    const id = setInterval(() => setToday(todayISO()), 60_000);
    return () => clearInterval(id);
  }, []);
  return today;
}

export function useSchedule(): { schedule: ScheduledSession[]; loaded: boolean; today: string; settings: Settings } {
  const { settings, loaded: sLoaded } = useSettings();
  const overrides = useOverrides();
  const workouts = useWorkouts();
  const today = useToday();
  const loaded = sLoaded && overrides !== undefined && workouts !== undefined;
  const schedule = useMemo(
    () => (loaded ? buildSchedule(settings.profile.startDate, settings.profile.trainingDays, overrides!, workouts!, today) : []),
    [loaded, settings.profile.startDate, settings.profile.trainingDays, overrides, workouts, today],
  );
  return { schedule, loaded, today, settings };
}

export function useSearchParam(name: string): string | null {
  const [value, setValue] = useState<string | null>(null);
  useEffect(() => {
    const read = () => setValue(new URLSearchParams(window.location.search).get(name));
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, [name]);
  return value;
}
