import { EXERCISE_MAP } from "@/data/exercises";
import { PROGRAM_VERSION } from "@/data/program";
import { db, type GymDB } from "./db";
import type { Exercise, ExerciseMedia, Measurement, SessionOverride, WellnessLog, WorkoutLog } from "./types";

export const BACKUP_FORMAT = "amr-healthy-life-backup";
export const BACKUP_VERSION = 1;

export interface BackupFile {
  format: typeof BACKUP_FORMAT;
  version: number;
  programVersion: string;
  exportedAt: string;
  data: {
    kv: { key: string; value: unknown }[];
    workouts: WorkoutLog[];
    measurements: Measurement[];
    wellness: WellnessLog[];
    overrides: SessionOverride[];
    customExercises: Exercise[];
    media: ExerciseMedia[];
  };
}

export async function exportBackup(database: GymDB = db): Promise<BackupFile> {
  const [kv, workouts, measurements, wellness, overrides, customExercises, media] = await Promise.all([
    database.kv.toArray(),
    database.workouts.toArray(),
    database.measurements.toArray(),
    database.wellness.toArray(),
    database.overrides.toArray(),
    database.customExercises.toArray(),
    database.media.toArray(),
  ]);
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    programVersion: PROGRAM_VERSION,
    exportedAt: new Date().toISOString(),
    data: { kv, workouts, measurements, wellness, overrides, customExercises, media },
  };
}

export class BackupError extends Error {}

const isArr = (x: unknown): x is unknown[] => Array.isArray(x);
const isObj = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null && !Array.isArray(x);

export function validateBackup(raw: unknown): BackupFile {
  if (!isObj(raw) || raw.format !== BACKUP_FORMAT) throw new BackupError("الملف ليس نسخة احتياطية من هذا التطبيق.");
  if (typeof raw.version !== "number" || raw.version > BACKUP_VERSION) throw new BackupError("إصدار النسخة الاحتياطية غير مدعوم.");
  const d = raw.data;
  if (!isObj(d)) throw new BackupError("بيانات النسخة الاحتياطية مفقودة.");
  for (const k of ["kv", "workouts", "measurements", "wellness", "overrides", "customExercises", "media"]) {
    if (d[k] !== undefined && !isArr(d[k])) throw new BackupError(`الحقل ${k} غير صالح.`);
  }
  const check = (arr: unknown, key: string, label: string) => {
    for (const r of (arr as unknown[]) ?? []) if (!isObj(r) || typeof r[key] !== "string") throw new BackupError(`سجل غير صالح في ${label}.`);
  };
  check(d.workouts, "id", "التمارين");
  check(d.measurements, "id", "القياسات");
  check(d.wellness, "id", "سجل التعافي");
  check(d.overrides, "sessionId", "تعديلات الحصص");
  check(d.customExercises, "id", "التمارين المخصصة");
  check(d.media, "exerciseId", "الصور");
  check(d.kv, "key", "الإعدادات");
  for (const w of (d.workouts as Record<string, unknown>[]) ?? []) {
    if (!isArr(w.entries) || !isObj(w.planSnapshot)) throw new BackupError("سجل تمرين ناقص البيانات.");
  }
  for (const c of (d.customExercises as Record<string, unknown>[]) ?? []) {
    if (EXERCISE_MAP[c.id as string]) throw new BackupError("تمرين مخصص يحمل معرف تمرين مدمج.");
  }
  return {
    format: BACKUP_FORMAT,
    version: raw.version,
    programVersion: String(raw.programVersion ?? ""),
    exportedAt: String(raw.exportedAt ?? ""),
    data: {
      kv: (d.kv as BackupFile["data"]["kv"]) ?? [],
      workouts: (d.workouts as WorkoutLog[]) ?? [],
      measurements: (d.measurements as Measurement[]) ?? [],
      wellness: (d.wellness as WellnessLog[]) ?? [],
      overrides: (d.overrides as SessionOverride[]) ?? [],
      customExercises: (d.customExercises as Exercise[]) ?? [],
      media: (d.media as ExerciseMedia[]) ?? [],
    },
  };
}

/**
 * الاستيراد:
 * - merge (الافتراضي): يضيف/يحدّث السجلات حسب المعرف ولا يحذف أي بيانات موجودة.
 * - replace: يستبدل كل البيانات المحلية (يتطلب تأكيدًا صريحًا من الواجهة).
 */
export async function importBackup(file: BackupFile, mode: "merge" | "replace", database: GymDB = db) {
  const tables = [database.kv, database.workouts, database.measurements, database.wellness, database.overrides, database.customExercises, database.media];
  await database.transaction("rw", tables, async () => {
    if (mode === "replace") await Promise.all(tables.map((t) => t.clear()));
    await database.kv.bulkPut(file.data.kv);
    await database.workouts.bulkPut(file.data.workouts);
    await database.measurements.bulkPut(file.data.measurements);
    await database.wellness.bulkPut(file.data.wellness);
    await database.overrides.bulkPut(file.data.overrides);
    await database.customExercises.bulkPut(file.data.customExercises);
    await database.media.bulkPut(file.data.media);
  });
  return {
    workouts: file.data.workouts.length,
    measurements: file.data.measurements.length,
    wellness: file.data.wellness.length,
  };
}

// ---------- CSV ----------

function csvCell(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCSV(rows: (string | number | null | undefined)[][]): string {
  // BOM لضمان عرض العربية بشكل صحيح في Excel
  return "﻿" + rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
}

export function workoutsToCSV(workouts: WorkoutLog[], nameOf: (id: string) => { ar: string; en: string }): string {
  const rows: (string | number | null)[][] = [
    ["date", "session_id", "week", "status", "exercise_en", "exercise_ar", "planned_exercise", "substituted", "set", "weight_kg", "reps", "rpe", "set_done", "knee_pain", "back_pain", "notes"],
  ];
  for (const w of [...workouts].sort((a, b) => a.date.localeCompare(b.date))) {
    for (const e of w.entries) {
      const n = nameOf(e.exerciseId);
      e.sets.forEach((s, i) => {
        rows.push([w.date, w.sessionId, w.planSnapshot.week, w.status, n.en, n.ar, e.plannedExerciseId, e.substituted ? "yes" : "no", i + 1, s.weight, s.reps, s.rpe, s.done ? "yes" : "no", e.kneePain, e.backPain, i === 0 ? e.notes : ""]);
      });
    }
    rows.push([w.date, w.sessionId, w.planSnapshot.week, w.status, "cardio", "كارديو", w.cardio.exerciseId, "no", null, null, null, null, w.cardio.done ? "yes" : "no", null, null, `${w.cardio.minutes ?? 0} min`]);
  }
  return toCSV(rows);
}

export function measurementsToCSV(ms: Measurement[]): string {
  const rows: (string | number | null)[][] = [["date", "weight_kg", "waist_cm", "hip_cm", "chest_cm", "arm_cm", "thigh_cm", "bp_sys", "bp_dia", "resting_hr", "notes"]];
  for (const m of [...ms].sort((a, b) => a.date.localeCompare(b.date))) {
    rows.push([m.date, m.weightKg, m.waistCm, m.hipCm, m.chestCm, m.armCm, m.thighCm, m.bpSys, m.bpDia, m.restingHr, m.notes]);
  }
  return toCSV(rows);
}

export function downloadText(filename: string, text: string, mime: string) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
