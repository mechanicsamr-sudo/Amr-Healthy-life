import { CONTENT } from "@/data/content";
import type { Exercise, Mistake } from "./types";

export interface ExerciseText {
  name: string;
  otherName: string;
  setup: string[];
  steps: string[];
  breathing: string;
  precautions: string[];
  guideline: string;
  reviewRequired?: string;
  start?: string;
  posture?: string;
  range?: string;
  mistakes: Mistake[];
}

/** نصوص التمرين باللغة المختارة. التمارين المخصصة تعرض ما أدخله المستخدم كما هو. */
export function exerciseText(e: Exercise, lang: "ar" | "en"): ExerciseText {
  const c = CONTENT[e.id];
  const en = lang === "en" && c;
  const mistakes: Mistake[] = c
    ? c.mistakes
    : e.mistakes.map((t) => ({ cat: "posture", title: { ar: t, en: t }, why: { ar: "", en: "" }, fix: { ar: "", en: "" } }));
  return {
    name: lang === "en" ? e.nameEn : e.nameAr,
    otherName: lang === "en" ? e.nameAr : e.nameEn,
    setup: en ? c.en.setup : e.setup,
    steps: en ? c.en.steps : e.steps,
    breathing: en ? c.en.breathing : e.breathing,
    precautions: en ? c.en.precautions : e.precautions,
    guideline: en ? c.en.guideline : e.guideline,
    reviewRequired: e.reviewRequired ? (en ? c.en.reviewRequired ?? e.reviewRequired : e.reviewRequired) : undefined,
    start: c ? c.start[lang] : undefined,
    posture: c ? c.posture[lang] : undefined,
    range: c ? c.range[lang] : undefined,
    mistakes,
  };
}
