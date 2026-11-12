import type { ExerciseContent, Mistake, MistakeCategory } from "@/lib/types";

/** خطأ شائع: العنوان، ليه غلط، والتصحيح باللغتين */
export function m(cat: MistakeCategory, titleAr: string, titleEn: string, whyAr: string, whyEn: string, fixAr: string, fixEn: string): Mistake {
  return { cat, title: { ar: titleAr, en: titleEn }, why: { ar: whyAr, en: whyEn }, fix: { ar: fixAr, en: fixEn } };
}

export const bi = (ar: string, en: string) => ({ ar, en });

/** أخطاء متكررة في أغلب التمارين */
export const HOLD_BREATH = (exAr = "الحركة", exEn = "the effort") =>
  m("breathing", "حبس النفس", "Holding your breath",
    `حبس النفس أثناء ${exAr} يرفع ضغط الدم بشكل مفاجئ، وده مش مناسب مع دواء الضغط.`, `Holding your breath during ${exEn} spikes blood pressure, which isn't appropriate while on BP medication.`,
    "ازفر أثناء المجهود واستنشق أثناء الرجوع، وعد بصوت خافت لو نسيت.", "Exhale during the effort and inhale on the way back; count quietly if you tend to forget.");
export const TOO_FAST = m("tempo", "الحركة بسرعة وبالزخم", "Moving fast with momentum",
  "السرعة بتنقل الشغل من العضلة للمفاصل وبتزود فرصة الإصابة.", "Speed shifts the work from the muscle to the joints and raises injury risk.",
  "خلي النزول/الرجوع 2-3 ثواني، ووقف لحظة قبل ما تبدأ التكرار اللي بعده.", "Take 2–3 seconds on the lowering phase and pause briefly before the next rep.");
export const TOO_HEAVY = m("safety", "وزن تقيل أكتر من اللازم", "Using too much weight",
  "الوزن التقيل بيبوّظ الأداء، وكمبتدئ ده أكبر سبب للألم والإصابة.", "Excess weight breaks your form; for a beginner it's the main cause of pain and injury.",
  "اختار وزن تقدر تعمل بيه كل التكرارات وفاضل معاك 3-4 تكرارات.", "Pick a load that lets you finish all reps with 3–4 reps still in reserve.");

export type ContentMap = Record<string, ExerciseContent>;
