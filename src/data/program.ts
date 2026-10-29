import type { CardioPlan, MuscleGroup, Phase, PlannedExercise, PlannedSession, PrescriptionUnit } from "@/lib/types";
import { EXERCISE_MAP } from "./exercises";

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
    nameAr: "المرحلة 1: التأقلم وتعلّم الحركة",
    weeks: [1, 2, 3, 4],
    goal: "تعلّم ضبط الأجهزة والأداء الصحيح، وبناء عادة الحضور 3 مرات أسبوعيًا بجهد خفيف.",
    progressionRule:
      "لا ترفع الوزن في هذه المرحلة إلا إذا أكملت كل التكرارات بسهولة (RPE ≤ 5) دون أي زيادة في ألم الركبة أو الظهر في اليوم التالي.",
  },
  {
    number: 2,
    nameAr: "المرحلة 2: بناء الأساس",
    weeks: [5, 6, 7, 8, 9],
    goal: "زيادة تدريجية في عدد المجموعات مع الحفاظ على التقنية. الأسبوع 9 أسبوع تخفيف.",
    progressionRule:
      "أضف مجموعة ثالثة للتمارين الأساسية فقط إذا كان التعافي جيدًا ولم يزد الألم. زيادة الوزن صغيرة (أصغر خطوة في الجهاز) وبعد إكمال الحد الأعلى للتكرارات مرتين متتاليتين.",
  },
  {
    number: 3,
    nameAr: "المرحلة 3: القوة الأساسية",
    weeks: [10, 11, 12, 13],
    goal: "3 مجموعات ثابتة بتكرارات 10-12 وجهد متوسط، وإدخال تمارين دمبلز مع سند.",
    progressionRule:
      "قاعدة الحد الأعلى: إذا أكملت 12 تكرارًا في كل المجموعات بجهد ≤ 7 ومن دون ألم إضافي، يمكنك تجربة أصغر زيادة في الوزن في الحصة التالية.",
  },
  {
    number: 4,
    nameAr: "المرحلة 4: التطوير",
    weeks: [14, 15, 16, 17, 18],
    goal: "نطاق تكرارات 8-12 وجهد 7، إضافة تمرين سابع. الأسبوع 18 أسبوع تخفيف.",
    progressionRule:
      "ارفع الوزن فقط عند تحقيق 12 تكرارًا في كل المجموعات. إذا ظهر ألم في الركبة أو الظهر يزيد عن المعتاد، ثبّت الوزن أو قلله واستخدم بديلًا مناسبًا.",
  },
  {
    number: 5,
    nameAr: "المرحلة 5: البناء المتقدم للمبتدئ",
    weeks: [19, 20, 21, 22],
    goal: "أعلى حجم تدريبي في البرنامج مع جهد 7-8 للتمارين المستقرة على الأجهزة فقط.",
    progressionRule:
      "الجهد 8 مسموح فقط في تمارين الأجهزة المستقرة. لا جهد عالٍ في تمارين الركبة إذا كانت حساسة. التعافي أهم من الرقم.",
  },
  {
    number: 6,
    nameAr: "المرحلة 6: التثبيت والتقييم",
    weeks: [23, 24, 25, 26],
    goal: "تثبيت المكتسبات ومقارنة الأداء بالبداية. الأسبوع 26 أسبوع تخفيف وإعادة قياس.",
    progressionRule: "حافظ على الأوزان التي تؤديها بتقنية ممتازة. سجّل القياسات النهائية في الأسبوع 26.",
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

const SESSION_NAMES: Record<SessionSlot, string> = {
  A: "الحصة A: أرجل (دفع) + صدر + ظهر",
  B: "الحصة B: سحب علوي + كتف + خلفية الفخذ",
  C: "الحصة C: جسم كامل + ثبات الجذع",
};

const CARDIO_BY_SLOT: Record<SessionSlot, string> = {
  A: "treadmill_walk",
  B: "recumbent_bike",
  C: "elliptical",
};

const WARMUP_MOBILITY: Record<SessionSlot, string[]> = {
  A: ["دوائر الورك 10 لكل جهة", "دوائر الذراعين للأمام والخلف 10", "قط وجمل (Cat-Camel) ببطء 8 مرات", "جلوس ووقوف على بنش مرتفع 8 مرات بدون وزن"],
  B: ["دوائر الكتف 10", "سحب كابل خفيف جدًا 15 تكرار", "قط وجمل ببطء 8 مرات", "جسر مؤخرة 8 مرات"],
  C: ["دوائر الورك والكاحل 10 لكل جهة", "ضغط مائل على الحائط 10", "دوران الصدر جانبيًا 6 لكل جهة", "جلوس ووقوف على بنش 8 مرات"],
};

const COOLDOWN = [
  "مشي هادئ 3-5 دقائق حتى يهدأ التنفس",
  "إطالة خفيفة للفخذ الأمامية والخلفية والصدر 20-30 ثانية لكل منها دون ألم",
  "انهض ببطء من أي وضع جلوس أو استلقاء",
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
  cardioIntensity: string;
  focus: string;
}

/** معاملات كل أسبوع على حدة: خطة فعلية لكل أسبوع وليست تكرارًا لعنوان المرحلة */
export function weekParams(week: number): WeekParams {
  const easy = "خفيف إلى متوسط: تستطيع الكلام بجمل كاملة";
  const moderate = "متوسط: تستطيع الكلام بجمل قصيرة";
  switch (week) {
    case 1:
      return { mainSets: 2, accSets: 1, coreSets: 2, repsMin: 12, repsMax: 15, rpe: "5", mainRest: 90, accRest: 75, cardioMinutes: 10, cardioIntensity: easy, focus: "أسبوع التعرف: سجّل ضبط كل جهاز (رقم المقعد/الوسادة) واختر أوزانًا خفيفة جدًا. المجموعة الواحدة للتمارين المساعدة مقصودة." };
    case 2:
      return { mainSets: 2, accSets: 2, coreSets: 2, repsMin: 12, repsMax: 15, rpe: "5", mainRest: 90, accRest: 75, cardioMinutes: 10, cardioIntensity: easy, focus: "ثبّت نفس الأوزان وركّز على البطء في النزول (3 ثوانٍ)." };
    case 3:
      return { mainSets: 2, accSets: 2, coreSets: 2, repsMin: 12, repsMax: 15, rpe: "5-6", mainRest: 90, accRest: 75, cardioMinutes: 12, cardioIntensity: easy, focus: "إذا كانت 15 تكرارًا سهلة جدًا (RPE ≤ 5) جرّب أصغر زيادة في وزن تمرين واحد فقط." };
    case 4:
      return { mainSets: 2, accSets: 2, coreSets: 2, repsMin: 12, repsMax: 15, rpe: "6", mainRest: 90, accRest: 75, cardioMinutes: 12, cardioIntensity: easy, focus: "نهاية المرحلة الأولى: سجّل وزنك وقياساتك وراجع سجل الألم." };
    case 5:
      return { mainSets: 2, accSets: 2, coreSets: 2, repsMin: 12, repsMax: 15, rpe: "6", mainRest: 90, accRest: 75, cardioMinutes: 15, cardioIntensity: easy, focus: "تمارين جديدة في المرحلة 2: ابدأها بوزن خفيف لتعلم الضبط." };
    case 6:
      return { mainSets: 3, accSets: 2, coreSets: 2, repsMin: 12, repsMax: 15, rpe: "6", mainRest: 90, accRest: 75, cardioMinutes: 15, cardioIntensity: easy, focus: "مجموعة ثالثة للتمارين الأساسية. إذا زاد الألم أو التعب ارجع لمجموعتين." };
    case 7:
      return { mainSets: 3, accSets: 2, coreSets: 2, repsMin: 10, repsMax: 15, rpe: "6", mainRest: 90, accRest: 75, cardioMinutes: 18, cardioIntensity: easy, focus: "استمر على نفس الحجم وراقب التعافي في اليوم التالي." };
    case 8:
      return { mainSets: 3, accSets: 3, coreSets: 2, repsMin: 10, repsMax: 15, rpe: "6-7", mainRest: 90, accRest: 75, cardioMinutes: 20, cardioIntensity: easy, focus: "أعلى حجم في المرحلة 2. لا تضف وزنًا إذا ساءت التقنية." };
    case 9:
      return { mainSets: 2, accSets: 1, coreSets: 1, repsMin: 10, repsMax: 12, rpe: "5", mainRest: 90, accRest: 60, cardioMinutes: 15, cardioIntensity: easy, focus: "أسبوع تخفيف: نفس الأوزان تقريبًا بمجموعات أقل. هدفه التعافي وليس الإنجاز." };
    case 10:
      return { mainSets: 3, accSets: 2, coreSets: 2, repsMin: 10, repsMax: 12, rpe: "6", mainRest: 90, accRest: 75, cardioMinutes: 20, cardioIntensity: easy, focus: "تمارين دمبلز جديدة: ابدأ بوزن تستطيع التحكم فيه بالكامل." };
    case 11:
      return { mainSets: 3, accSets: 3, coreSets: 2, repsMin: 10, repsMax: 12, rpe: "6-7", mainRest: 90, accRest: 75, cardioMinutes: 20, cardioIntensity: easy, focus: "طبّق قاعدة الحد الأعلى (12 تكرارًا في كل المجموعات) قبل أي زيادة." };
    case 12:
      return { mainSets: 3, accSets: 3, coreSets: 2, repsMin: 10, repsMax: 12, rpe: "7", mainRest: 90, accRest: 75, cardioMinutes: 20, cardioIntensity: moderate, focus: "يمكن رفع شدة الكارديو قليلًا إذا كان الضغط منتظمًا ولا توجد أعراض." };
    case 13:
      return { mainSets: 3, accSets: 3, coreSets: 2, repsMin: 10, repsMax: 12, rpe: "7", mainRest: 90, accRest: 75, cardioMinutes: 20, cardioIntensity: moderate, focus: "نهاية المرحلة 3: قارن أوزانك بالأسبوع 10 وسجل القياسات." };
    case 14:
      return { mainSets: 3, accSets: 2, coreSets: 2, repsMin: 8, repsMax: 12, rpe: "6-7", mainRest: 120, accRest: 75, cardioMinutes: 20, cardioIntensity: moderate, focus: "تمرين سابع في كل حصة. راحة أطول للتمارين الأساسية." };
    case 15:
      return { mainSets: 3, accSets: 3, coreSets: 2, repsMin: 8, repsMax: 12, rpe: "7", mainRest: 120, accRest: 75, cardioMinutes: 22, cardioIntensity: moderate, focus: "حافظ على التنفس المنتظم مع الأوزان الأثقل؛ لا تحبس النفس." };
    case 16:
      return { mainSets: 3, accSets: 3, coreSets: 2, repsMin: 8, repsMax: 12, rpe: "7", mainRest: 120, accRest: 75, cardioMinutes: 25, cardioIntensity: moderate, focus: "راجع سجل الألم: إذا تكرر ألم الركبة في تمرين معين استخدم بديله." };
    case 17:
      return { mainSets: 3, accSets: 3, coreSets: 3, repsMin: 8, repsMax: 12, rpe: "7", mainRest: 120, accRest: 75, cardioMinutes: 25, cardioIntensity: moderate, focus: "أعلى حجم في المرحلة 4. أسبوع التخفيف قادم." };
    case 18:
      return { mainSets: 2, accSets: 2, coreSets: 1, repsMin: 8, repsMax: 10, rpe: "5-6", mainRest: 90, accRest: 60, cardioMinutes: 18, cardioIntensity: easy, focus: "أسبوع تخفيف: مجموعات أقل وجهد أخف. سجل قياساتك." };
    case 19:
      return { mainSets: 3, accSets: 3, coreSets: 2, repsMin: 8, repsMax: 12, rpe: "7", mainRest: 120, accRest: 75, cardioMinutes: 25, cardioIntensity: moderate, focus: "تمارين جديدة في المرحلة 5: ابدأها خفيفة." };
    case 20:
      return { mainSets: 3, accSets: 3, coreSets: 2, repsMin: 8, repsMax: 12, rpe: "7-8", mainRest: 120, accRest: 75, cardioMinutes: 25, cardioIntensity: moderate, focus: "جهد 8 مسموح في تمارين الأجهزة المستقرة فقط." };
    case 21:
      return { mainSets: 3, accSets: 3, coreSets: 3, repsMin: 8, repsMax: 12, rpe: "7-8", mainRest: 120, accRest: 75, cardioMinutes: 25, cardioIntensity: moderate, focus: "انتبه للتعافي والنوم؛ قلل الحجم إذا تراكم التعب." };
    case 22:
      return { mainSets: 3, accSets: 3, coreSets: 3, repsMin: 8, repsMax: 12, rpe: "7-8", mainRest: 120, accRest: 75, cardioMinutes: 25, cardioIntensity: moderate, focus: "نهاية المرحلة 5: قارن الأداء بالأسبوع 14." };
    case 23:
      return { mainSets: 3, accSets: 2, coreSets: 2, repsMin: 8, repsMax: 10, rpe: "7", mainRest: 120, accRest: 75, cardioMinutes: 25, cardioIntensity: moderate, focus: "التثبيت: نفس التمارين الأساسية التي اعتدت عليها." };
    case 24:
      return { mainSets: 3, accSets: 3, coreSets: 2, repsMin: 8, repsMax: 10, rpe: "7-8", mainRest: 120, accRest: 75, cardioMinutes: 25, cardioIntensity: moderate, focus: "حافظ على تقنية ممتازة؛ لا محاولات قصوى." };
    case 25:
      return { mainSets: 3, accSets: 3, coreSets: 2, repsMin: 8, repsMax: 10, rpe: "7-8", mainRest: 120, accRest: 75, cardioMinutes: 25, cardioIntensity: moderate, focus: "آخر أسبوع بحجم كامل." };
    case 26:
    default:
      return { mainSets: 2, accSets: 2, coreSets: 1, repsMin: 8, repsMax: 10, rpe: "5-6", mainRest: 90, accRest: 60, cardioMinutes: 20, cardioIntensity: easy, focus: "أسبوع تخفيف وتقييم نهائي: سجل الوزن والقياسات وراجع التقرير الشامل." };
  }
}

function prescriptionFor(slot: Slot, p: WeekParams): PlannedExercise {
  const e = EXERCISE_MAP[slot.id];
  let unit: PrescriptionUnit = "reps";
  let repsMin = p.repsMin;
  let repsMax = p.repsMax;
  let sets = slot.role === "main" ? p.mainSets : slot.role === "accessory" ? p.accSets : p.coreSets;
  let rest = slot.role === "main" ? p.mainRest : slot.role === "accessory" ? p.accRest : 60;
  let note: string | undefined;

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
  if (e.kneeLoad !== "low") note = "راقب الركبة: قلل المدى أو الوزن إذا زاد الألم.";
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

function safetyNotesFor(exercises: PlannedExercise[]): string[] {
  const notes = new Set<string>([
    "خذ دواء الضغط كما وصفه الطبيب ولا تتمرن إذا شعرت بأعراض غير معتادة.",
    "توقف عن أي حركة تزيد الألم بشكل واضح أثناء التمرين أو بعده.",
  ]);
  for (const pe of exercises) {
    const e = EXERCISE_MAP[pe.exerciseId];
    if (e.kneeLoad !== "low") notes.add("تمارين بها حمل على الركبة: استخدم مدى حركة مريحًا ولا تكمل مع ألم حاد.");
    if (e.backLoad !== "low") notes.add("تمارين بها حمل على الظهر: حافظ على وضع محايد واستخدم وزنًا متحكمًا فيه.");
    if (e.bpCaution) notes.add("لا تحبس النفس، وانهض ببطء بعد الاستلقاء أو الجلوس على الأرض.");
  }
  return [...notes];
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
    warmup: { minutes: warmupMinutes, cardioExerciseId: slot === "B" ? "recumbent_bike" : "treadmill_walk", mobility: WARMUP_MOBILITY[slot] },
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
