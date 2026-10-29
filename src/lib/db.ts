import Dexie, { type Table } from "dexie";
import { DEFAULT_START_DATE, DEFAULT_TRAINING_DAYS } from "./schedule";
import type { Exercise, ExerciseMedia, Measurement, SessionOverride, Settings, WellnessLog, WorkoutLog } from "./types";

// قاعدة البيانات المحلية (IndexedDB). لا يوجد خادم ولا مزامنة سحابية.

interface KV {
  key: string;
  value: unknown;
}

export class GymDB extends Dexie {
  kv!: Table<KV, string>;
  workouts!: Table<WorkoutLog, string>;
  measurements!: Table<Measurement, string>;
  wellness!: Table<WellnessLog, string>;
  overrides!: Table<SessionOverride, string>;
  customExercises!: Table<Exercise, string>;
  media!: Table<ExerciseMedia, string>;

  constructor(name = "amr-healthy-life") {
    super(name);
    this.version(1).stores({
      kv: "key",
      workouts: "id, sessionId, date, status, updatedAt",
      measurements: "id, date",
      wellness: "id, date",
      overrides: "sessionId",
      customExercises: "id",
      media: "exerciseId",
    });
  }
}

export const db = new GymDB();

export const DEFAULT_SETTINGS: Settings = {
  profile: {
    name: "",
    startWeightKg: 132.4,
    heightCm: 179,
    level: "beginner",
    goal: "خسارة الدهون مع الحفاظ على العضلات وتحسين القوة واللياقة",
    conditions: {
      kneeOA: true,
      kneeNote: "خشونة ركبة من الدرجة الأولى",
      backPain: true,
      backNote: "ألم متقطع في الظهر",
      bpMeds: true,
      bpNote: "ضغط الدم منتظم حاليًا مع تناول دواء بصورة مستمرة",
      other: "",
    },
    startDate: DEFAULT_START_DATE,
    trainingDays: DEFAULT_TRAINING_DAYS,
  },
  theme: "system",
  equipment: {},
  defaultRestSec: 90,
  sound: true,
  vibrate: true,
  safetyAcknowledgedAt: null,
};

export function mergeSettings(stored: Partial<Settings> | undefined): Settings {
  if (!stored) return DEFAULT_SETTINGS;
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    profile: {
      ...DEFAULT_SETTINGS.profile,
      ...(stored.profile ?? {}),
      conditions: { ...DEFAULT_SETTINGS.profile.conditions, ...(stored.profile?.conditions ?? {}) },
    },
    equipment: { ...(stored.equipment ?? {}) },
  };
}

export async function getSettings(database: GymDB = db): Promise<Settings> {
  const row = await database.kv.get("settings");
  return mergeSettings(row?.value as Partial<Settings> | undefined);
}

export async function saveSettings(s: Settings, database: GymDB = db): Promise<void> {
  await database.kv.put({ key: "settings", value: s });
}

export async function updateSettings(fn: (s: Settings) => Settings, database: GymDB = db): Promise<Settings> {
  return database.transaction("rw", database.kv, async () => {
    const next = fn(await getSettings(database));
    await saveSettings(next, database);
    return next;
  });
}

export function uid(prefix = ""): string {
  const r = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return prefix + r;
}
