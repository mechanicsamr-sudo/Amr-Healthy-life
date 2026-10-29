import type { EquipmentId, Level, Load, MovementPattern, MuscleGroup } from "./types";

export const MUSCLES: Record<MuscleGroup, { ar: string; en: string }> = {
  chest: { ar: "الصدر", en: "Chest" },
  back: { ar: "الظهر", en: "Back" },
  shoulders: { ar: "الكتف", en: "Shoulders" },
  biceps: { ar: "البايسبس", en: "Biceps" },
  triceps: { ar: "الترايسبس", en: "Triceps" },
  quads: { ar: "الفخذ الأمامية", en: "Quadriceps" },
  hamstrings: { ar: "الفخذ الخلفية", en: "Hamstrings" },
  glutes: { ar: "المؤخرة والورك", en: "Glutes & Hips" },
  calves: { ar: "السمانة", en: "Calves" },
  core: { ar: "البطن والجذع", en: "Core" },
};

export const MUSCLE_ORDER: MuscleGroup[] = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "quads",
  "hamstrings",
  "glutes",
  "calves",
  "core",
];

export const EQUIPMENT: Record<EquipmentId, { ar: string; en: string }> = {
  chest_press_machine: { ar: "جهاز ضغط الصدر", en: "Chest Press Machine" },
  incline_press_machine: { ar: "جهاز ضغط الصدر المائل", en: "Incline Chest Press Machine" },
  pec_deck_machine: { ar: "جهاز الفراشة", en: "Pec Deck Machine" },
  cable_station: { ar: "جهاز الكابل", en: "Cable Station" },
  lat_pulldown_machine: { ar: "جهاز السحب العالي", en: "Lat Pulldown Machine" },
  seated_row_machine: { ar: "جهاز التجديف جلوس", en: "Seated Row Machine" },
  assisted_pullup_machine: { ar: "جهاز العقلة المساعد", en: "Assisted Pull-up Machine" },
  shoulder_press_machine: { ar: "جهاز ضغط الكتف", en: "Shoulder Press Machine" },
  lateral_raise_machine: { ar: "جهاز الرفرفة الجانبية", en: "Lateral Raise Machine" },
  preacher_curl_machine: { ar: "جهاز البايسبس (بريتشر)", en: "Preacher Curl Machine" },
  triceps_machine: { ar: "جهاز الترايسبس", en: "Triceps Extension Machine" },
  leg_press_machine: { ar: "جهاز دفع الأرجل", en: "Leg Press Machine" },
  hack_squat_machine: { ar: "جهاز الهاك سكوات", en: "Hack Squat Machine" },
  leg_extension_machine: { ar: "جهاز الرجل الأمامي", en: "Leg Extension Machine" },
  seated_leg_curl_machine: { ar: "جهاز الرجل الخلفي جلوس", en: "Seated Leg Curl Machine" },
  lying_leg_curl_machine: { ar: "جهاز الرجل الخلفي نائم", en: "Lying Leg Curl Machine" },
  hip_thrust_machine: { ar: "جهاز دفع الورك", en: "Hip Thrust Machine" },
  hip_abduction_machine: { ar: "جهاز فتح الأرجل", en: "Hip Abduction Machine" },
  hip_adduction_machine: { ar: "جهاز ضم الأرجل", en: "Hip Adduction Machine" },
  seated_calf_machine: { ar: "جهاز السمانة جلوس", en: "Seated Calf Raise Machine" },
  standing_calf_machine: { ar: "جهاز السمانة وقوف", en: "Standing Calf Raise Machine" },
  back_extension_bench: { ar: "كرسي تمديد الظهر", en: "Back Extension Bench" },
  smith_machine: { ar: "جهاز سميث", en: "Smith Machine" },
  barbell_rack: { ar: "بار وحامل", en: "Barbell & Rack" },
  dumbbells: { ar: "دمبلز", en: "Dumbbells" },
  adjustable_bench: { ar: "بنش قابل للتعديل", en: "Adjustable Bench" },
  step_box: { ar: "صندوق/درجة منخفضة", en: "Low Step / Box" },
  mat: { ar: "مرتبة أرضية", en: "Exercise Mat" },
  treadmill: { ar: "مشاية كهربائية", en: "Treadmill" },
  recumbent_bike: { ar: "عجلة بمسند ظهر", en: "Recumbent Bike" },
  upright_bike: { ar: "عجلة عادية", en: "Upright Bike" },
  elliptical: { ar: "أوربتراك (إليبتكال)", en: "Elliptical Trainer" },
  rowing_machine: { ar: "جهاز التجديف", en: "Rowing Machine" },
  none: { ar: "بدون معدات", en: "No equipment" },
};

export const PATTERNS: Record<MovementPattern, string> = {
  horizontal_push: "دفع أفقي",
  incline_push: "دفع مائل",
  vertical_push: "دفع رأسي",
  chest_fly: "ضم الذراعين (فلاي)",
  horizontal_pull: "سحب أفقي",
  vertical_pull: "سحب رأسي",
  straight_arm_pull: "سحب بذراع مستقيمة",
  lateral_raise: "رفرفة جانبية",
  rear_delt: "كتف خلفي",
  elbow_flexion: "ثني الكوع",
  elbow_extension: "مد الكوع",
  squat: "قرفصاء",
  step: "صعود درجة",
  lunge: "طعن (لانج)",
  knee_extension: "مد الركبة",
  knee_flexion: "ثني الركبة",
  hinge: "انحناء من الورك",
  hip_extension: "مد الورك",
  hip_abduction: "فتح الورك",
  hip_adduction: "ضم الورك",
  calf_raise: "رفع الكعب",
  core_anti_extension: "ثبات الجذع ضد التقوس",
  core_anti_rotation: "ثبات الجذع ضد الدوران",
  core_lateral: "ثبات جانبي",
  core_flexion: "ثني الجذع",
  carry: "حمل ومشي",
  cardio: "كارديو",
};

export const LEVELS: Record<Level, string> = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم",
};

export const LOADS: Record<Load, string> = {
  low: "منخفض",
  moderate: "متوسط",
  high: "مرتفع",
};

export const WEEKDAYS_AR = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
