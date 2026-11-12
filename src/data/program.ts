import type { Bi, CardioPlan, MuscleGroup, Phase, PlannedExercise, PlannedSession, PrescriptionUnit } from "@/lib/types";
import { EXERCISE_MAP } from "./exercises";
import { WARMUP_BY_SLOT, WARMUP_MAP } from "./warmup";

/*
 * برنامج الستة أشهر (26 أسبوعًا × 3 حصص = 78 حصة).
 *
 * مبادئ التصميم:
 * - لا يتم رفع الأوزان أو الحجم تلقائيًا. كل أسبوع يحدد نطاق مجموعات/تكرارات ومستوى جهد (RPE)،
 *   والمستخدم يقرر الوزن بناءً على أدائه وتعافيه واستجابة الركبة والظهر.
 * - التمارين التي تحتاج مراجعة (reviewRequired) لا تُستخدم في القوالب.
 * - أسابيع التخفيف: 9 و18 و26.
 */

export const PROGRAM_VERSION = "1.0.0";
export const PROGRAM_WEEKS = 26;
export const SESSIONS_PER_WEEK = 3;

export const PHASES: Phase[] = [
  {
    number: 1,
    name: { ar: "المرحلة 1: التأقلم وتعلّم الحركة", en: "Phase 1: Adaptation & learning" },
    weeks: [1, 2, 3, 4],
    goal: { ar: "تعلّم ضبط الأجهزة والأداء الصحيح، وبناء عادة الحضور 3 مرات أسبوعيًا بجهد خفيف.", en: "Learn machine setup and correct form, and build the habit of training 3 times a week at a light effort." },
    progressionRule: { ar: "لا ترفع الوزن في هذه المرحلة إلا إذا أكملت كل التكرارات بسهولة (RPE ≤ 5) دون أي زيادة في ألم الركبة أو الظهر في اليوم التالي.", en: "Only add weight in this phase if all reps feel easy (RPE ≤ 5) with no increase in knee or back pain the next day." },
  },
  {
    number: 2,
    name: { ar: "المرحلة 2: بناء الأساس", en: "Phase 2: Building the base" },
    weeks: [5, 6, 7, 8, 9],
    goal: { ar: "زيادة تدريجية في عدد المجموعات مع الحفاظ على التقنية. الأسبوع 9 أسبوع تخفيف.", en: "Gradually add sets while keeping technique. Week 9 is a deload week." },
    progressionRule: { ar: "أضف مجموعة ثالثة للتمارين الأساسية فقط إذا كان التعافي جيدًا ولم يزد الألم. زيادة الوزن صغيرة (أصغر خطوة في الجهاز) وبعد إكمال الحد الأعلى للتكرارات مرتين متتاليتين.", en: "Add a third set to main lifts only if recovery is good and pain hasn't increased. Weight increases are small (the machine's smallest step) after hitting the top of the rep range twice in a row." },
  },
  {
    number: 3,
    name: { ar: "المرحلة 3: القوة الأساسية", en: "Phase 3: Foundational strength" },
    weeks: [10, 11, 12, 13],
    goal: { ar: "3 مجموعات ثابتة بتكرارات 10-12 وجهد متوسط، وإدخال تمارين دمبلز مع سند.", en: "Steady 3 sets of 10–12 reps at moderate effort, introducing supported dumbbell exercises." },
    progressionRule: { ar: "قاعدة الحد الأعلى: إذا أكملت 12 تكرارًا في كل المجموعات بجهد ≤ 7 ومن دون ألم إضافي، يمكنك تجربة أصغر زيادة في الوزن في الحصة التالية.", en: "Top-of-range rule: if you complete 12 reps on every set at RPE ≤ 7 with no extra pain, try the smallest weight increase next session." },
  },
  {
    number: 4,
    name: { ar: "المرحلة 4: التطوير", en: "Phase 4: Development" },
    weeks: [14, 15, 16, 17, 18],
    goal: { ar: "نطاق تكرارات 8-12 وجهد 7، إضافة تمرين سابع. الأسبوع 18 أسبوع تخفيف.", en: "8–12 reps at RPE 7 with a seventh exercise. Week 18 is a deload week." },
    progressionRule: { ar: "ارفع الوزن فقط عند تحقيق 12 تكرارًا في كل المجموعات. إذا ظهر ألم في الركبة أو الظهر يزيد عن المعتاد، ثبّت الوزن أو قلله واستخدم بديلًا مناسبًا.", en: "Only add weight after 12 reps on every set. If knee or back pain rises above normal, hold or reduce the weight and use a suitable alternative." },
  },
  {
    number: 5,
    name: { ar: "المرحلة 5: البناء المتقدم للمبتدئ", en: "Phase 5: Advanced beginner build" },
    weeks: [19, 20, 21, 22],
    goal: { ar: "أعلى حجم تدريبي في البرنامج مع جهد 7-8 للتمارين المستقرة على الأجهزة فقط.", en: "The program's highest volume, with RPE 7–8 only on stable machine exercises." },
    progressionRule: { ar: "الجهد 8 مسموح فقط في تمارين الأجهزة المستقرة. لا جهد عالٍ في تمارين الركبة إذا كانت حساسة. التعافي أهم من الرقم.", en: "RPE 8 is allowed only on stable machines. No high effort on knee exercises if the knee is sensitive. Recovery matters more than numbers." },
  },
  {
    number: 6,
    name: { ar: "المرحلة 6: التثبيت والتقييم", en: "Phase 6: Consolidation & review" },
    weeks: [23, 24, 25, 26],
    goal: { ar: "تثبيت المكتسبات ومقارنة الأداء بالبداية. الأسبوع 26 أسبوع تخفيف وإعادة قياس.", en: "Consolidate gains and compare with the start. Week 26 is a deload and re-measurement week." },
    progressionRule: { ar: "حافظ على الأوزان التي تؤديها بتقنية ممتازة. سجّل القياسات النهائية في الأسبوع 26.", en: "Keep the weights you can lift with excellent form. Record final measurements in week 26." },
  },
];

export function phaseForWeek(week: number): Phase {
  return PHASES.find((p) => p.weeks.includes(week)) ?? PHASES[PHASES.length - 1];
}

export const DELOAD_WEEKS = [9, 18, 26];

/** نوع التمرين في الحصة يحدد فترة الراحة ونوع الوصفة */
type SlotRole = "main" | "accessory" | "core";

interface Slot {
  id: string;
  role: SlotRole;
}

const m = (id: string): Slot => ({ id, role: "main" });
const a = (id: string): Slot => ({ id, role: "accessory" });
const c = (id: string): Slot => ({ id, role: "core" });

type SessionSlot = "A" | "B" | "C";

const TEMPLATES: Record<number, Record<SessionSlot, Slot[]>> = {
  1: {
    A: [m("leg_press"), m("machine_chest_press"), m("seated_cable_row"), a("glute_bridge"), c("dead_bug")],
    B: [m("lat_pulldown"), m("machine_shoulder_press"), a("seated_leg_curl"), a("hip_abduction_machine"), c("bird_dog")],
    C: [m("sit_to_stand"), m("machine_row"), a("pec_deck"), a("seated_calf_raise"), c("pallof_press")],
  },
  2: {
    A: [m("leg_press"), m("machine_chest_press"), m("seated_cable_row"), a("hip_thrust_machine"), a("seated_leg_curl"), c("dead_bug")],
    B: [m("lat_pulldown"), m("incline_machine_press"), a("seated_leg_curl"), a("hip_abduction_machine"), a("cable_pushdown"), c("bird_dog")],
    C: [m("goblet_box_squat"), m("machine_row"), a("pec_deck"), a("db_curl"), a("seated_calf_raise"), c("pallof_press")],
  },
  3: {
    A: [m("leg_press"), m("db_bench_press"), m("seated_cable_row"), a("hip_thrust_machine"), a("hip_abduction_machine"), c("side_plank_knees")],
    B: [m("lat_pulldown"), m("seated_db_shoulder_press"), m("one_arm_db_row"), a("seated_leg_curl"), a("cable_pushdown"), c("dead_bug")],
    C: [m("goblet_box_squat"), m("incline_db_press"), m("machine_row"), a("reverse_pec_deck"), a("seated_calf_raise"), c("pallof_press")],
  },
  4: {
    A: [m("leg_press"), m("db_bench_press"), m("seated_cable_row"), a("hip_thrust_machine"), a("seated_leg_curl"), a("db_lateral_raise"), c("dead_bug")],
    B: [m("lat_pulldown"), m("machine_shoulder_press"), m("chest_supported_db_row"), a("step_up_low"), a("overhead_cable_ext"), a("hammer_curl"), c("bird_dog")],
    C: [m("goblet_box_squat"), m("incline_db_press"), m("machine_row"), a("face_pull"), a("hip_abduction_machine"), a("seated_calf_raise"), c("pallof_press")],
  },
  5: {
    A: [m("leg_press"), m("incline_db_press"), m("seated_cable_row"), a("hip_thrust_machine"), a("lying_leg_curl"), a("cable_lateral_raise"), c("side_plank_knees")],
    B: [m("lat_pulldown"), m("db_bench_press"), m("one_arm_db_row"), a("step_up_low"), a("cable_pushdown"), a("cable_curl"), c("dead_bug")],
    C: [m("goblet_box_squat"), m("machine_shoulder_press"), a("straight_arm_pulldown"), a("cable_fly"), a("hip_abduction_machine"), a("leg_press_calf_raise"), c("farmer_walk")],
  },
  6: {
    A: [m("leg_press"), m("machine_chest_press"), m("seated_cable_row"), a("hip_thrust_machine"), a("seated_leg_curl"), a("machine_lateral_raise"), c("dead_bug")],
    B: [m("lat_pulldown"), m("seated_db_shoulder_press"), m("chest_supported_db_row"), a("goblet_box_squat"), a("overhead_cable_ext"), a("db_curl"), c("pallof_press")],
    C: [m("step_up_low"), m("incline_db_press"), m("machine_row"), a("reverse_pec_deck"), a("hip_abduction_machine"), a("seated_calf_raise"), c("farmer_walk")],
  },
};

const SESSION_NAMES: Record<SessionSlot, Bi> = {
  A: { ar: "الحصة A: أرجل (دفع) + صدر + ظهر", en: "Session A: Legs (push) + Chest + Back" },
  B: { ar: "الحصة B: سحب علوي + كتف + خلفية الفخذ", en: "Session B: Upper pull + Shoulders + Hamstrings" },
  C: { ar: "الحصة C: جسم كامل + ثبات الجذع", en: "Session C: Full body + Core stability" },
};

const CARDIO_BY_SLOT: Record<SessionSlot, string> = {
  A: "treadmill_walk",
  B: "recumbent_bike",
  C: "elliptical",
};

const COOLDOWN: Bi[] = [
  { ar: "مشي هادئ 3-5 دقائق حتى يهدأ التنفس", en: "Easy walking for 3–5 minutes until your breathing settles" },
  { ar: "إطالة خفيفة للفخذ الأمامية والخلفية والصدر 20-30 ثانية لكل منها دون ألم", en: "Gentle stretches for quads, hamstrings and chest, 20–30 s each, pain-free" },
  { ar: "انهض ببطء من أي وضع جلوس أو استلقاء", en: "Get up slowly from any seated or lying position" },
];

interface WeekParams {
  mainSets: number;
  accSets: number;
  coreSets: number;
  repsMin: number;
  repsMax: number;
  rpe: string;
  mainRest: number;
  accRest: number;
  cardioMinutes: number;
  cardioIntensity: Bi;
  focus: Bi;
}

/** معاملات كل أسبوع على حدة: خطة فعلية لكل أسبوع وليست تكرارًا لعنوان المرحلة */
export function weekParams(week: number): WeekParams {
  const easy: Bi = { ar: "خفيف إلى متوسط: تستطيع الكلام بجمل كاملة", en: "Light to moderate: you can speak in full sentences" };
  const moderate: Bi = { ar: "متوسط: تستطيع الكلام بجمل قصيرة", en: "Moderate: you can speak in short sentences" };
  switch (week) {
    case 1:
      return { mainSets: 2, accSets: 1, coreSets: 2, repsMin: 12, repsMax: 15, rpe: "5", mainRest: 90, accRest: 75, cardioMinutes: 10, cardioIntensity: easy, focus: { ar: "أسبوع التعرف: سجّل ضبط كل جهاز (رقم المقعد/الوسادة) واختر أوزانًا خفيفة جدًا. المجموعة الواحدة للتمارين المساعدة مقصودة.", en: "Getting-to-know week: note each machine's settings (seat/pad numbers) and pick very light weights. The single set on accessories is intentional." } };
    case 2:
      return { mainSets: 2, accSets: 2, coreSets: 2, repsMin: 12, repsMax: 15, rpe: "5", mainRest: 90, accRest: 75, cardioMinutes: 10, cardioIntensity: easy, focus: { ar: "ثبّت نفس الأوزان وركّز على البطء في النزول (3 ثوانٍ).", en: "Keep the same weights and focus on a slow lowering phase (3 seconds)." } };
    case 3:
      return { mainSets: 2, accSets: 2, coreSets: 2, repsMin: 12, repsMax: 15, rpe: "5-6", mainRest: 90, accRest: 75, cardioMinutes: 12, cardioIntensity: easy, focus: { ar: "إذا كانت 15 تكرارًا سهلة جدًا (RPE ≤ 5) جرّب أصغر زيادة في وزن تمرين واحد فقط.", en: "If 15 reps feel very easy (RPE ≤ 5), try the smallest weight increase on one exercise only." } };
    case 4:
      return { mainSets: 2, accSets: 2, coreSets: 2, repsMin: 12, repsMax: 15, rpe: "6", mainRest: 90, accRest: 75, cardioMinutes: 12, cardioIntensity: easy, focus: { ar: "نهاية المرحلة الأولى: سجّل وزنك وقياساتك وراجع سجل الألم.", en: "End of phase 1: record your weight and measurements and review your pain log." } };
    case 5:
      return { mainSets: 2, accSets: 2, coreSets: 2, repsMin: 12, repsMax: 15, rpe: "6", mainRest: 90, accRest: 75, cardioMinutes: 15, cardioIntensity: easy, focus: { ar: "تمارين جديدة في المرحلة 2: ابدأها بوزن خفيف لتعلم الضبط.", en: "New exercises in phase 2: start them light to learn the setup." } };
    case 6:
      return { mainSets: 3, accSets: 2, coreSets: 2, repsMin: 12, repsMax: 15, rpe: "6", mainRest: 90, accRest: 75, cardioMinutes: 15, cardioIntensity: easy, focus: { ar: "مجموعة ثالثة للتمارين الأساسية. إذا زاد الألم أو التعب ارجع لمجموعتين.", en: "Third set for the main lifts. If pain or fatigue increase, go back to two sets." } };
    case 7:
      return { mainSets: 3, accSets: 2, coreSets: 2, repsMin: 10, repsMax: 15, rpe: "6", mainRest: 90, accRest: 75, cardioMinutes: 18, cardioIntensity: easy, focus: { ar: "استمر على نفس الحجم وراقب التعافي في اليوم التالي.", en: "Stay at the same volume and watch your recovery the next day." } };
    case 8:
      return { mainSets: 3, accSets: 3, coreSets: 2, repsMin: 10, repsMax: 15, rpe: "6-7", mainRest: 90, accRest: 75, cardioMinutes: 20, cardioIntensity: easy, focus: { ar: "أعلى حجم في المرحلة 2. لا تضف وزنًا إذا ساءت التقنية.", en: "Highest volume of phase 2. Don't add weight if your technique slips." } };
    case 9:
      return { mainSets: 2, accSets: 1, coreSets: 1, repsMin: 10, repsMax: 12, rpe: "5", mainRest: 90, accRest: 60, cardioMinutes: 15, cardioIntensity: easy, focus: { ar: "أسبوع تخفيف: نفس الأوزان تقريبًا بمجموعات أقل. هدفه التعافي وليس الإنجاز.", en: "Deload week: roughly the same weights with fewer sets. The goal is recovery, not performance." } };
    case 10:
      return { mainSets: 3, accSets: 2, coreSets: 2, repsMin: 10, repsMax: 12, rpe: "6", mainRest: 90, accRest: 75, cardioMinutes: 20, cardioIntensity: easy, focus: { ar: "تمارين دمبلز جديدة: ابدأ بوزن تستطيع التحكم فيه بالكامل.", en: "New dumbbell exercises: start with a weight you fully control." } };
    case 11:
      return { mainSets: 3, accSets: 3, coreSets: 2, repsMin: 10, repsMax: 12, rpe: "6-7", mainRest: 90, accRest: 75, cardioMinutes: 20, cardioIntensity: easy, focus: { ar: "طبّق قاعدة الحد الأعلى (12 تكرارًا في كل المجموعات) قبل أي زيادة.", en: "Apply the top-of-range rule (12 reps on every set) before any increase." } };
    case 12:
      return { mainSets: 3, accSets: 3, coreSets: 2, repsMin: 10, repsMax: 12, rpe: "7", mainRest: 90, accRest: 75, cardioMinutes: 20, cardioIntensity: moderate, focus: { ar: "يمكن رفع شدة الكارديو قليلًا إذا كان الضغط منتظمًا ولا توجد أعراض.", en: "You may raise cardio intensity a little if your blood pressure is stable and you have no symptoms." } };
    case 13:
      return { mainSets: 3, accSets: 3, coreSets: 2, repsMin: 10, repsMax: 12, rpe: "7", mainRest: 90, accRest: 75, cardioMinutes: 20, cardioIntensity: moderate, focus: { ar: "نهاية المرحلة 3: قارن أوزانك بالأسبوع 10 وسجل القياسات.", en: "End of phase 3: compare your weights with week 10 and record measurements." } };
    case 14:
      return { mainSets: 3, accSets: 2, coreSets: 2, repsMin: 8, repsMax: 12, rpe: "6-7", mainRest: 120, accRest: 75, cardioMinutes: 20, cardioIntensity: moderate, focus: { ar: "تمرين سابع في كل حصة. راحة أطول للتمارين الأساسية.", en: "A seventh exercise in each session. Longer rest for the main lifts." } };
    case 15:
      return { mainSets: 3, accSets: 3, coreSets: 2, repsMin: 8, repsMax: 12, rpe: "7", mainRest: 120, accRest: 75, cardioMinutes: 22, cardioIntensity: moderate, focus: { ar: "حافظ على التنفس المنتظم مع الأوزان الأثقل؛ لا تحبس النفس.", en: "Keep breathing steadily with heavier weights; don't hold your breath." } };
    case 16:
      return { mainSets: 3, accSets: 3, coreSets: 2, repsMin: 8, repsMax: 12, rpe: "7", mainRest: 120, accRest: 75, cardioMinutes: 25, cardioIntensity: moderate, focus: { ar: "راجع سجل الألم: إذا تكرر ألم الركبة في تمرين معين استخدم بديله.", en: "Review your pain log: if a specific exercise keeps bothering your knee, use its alternative." } };
    case 17:
      return { mainSets: 3, accSets: 3, coreSets: 3, repsMin: 8, repsMax: 12, rpe: "7", mainRest: 120, accRest: 75, cardioMinutes: 25, cardioIntensity: moderate, focus: { ar: "أعلى حجم في المرحلة 4. أسبوع التخفيف قادم.", en: "Highest volume of phase 4. A deload week is coming." } };
    case 18:
      return { mainSets: 2, accSets: 2, coreSets: 1, repsMin: 8, repsMax: 10, rpe: "5-6", mainRest: 90, accRest: 60, cardioMinutes: 18, cardioIntensity: easy, focus: { ar: "أسبوع تخفيف: مجموعات أقل وجهد أخف. سجل قياساتك.", en: "Deload week: fewer sets and lighter effort. Record your measurements." } };
    case 19:
      return { mainSets: 3, accSets: 3, coreSets: 2, repsMin: 8, repsMax: 12, rpe: "7", mainRest: 120, accRest: 75, cardioMinutes: 25, cardioIntensity: moderate, focus: { ar: "تمارين جديدة في المرحلة 5: ابدأها خفيفة.", en: "New exercises in phase 5: start them light." } };
    case 20:
      return { mainSets: 3, accSets: 3, coreSets: 2, repsMin: 8, repsMax: 12, rpe: "7-8", mainRest: 120, accRest: 75, cardioMinutes: 25, cardioIntensity: moderate, focus: { ar: "جهد 8 مسموح في تمارين الأجهزة المستقرة فقط.", en: "RPE 8 is allowed on stable machine exercises only." } };
    case 21:
      return { mainSets: 3, accSets: 3, coreSets: 3, repsMin: 8, repsMax: 12, rpe: "7-8", mainRest: 120, accRest: 75, cardioMinutes: 25, cardioIntensity: moderate, focus: { ar: "انتبه للتعافي والنوم؛ قلل الحجم إذا تراكم التعب.", en: "Pay attention to recovery and sleep; reduce volume if fatigue builds up." } };
    case 22:
      return { mainSets: 3, accSets: 3, coreSets: 3, repsMin: 8, repsMax: 12, rpe: "7-8", mainRest: 120, accRest: 75, cardioMinutes: 25, cardioIntensity: moderate, focus: { ar: "نهاية المرحلة 5: قارن الأداء بالأسبوع 14.", en: "End of phase 5: compare your performance with week 14." } };
    case 23:
      return { mainSets: 3, accSets: 2, coreSets: 2, repsMin: 8, repsMax: 10, rpe: "7", mainRest: 120, accRest: 75, cardioMinutes: 25, cardioIntensity: moderate, focus: { ar: "التثبيت: نفس التمارين الأساسية التي اعتدت عليها.", en: "Consolidation: the same main exercises you're used to." } };
    case 24:
      return { mainSets: 3, accSets: 3, coreSets: 2, repsMin: 8, repsMax: 10, rpe: "7-8", mainRest: 120, accRest: 75, cardioMinutes: 25, cardioIntensity: moderate, focus: { ar: "حافظ على تقنية ممتازة؛ لا محاولات قصوى.", en: "Keep technique excellent; no max attempts." } };
    case 25:
      return { mainSets: 3, accSets: 3, coreSets: 2, repsMin: 8, repsMax: 10, rpe: "7-8", mainRest: 120, accRest: 75, cardioMinutes: 25, cardioIntensity: moderate, focus: { ar: "آخر أسبوع بحجم كامل.", en: "Last full-volume week." } };
    case 26:
    default:
      return { mainSets: 2, accSets: 2, coreSets: 1, repsMin: 8, repsMax: 10, rpe: "5-6", mainRest: 90, accRest: 60, cardioMinutes: 20, cardioIntensity: easy, focus: { ar: "أسبوع تخفيف وتقييم نهائي: سجل الوزن والقياسات وراجع التقرير الشامل.", en: "Deload and final review week: record weight and measurements and check the full report." } };
  }
}

function prescriptionFor(slot: Slot, p: WeekParams): PlannedExercise {
  const e = EXERCISE_MAP[slot.id];
  let unit: PrescriptionUnit = "reps";
  let repsMin = p.repsMin;
  let repsMax = p.repsMax;
  let sets = slot.role === "main" ? p.mainSets : slot.role === "accessory" ? p.accSets : p.coreSets;
  let rest = slot.role === "main" ? p.mainRest : slot.role === "accessory" ? p.accRest : 60;
  let note: Bi | undefined;

  switch (slot.id) {
    case "dead_bug":
    case "bird_dog":
      unit = "reps_per_side";
      repsMin = 6;
      repsMax = 10;
      break;
    case "pallof_press":
      unit = "reps_per_side";
      repsMin = 8;
      repsMax = 12;
      break;
    case "side_plank_knees":
      unit = "seconds_per_side";
      repsMin = 15;
      repsMax = 30;
      break;
    case "farmer_walk":
      unit = "meters";
      repsMin = 20;
      repsMax = 30;
      rest = 75;
      break;
    case "step_up_low":
    case "one_arm_db_row":
    case "cable_lateral_raise":
      unit = "reps_per_side";
      break;
    case "seated_calf_raise":
    case "leg_press_calf_raise":
    case "hip_abduction_machine":
      repsMin = Math.max(p.repsMin, 12);
      repsMax = Math.max(p.repsMax, 15);
      break;
  }
  if (slot.role === "core" && unit === "reps") rest = 60;
  if (e.kneeLoad !== "low") note = { ar: "راقب الركبة: قلل المدى أو الوزن إذا زاد الألم.", en: "Watch your knee: shorten the range or reduce the weight if pain increases." };
  sets = Math.max(1, sets);
  return { exerciseId: slot.id, sets, repsMin, repsMax, unit, restSec: rest, rpe: p.rpe, note };
}

function estimateMinutes(exercises: PlannedExercise[], warmup: number, cardio: number): number {
  let sec = 0;
  for (const e of exercises) {
    const workPerSet = e.unit === "seconds_per_side" ? e.repsMax * 2 + 15 : e.unit === "meters" ? 40 : 45;
    sec += e.sets * workPerSet + Math.max(0, e.sets - 1) * e.restSec + 90; // 90 ثانية للانتقال والضبط
  }
  return Math.round(warmup + sec / 60 + cardio + 5);
}

function targetMusclesOf(slots: Slot[]): MuscleGroup[] {
  const set = new Set<MuscleGroup>();
  for (const s of slots) EXERCISE_MAP[s.id].primaryMuscles.forEach((mm) => set.add(mm));
  return [...set];
}

function safetyNotesFor(exercises: PlannedExercise[]): Bi[] {
  const notes = new Map<string, Bi>([
    ["bp", { ar: "خذ دواء الضغط كما وصفه الطبيب ولا تتمرن إذا شعرت بأعراض غير معتادة.", en: "Take your blood-pressure medication as prescribed and don't train if you feel unusual symptoms." }],
    ["pain", { ar: "توقف عن أي حركة تزيد الألم بشكل واضح أثناء التمرين أو بعده.", en: "Stop any movement that clearly increases pain during or after training." }],
  ]);
  for (const pe of exercises) {
    const e = EXERCISE_MAP[pe.exerciseId];
    if (e.kneeLoad !== "low") notes.set("knee", { ar: "تمارين بها حمل على الركبة: استخدم مدى حركة مريحًا ولا تكمل مع ألم حاد.", en: "Exercises with knee load: use a comfortable range and don't continue through sharp pain." });
    if (e.backLoad !== "low") notes.set("back", { ar: "تمارين بها حمل على الظهر: حافظ على وضع محايد واستخدم وزنًا متحكمًا فيه.", en: "Exercises with back load: keep a neutral spine and use a weight you control." });
    if (e.bpCaution) notes.set("breath", { ar: "لا تحبس النفس، وانهض ببطء بعد الاستلقاء أو الجلوس على الأرض.", en: "Don't hold your breath, and get up slowly after lying or sitting on the floor." });
  }
  return [...notes.values()];
}

export function buildSession(week: number, slotIdx: number): PlannedSession {
  const slot: SessionSlot = (["A", "B", "C"] as const)[slotIdx];
  const phase = phaseForWeek(week);
  const p = weekParams(week);
  const slots = TEMPLATES[phase.number][slot];
  const exercises = slots.map((s) => prescriptionFor(s, p));
  const warmupMinutes = 8;
  const cardio: CardioPlan = { exerciseId: CARDIO_BY_SLOT[slot], minutes: p.cardioMinutes, intensity: p.cardioIntensity };
  return {
    id: sessionId(week, slot),
    week,
    phase: phase.number,
    slot,
    index: (week - 1) * SESSIONS_PER_WEEK + slotIdx,
    name: SESSION_NAMES[slot],
    targetMuscles: targetMusclesOf(slots),
    warmup: {
      minutes: warmupMinutes,
      cardioExerciseId: slot === "B" ? "recumbent_bike" : "treadmill_walk",
      mobility: WARMUP_BY_SLOT[slot].map((id) => WARMUP_MAP[id].name),
      moves: WARMUP_BY_SLOT[slot],
    },
    exercises,
    cardio,
    cooldown: COOLDOWN,
    estimatedMinutes: estimateMinutes(exercises, warmupMinutes, cardio.minutes),
    weekFocus: p.focus,
    isDeload: DELOAD_WEEKS.includes(week),
    safetyNotes: safetyNotesFor(exercises),
  };
}

export function sessionId(week: number, slot: SessionSlot): string {
  return `w${String(week).padStart(2, "0")}-${slot}`;
}

let cached: PlannedSession[] | null = null;
export function allSessions(): PlannedSession[] {
  if (!cached) {
    cached = [];
    for (let w = 1; w <= PROGRAM_WEEKS; w++) for (let s = 0; s < SESSIONS_PER_WEEK; s++) cached.push(buildSession(w, s));
  }
  return cached;
}

export function getSession(id: string): PlannedSession | undefined {
  return allSessions().find((s) => s.id === id);
}
