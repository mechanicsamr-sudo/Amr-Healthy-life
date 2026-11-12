import type { Bi, MuscleGroup } from "@/lib/types";
import { m } from "./content/helpers";
import type { Mistake } from "@/lib/types";

/*
 * حركات الإحماء: مختارة لتناسب خشونة الركبة (الدرجة الأولى) وألم الظهر المتقطع.
 * بدون قفز، بدون ثني ركبة عميق، وبدون انحناء كبير للظهر.
 */

export interface WarmupMove {
  id: string;
  name: Bi;
  area: Bi;
  areaMuscles: MuscleGroup[];
  dose: Bi;
  seconds: number;
  steps: { ar: string[]; en: string[] };
  mistakes: Mistake[];
  safety?: Bi;
}

export const WARMUP_MOVES: WarmupMove[] = [
  {
    id: "wu_arm_circles", name: { ar: "دوائر الذراعين", en: "Arm Circles" }, area: { ar: "الكتف", en: "Shoulders" }, areaMuscles: ["shoulders"],
    dose: { ar: "10 لقدام + 10 لورا", en: "10 forward + 10 back" }, seconds: 40,
    steps: { ar: ["افرد دراعك على الجنب لمستوى الكتف.", "لف دوائر صغيرة وكبّرها بالتدريج.", "غيّر الاتجاه."], en: ["Raise your arms out to the sides at shoulder height.", "Make small circles and gradually enlarge them.", "Switch direction."] },
    mistakes: [m("posture", "رفع الكتف ناحية الودن", "Shrugging the shoulders", "بيشد الرقبة.", "It tenses the neck.", "خلي كتفك مرتاح لتحت.", "Keep your shoulders relaxed and low."), m("tempo", "دوائر سريعة وكبيرة من الأول", "Fast, big circles from the start", "ممكن تضايق الكتف.", "It may irritate the shoulder.", "ابدأ صغير وبطيء.", "Start small and slow.")],
  },
  {
    id: "wu_shoulder_rolls", name: { ar: "لف الكتف", en: "Shoulder Rolls" }, area: { ar: "الكتف والرقبة", en: "Shoulders & neck" }, areaMuscles: ["shoulders", "back"],
    dose: { ar: "10 مرات", en: "10 reps" }, seconds: 30,
    steps: { ar: ["قف معتدل والدراعين مرتاحين.", "ارفع كتفك لفوق ولف لورا ولتحت ببطء."], en: ["Stand tall with relaxed arms.", "Lift the shoulders up, roll them back and down slowly."] },
    mistakes: [m("posture", "تحريك الرأس مع الكتف", "Moving the head with the shoulders", "بيشد الرقبة.", "It strains the neck.", "ثبّت رأسك وبص لقدام.", "Keep your head still and look ahead."), m("tempo", "حركة سريعة", "Rushing", "مفيش إحماء حقيقي.", "No real warm-up effect.", "ببطء مع التنفس.", "Slowly, with your breath.")],
  },
  {
    id: "wu_torso_twist", name: { ar: "لف الجذع بهدوء", en: "Gentle Torso Twist" }, area: { ar: "الجذع والظهر", en: "Trunk & back" }, areaMuscles: ["core", "back"],
    dose: { ar: "8 لكل جهة", en: "8 per side" }, seconds: 40,
    steps: { ar: ["قف والرجلين بعرض الكتف والإيدين قدام الصدر.", "لف الجذع يمين وشمال بمدى صغير مريح.", "خلي الحوض ثابت لقدام."], en: ["Stand feet shoulder-width, hands in front of your chest.", "Turn the trunk right and left through a small, comfortable range.", "Keep the hips facing forward."] },
    mistakes: [m("range", "لف كبير وسريع", "Big, fast twists", "ممكن يثير ألم الظهر.", "It can provoke back pain.", "مدى صغير وبطيء.", "Small and slow."), m("posture", "لف الركبة مع الجسم", "Twisting through the knees", "بيلف مفصل الركبة.", "It torques the knee joint.", "القدم ثابتة والركبة لقدام.", "Feet planted, knees forward.")],
    safety: { ar: "لو الظهر بيوجع، قلل المدى أو تخطاها.", en: "If your back hurts, reduce the range or skip it." },
  },
  {
    id: "wu_hip_circles", name: { ar: "دوائر الورك وقوف", en: "Standing Hip Circles" }, area: { ar: "الورك", en: "Hips" }, areaMuscles: ["glutes"],
    dose: { ar: "8 لكل اتجاه", en: "8 each direction" }, seconds: 40,
    steps: { ar: ["إيديك على وسطك أو امسك جهاز ثابت.", "لف الحوض دوائر هادية.", "غيّر الاتجاه."], en: ["Hands on hips or hold a stable machine.", "Circle the hips gently.", "Change direction."] },
    mistakes: [m("posture", "ثني الركبة كتير", "Bending the knees a lot", "الحركة تبعد عن الورك.", "The movement leaves the hips.", "ركبة مرتخية بس.", "Just soft knees."), m("range", "دوائر واسعة جدًا", "Very wide circles", "بتحمّل الظهر.", "They load the back.", "دوائر صغيرة.", "Small circles.")],
  },
  {
    id: "wu_march", name: { ar: "مشي في المكان (منخفض)", en: "Low Marching" }, area: { ar: "الأرجل", en: "Legs" }, areaMuscles: ["quads", "glutes"],
    dose: { ar: "30 ثانية", en: "30 seconds" }, seconds: 30,
    steps: { ar: ["امشِ في مكانك وارفع الركبة لارتفاع مريح.", "حرك دراعك مع الخطوة.", "بدون قفز."], en: ["March on the spot, lifting knees to a comfortable height.", "Swing your arms with the steps.", "No jumping."] },
    mistakes: [m("safety", "تحويلها لجري أو قفز", "Turning it into jogging or hopping", "صدمة على الركبة.", "Impact on the knee.", "مشي هادي بس.", "Gentle marching only."), m("range", "رفع الركبة عالي جدًا", "Lifting the knees too high", "ثني زيادة للركبة والظهر بيميل.", "Excess knee bend and the back leans.", "لحد ارتفاع مريح.", "To a comfortable height.")],
  },
  {
    id: "wu_side_steps", name: { ar: "خطوة جانبية", en: "Side Steps" }, area: { ar: "الورك والأرجل", en: "Hips & legs" }, areaMuscles: ["glutes", "quads"],
    dose: { ar: "10 لكل جهة", en: "10 each way" }, seconds: 40,
    steps: { ar: ["خطوة على الجنب وقرّب الرجل التانية.", "خطوات صغيرة والركبة مرتخية.", "دراعك بيتحرك براحته."], en: ["Step to the side and bring the other foot in.", "Small steps with soft knees.", "Let your arms move naturally."] },
    mistakes: [m("posture", "الركبة بتدخل لجوه", "Knees caving in", "ضغط على الركبة.", "Knee stress.", "الركبة على خط الصوابع.", "Knees over the toes."), m("safety", "خطوات واسعة وسريعة", "Wide, fast steps", "ممكن تفقد التوازن.", "You may lose balance.", "خطوات صغيرة.", "Small steps.")],
  },
  {
    id: "wu_wall_pushup", name: { ar: "ضغط حائط", en: "Wall Push-up" }, area: { ar: "الصدر والذراع", en: "Chest & arms" }, areaMuscles: ["chest", "triceps"],
    dose: { ar: "10 مرات", en: "10 reps" }, seconds: 40,
    steps: { ar: ["قف خطوتين من الحيطة والإيدين عليها بعرض الكتف.", "قرّب صدرك من الحيطة ببطء ثم ادفع.", "جسمك خط مستقيم."], en: ["Stand two steps from the wall, hands shoulder-width on it.", "Bring your chest toward the wall slowly, then push back.", "Keep your body in a straight line."] },
    mistakes: [m("posture", "هبوط الحوض", "Hips sagging", "بيحمّل الظهر.", "It loads the back.", "شد البطن والمؤخرة.", "Tighten abs and glutes."), m("breathing", "حبس النفس", "Holding your breath", "بيرفع الضغط.", "It raises blood pressure.", "ازفر وانت بتدفع.", "Exhale as you push.")],
  },
  {
    id: "wu_sit_to_stand", name: { ar: "جلوس ووقوف على بنش عالي", en: "Sit-to-Stand (high bench)" }, area: { ar: "الفخذ والمؤخرة", en: "Thighs & glutes" }, areaMuscles: ["quads", "glutes"],
    dose: { ar: "8 مرات", en: "8 reps" }, seconds: 45,
    steps: { ar: ["استخدم بنش عالي يريح الركبة.", "اقعد بخفة بالورك لورا وقوم بكامل القدم.", "مد دراعك لقدام للتوازن."], en: ["Use a high bench that's comfortable for your knee.", "Sit back lightly with the hips and stand through the whole foot.", "Reach the arms forward for balance."] },
    mistakes: [m("tempo", "السقوط على البنش", "Dropping onto the bench", "بيخبط الركبة والظهر.", "It jolts knees and back.", "انزل ببطء.", "Lower slowly."), m("setup", "بنش واطي", "Bench too low", "ثني ركبة عميق.", "Deep knee bend.", "اختار بنش أعلى.", "Choose a higher bench.")],
    safety: { ar: "لو الركبة وجعت، ارفع البنش أو تخطاها.", en: "If your knee hurts, raise the bench or skip it." },
  },
];

export const WARMUP_MAP = Object.fromEntries(WARMUP_MOVES.map((w) => [w.id, w]));

/** ترتيب الإحماء لكل نوع حصة */
export const WARMUP_BY_SLOT: Record<"A" | "B" | "C", string[]> = {
  A: ["wu_arm_circles", "wu_shoulder_rolls", "wu_hip_circles", "wu_march", "wu_torso_twist", "wu_side_steps", "wu_wall_pushup", "wu_sit_to_stand"],
  B: ["wu_shoulder_rolls", "wu_arm_circles", "wu_torso_twist", "wu_hip_circles", "wu_march", "wu_wall_pushup", "wu_side_steps", "wu_sit_to_stand"],
  C: ["wu_arm_circles", "wu_hip_circles", "wu_side_steps", "wu_march", "wu_shoulder_rolls", "wu_wall_pushup", "wu_torso_twist", "wu_sit_to_stand"],
};
