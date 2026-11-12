import type { Bi, PlannedExercise, PrescriptionUnit } from "./types";

export const UNIT_LABEL: Record<PrescriptionUnit, Bi> = {
  reps: { ar: "تكرار", en: "reps" },
  reps_per_side: { ar: "تكرار لكل جهة", en: "reps/side" },
  seconds: { ar: "ثانية", en: "sec" },
  seconds_per_side: { ar: "ثانية لكل جهة", en: "sec/side" },
  meters: { ar: "متر", en: "m" },
};

export function repRange(pe: Pick<PlannedExercise, "repsMin" | "repsMax">) {
  return pe.repsMin === pe.repsMax ? `${pe.repsMax}` : `${pe.repsMin}-${pe.repsMax}`;
}

export function prescriptionText(pe: Pick<PlannedExercise, "sets" | "repsMin" | "repsMax" | "unit">, lang: "ar" | "en" = "ar") {
  return `${pe.sets} × ${repRange(pe)} ${UNIT_LABEL[pe.unit][lang]}`;
}

export function formatClock(sec: number) {
  const s = Math.max(0, Math.round(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}` : `${m}:${String(r).padStart(2, "0")}`;
}
