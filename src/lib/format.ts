import type { PlannedExercise, PrescriptionUnit } from "./types";

export const UNIT_LABEL: Record<PrescriptionUnit, string> = {
  reps: "تكرار",
  reps_per_side: "تكرار لكل جهة",
  seconds: "ثانية",
  seconds_per_side: "ثانية لكل جهة",
  meters: "متر",
};

export function prescriptionText(pe: Pick<PlannedExercise, "sets" | "repsMin" | "repsMax" | "unit">) {
  const range = pe.repsMin === pe.repsMax ? `${pe.repsMax}` : `${pe.repsMin}-${pe.repsMax}`;
  return `${pe.sets} × ${range} ${UNIT_LABEL[pe.unit]}`;
}
