// الأنواع الأساسية للتطبيق. كل البيانات تُحفظ محليًا على الجهاز.

export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "core";

export type MovementPattern =
  | "horizontal_push"
  | "incline_push"
  | "vertical_push"
  | "chest_fly"
  | "horizontal_pull"
  | "vertical_pull"
  | "straight_arm_pull"
  | "lateral_raise"
  | "rear_delt"
  | "elbow_flexion"
  | "elbow_extension"
  | "squat"
  | "step"
  | "lunge"
  | "knee_extension"
  | "knee_flexion"
  | "hinge"
  | "hip_extension"
  | "hip_abduction"
  | "hip_adduction"
  | "calf_raise"
  | "core_anti_extension"
  | "core_anti_rotation"
  | "core_lateral"
  | "core_flexion"
  | "carry"
  | "cardio";

export type EquipmentId =
  | "chest_press_machine"
  | "incline_press_machine"
  | "pec_deck_machine"
  | "cable_station"
  | "lat_pulldown_machine"
  | "seated_row_machine"
  | "assisted_pullup_machine"
  | "shoulder_press_machine"
  | "lateral_raise_machine"
  | "preacher_curl_machine"
  | "triceps_machine"
  | "leg_press_machine"
  | "hack_squat_machine"
  | "leg_extension_machine"
  | "seated_leg_curl_machine"
  | "lying_leg_curl_machine"
  | "hip_thrust_machine"
  | "hip_abduction_machine"
  | "hip_adduction_machine"
  | "seated_calf_machine"
  | "standing_calf_machine"
  | "back_extension_bench"
  | "smith_machine"
  | "barbell_rack"
  | "dumbbells"
  | "adjustable_bench"
  | "step_box"
  | "mat"
  | "treadmill"
  | "recumbent_bike"
  | "upright_bike"
  | "elliptical"
  | "rowing_machine"
  | "none";

export type Level = "beginner" | "intermediate" | "advanced";
export type Load = "low" | "moderate" | "high";
export type ExerciseKind = "strength" | "cardio";

export type ImageVerification = "verified" | "unverified" | "missing" | "user_provided";

export interface ExerciseImage {
  url: string | null;
  source: string | null;
  deviceName: string;
  verification: ImageVerification;
}

export interface Exercise {
  id: string;
  nameAr: string;
  nameEn: string;
  aliases: string[];
  kind: ExerciseKind;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  pattern: MovementPattern;
  equipment: EquipmentId[];
  level: Level;
  kneeLoad: Load;
  backLoad: Load;
  /** حركة قد تشجع على حبس النفس أو تغيير وضع الرأس/الجسم بسرعة */
  bpCaution: boolean;
  /** إذا كان التمرين يحتاج مراجعة متخصص قبل اعتماده لهذا المستخدم، يُذكر السبب هنا */
  reviewRequired?: string;
  setup: string[];
  steps: string[];
  mistakes: string[];
  breathing: string;
  precautions: string[];
  /** إرشاد افتراضي للمجموعات والتكرارات في الدليل */
  guideline: string;
  image: ExerciseImage;
  /** بدائل منتقاة يدويًا بالترتيب (الأول ثم الثاني) */
  alternatives: string[];
  custom?: boolean;
  /** بيانات تجريبية أثناء التطوير؟ */
  demo?: boolean;
}

export type PrescriptionUnit = "reps" | "reps_per_side" | "seconds" | "seconds_per_side" | "meters";

export interface PlannedExercise {
  exerciseId: string;
  sets: number;
  repsMin: number;
  repsMax: number;
  unit: PrescriptionUnit;
  restSec: number;
  rpe: string;
  note?: string;
}

export interface CardioPlan {
  exerciseId: string;
  minutes: number;
  intensity: string;
}

export interface PlannedSession {
  id: string; // مثل w01-A
  week: number; // 1..26
  phase: number; // 1..6
  slot: "A" | "B" | "C";
  index: number; // ترتيب الحصة في البرنامج 0..77
  name: string;
  targetMuscles: MuscleGroup[];
  warmup: { minutes: number; cardioExerciseId: string; mobility: string[] };
  exercises: PlannedExercise[];
  cardio: CardioPlan;
  cooldown: string[];
  estimatedMinutes: number;
  weekFocus: string;
  isDeload: boolean;
  safetyNotes: string[];
}

export interface Phase {
  number: number;
  nameAr: string;
  weeks: number[];
  goal: string;
  progressionRule: string;
}

// ---------- سجلات المستخدم ----------

export interface SetLog {
  weight: number | null;
  reps: number | null;
  rpe: number | null;
  done: boolean;
  ts?: number;
}

export interface ExerciseEntry {
  slotIndex: number;
  plannedExerciseId: string;
  exerciseId: string; // الفعلي (قد يكون بديلًا)
  substituted: boolean;
  substitutionReason?: string;
  sets: SetLog[];
  kneePain: number | null; // 0..10
  backPain: number | null;
  notes: string;
  skipped?: boolean;
}

export type WorkoutStatus = "in_progress" | "completed" | "abandoned";

export interface WorkoutLog {
  id: string;
  sessionId: string;
  scheduledDate: string; // YYYY-MM-DD
  date: string; // تاريخ التنفيذ الفعلي
  startedAt: number;
  updatedAt: number;
  finishedAt: number | null;
  status: WorkoutStatus;
  planSnapshot: PlannedSession;
  programVersion: string;
  currentIndex: number;
  warmupDone: boolean;
  entries: ExerciseEntry[];
  cardio: { exerciseId: string; plannedMinutes: number; minutes: number | null; done: boolean };
  painBefore: { knee: number | null; back: number | null };
  painAfter: { knee: number | null; back: number | null };
  notes: string;
  redFlagReported: boolean;
}

export interface Measurement {
  id: string;
  date: string;
  weightKg: number | null;
  waistCm: number | null;
  hipCm: number | null;
  chestCm: number | null;
  armCm: number | null;
  thighCm: number | null;
  bpSys: number | null;
  bpDia: number | null;
  restingHr: number | null;
  notes: string;
  createdAt: number;
}

export interface WellnessLog {
  id: string;
  date: string;
  kneePain: number | null;
  backPain: number | null;
  sleepQuality: number | null; // 1..5
  fatigue: number | null; // 1..5
  notes: string;
  createdAt: number;
}

export interface SessionOverride {
  sessionId: string;
  rescheduledDate?: string | null;
  skipped?: boolean;
  /** نسخة معدلة من تمارين هذه الحصة فقط. البرنامج الأساسي لا يتغير */
  exercises?: PlannedExercise[];
  note?: string;
  updatedAt: number;
}

export interface ExerciseMedia {
  exerciseId: string;
  imageUrl: string | null;
  imageDataUrl: string | null;
  source: string;
  updatedAt: number;
}

export type Availability = "available" | "unavailable" | "unknown";

export interface Profile {
  name: string;
  startWeightKg: number;
  heightCm: number;
  level: Level;
  goal: string;
  conditions: {
    kneeOA: boolean;
    kneeNote: string;
    backPain: boolean;
    backNote: string;
    bpMeds: boolean;
    bpNote: string;
    other: string;
  };
  startDate: string;
  trainingDays: number[]; // 0=الأحد .. 6=السبت
}

export interface Settings {
  profile: Profile;
  theme: "system" | "light" | "dark";
  equipment: Partial<Record<EquipmentId, Availability>>;
  defaultRestSec: number;
  sound: boolean;
  vibrate: boolean;
  safetyAcknowledgedAt: number | null;
}
