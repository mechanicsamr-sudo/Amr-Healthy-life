import { EQUIPMENT, PATTERNS } from "./labels";
import type { Availability, EquipmentId, Exercise, Level, Load, MovementPattern, MuscleGroup, Profile } from "./types";

/*
 * محرك البدائل.
 * الترتيب حسب الأولوية: (1) تشابه العضلات والحركة، (2) توفر المعدات، (3) ملاءمة المستوى، (4) التوافق مع القيود الصحية.
 * المحرك لا يستبدل أي تمرين تلقائيًا؛ يعيد ترتيبًا مع توضيح ما إذا كانت الملاءمة واضحة أم تحتاج قرار المستخدم.
 */

export interface SubstitutionContext {
  equipment: Partial<Record<EquipmentId, Availability>>;
  level: Level;
  conditions: Profile["conditions"];
}

export interface Candidate {
  exercise: Exercise;
  similarity: number; // 0..100
  muscleSimilarity: number;
  patternSimilarity: number;
  similarityLabel: string;
  availability: Availability;
  levelFit: number; // 0..2
  healthScore: number; // 0..2
  healthWarnings: string[];
  differences: string[];
  /** هل الملاءمة واضحة بما يكفي للاختيار المباشر؟ إن لم تكن، يجب أن يؤكد المستخدم */
  clearFit: boolean;
  unclearReasons: string[];
}

const PATTERN_FAMILY: Partial<Record<MovementPattern, Partial<Record<MovementPattern, number>>>> = {
  horizontal_push: { incline_push: 0.75, chest_fly: 0.5, vertical_push: 0.3 },
  incline_push: { horizontal_push: 0.75, vertical_push: 0.5, chest_fly: 0.45 },
  vertical_push: { incline_push: 0.5, horizontal_push: 0.3, lateral_raise: 0.4 },
  chest_fly: { horizontal_push: 0.5, incline_push: 0.45 },
  horizontal_pull: { vertical_pull: 0.6, rear_delt: 0.45, straight_arm_pull: 0.4 },
  vertical_pull: { horizontal_pull: 0.6, straight_arm_pull: 0.65 },
  straight_arm_pull: { vertical_pull: 0.65, horizontal_pull: 0.4 },
  lateral_raise: { vertical_push: 0.4, rear_delt: 0.3 },
  rear_delt: { horizontal_pull: 0.45, lateral_raise: 0.3 },
  squat: { step: 0.7, lunge: 0.7, knee_extension: 0.4, hip_extension: 0.3 },
  step: { squat: 0.7, lunge: 0.8 },
  lunge: { squat: 0.7, step: 0.8 },
  knee_extension: { squat: 0.4, step: 0.35 },
  knee_flexion: { hinge: 0.4, hip_extension: 0.35 },
  hinge: { hip_extension: 0.7, knee_flexion: 0.4 },
  hip_extension: { hinge: 0.7, hip_abduction: 0.35, knee_flexion: 0.35, squat: 0.3 },
  hip_abduction: { hip_extension: 0.35, hip_adduction: 0.3 },
  hip_adduction: { hip_abduction: 0.3 },
  core_anti_extension: { core_anti_rotation: 0.7, core_lateral: 0.6, carry: 0.4, core_flexion: 0.3 },
  core_anti_rotation: { core_anti_extension: 0.7, core_lateral: 0.7, carry: 0.5 },
  core_lateral: { core_anti_rotation: 0.7, core_anti_extension: 0.6, carry: 0.6 },
  core_flexion: { core_anti_extension: 0.3 },
  carry: { core_lateral: 0.6, core_anti_rotation: 0.5, core_anti_extension: 0.4 },
};

export function patternSimilarity(a: MovementPattern, b: MovementPattern): number {
  if (a === b) return 1;
  return PATTERN_FAMILY[a]?.[b] ?? PATTERN_FAMILY[b]?.[a] ?? 0;
}

function muscleWeights(e: Exercise): Map<MuscleGroup, number> {
  const w = new Map<MuscleGroup, number>();
  e.secondaryMuscles.forEach((m) => w.set(m, 1));
  e.primaryMuscles.forEach((m) => w.set(m, 2));
  return w;
}

/** تشابه جاكارد موزون: العضلات الرئيسية وزنها 2 والثانوية 1 */
export function muscleSimilarity(a: Exercise, b: Exercise): number {
  const wa = muscleWeights(a);
  const wb = muscleWeights(b);
  const keys = new Set([...wa.keys(), ...wb.keys()]);
  let min = 0;
  let max = 0;
  for (const k of keys) {
    const x = wa.get(k) ?? 0;
    const y = wb.get(k) ?? 0;
    min += Math.min(x, y);
    max += Math.max(x, y);
  }
  return max === 0 ? 0 : min / max;
}

export function similarityLabel(pct: number): string {
  if (pct >= 80) return "تشابه عالٍ";
  if (pct >= 60) return "تشابه متوسط";
  if (pct >= 40) return "تشابه جزئي";
  return "تشابه ضعيف";
}

export function equipmentAvailability(e: Exercise, eq: SubstitutionContext["equipment"]): Availability {
  let result: Availability = "available";
  for (const id of e.equipment) {
    if (id === "none") continue;
    const s = eq[id] ?? "unknown";
    if (s === "unavailable") return "unavailable";
    if (s === "unknown") result = "unknown";
  }
  return result;
}

const LOAD_RANK: Record<Load, number> = { low: 0, moderate: 1, high: 2 };
const LEVEL_RANK: Record<Level, number> = { beginner: 0, intermediate: 1, advanced: 2 };

export function levelFit(e: Exercise, userLevel: Level): number {
  const gap = LEVEL_RANK[e.level] - LEVEL_RANK[userLevel];
  return gap <= 0 ? 2 : gap === 1 ? 1 : 0;
}

/** تقييم التوافق مع القيود الصحية المسجلة. هذا تذكير وليس حكمًا طبيًا. */
export function healthAssessment(e: Exercise, conditions: Profile["conditions"]): { score: number; warnings: string[] } {
  const warnings: string[] = [];
  let score = 2;
  if (e.reviewRequired) {
    warnings.push(e.reviewRequired);
    score = 0;
  }
  if (conditions.kneeOA) {
    if (e.kneeLoad === "high") {
      warnings.push("حمل مرتفع على الركبة مع خشونة الركبة المسجلة.");
      score = Math.min(score, 0);
    } else if (e.kneeLoad === "moderate") {
      warnings.push("حمل متوسط على الركبة: استخدم مدى حركة مريحًا وراقب الألم.");
      score = Math.min(score, 1);
    }
  }
  if (conditions.backPain) {
    if (e.backLoad === "high") {
      warnings.push("حمل مرتفع على الظهر مع ألم الظهر المسجل.");
      score = Math.min(score, 0);
    } else if (e.backLoad === "moderate") {
      warnings.push("حمل متوسط على الظهر: حافظ على وضع محايد وأوقف الحركة إذا زاد الألم.");
      score = Math.min(score, 1);
    }
  }
  if (conditions.bpMeds && e.bpCaution) {
    warnings.push("تنفس بانتظام ولا تحبس النفس، وانهض ببطء (دواء الضغط).");
  }
  return { score, warnings };
}

function describeDifferences(base: Exercise, alt: Exercise): string[] {
  const d: string[] = [];
  if (base.pattern !== alt.pattern) d.push(`نمط الحركة مختلف: ${PATTERNS[alt.pattern]} بدل ${PATTERNS[base.pattern]}.`);
  const isMachine = (e: Exercise) => e.equipment.some((x) => x.endsWith("_machine"));
  const isFree = (e: Exercise) => e.equipment.includes("dumbbells") || e.equipment.includes("barbell_rack");
  if (isMachine(base) && isFree(alt)) d.push("أوزان حرة بدل جهاز: يتطلب تحكمًا وتوازنًا أكبر؛ ابدأ بوزن أخف.");
  if (isFree(base) && isMachine(alt)) d.push("جهاز بدل أوزان حرة: مسار ثابت وأسهل في التحكم، والأوزان غير قابلة للمقارنة مباشرة.");
  if (base.equipment.includes("cable_station") !== alt.equipment.includes("cable_station") && alt.equipment.includes("cable_station"))
    d.push("الكابل يعطي مقاومة ثابتة طوال الحركة.");
  const onlyBase = base.primaryMuscles.filter((m) => !alt.primaryMuscles.includes(m));
  if (onlyBase.length) d.push("لا يستهدف بنفس الدرجة بعض العضلات الرئيسية للتمرين الأصلي.");
  if (LOAD_RANK[alt.kneeLoad] > LOAD_RANK[base.kneeLoad]) d.push("حمل أعلى على الركبة من التمرين الأصلي.");
  if (LOAD_RANK[alt.backLoad] > LOAD_RANK[base.backLoad]) d.push("حمل أعلى على الظهر من التمرين الأصلي.");
  if (LOAD_RANK[alt.kneeLoad] < LOAD_RANK[base.kneeLoad]) d.push("حمل أقل على الركبة.");
  if (LOAD_RANK[alt.backLoad] < LOAD_RANK[base.backLoad]) d.push("حمل أقل على الظهر.");
  const eqNames = alt.equipment.map((x) => EQUIPMENT[x].ar).join("، ");
  d.push(`المعدات المطلوبة: ${eqNames}.`);
  return d;
}

export function evaluateCandidate(base: Exercise, alt: Exercise, ctx: SubstitutionContext): Candidate {
  const ms = muscleSimilarity(base, alt);
  const ps = patternSimilarity(base.pattern, alt.pattern);
  const similarity = Math.round((0.55 * ms + 0.45 * ps) * 100);
  const availability = equipmentAvailability(alt, ctx.equipment);
  const lf = levelFit(alt, ctx.level);
  const health = healthAssessment(alt, ctx.conditions);
  const baseHealth = healthAssessment(base, ctx.conditions);

  const unclearReasons: string[] = [];
  if (similarity < 60) unclearReasons.push("التشابه مع التمرين الأصلي أقل من المتوسط.");
  if (availability === "unavailable") unclearReasons.push("المعدات المطلوبة مسجلة كغير متوفرة.");
  if (lf < 2) unclearReasons.push("مستوى التمرين أعلى من مستواك المسجل.");
  if (health.score < baseHealth.score) unclearReasons.push("أقل توافقًا مع القيود الصحية من التمرين الأصلي.");
  if (alt.reviewRequired) unclearReasons.push("التمرين مُعلَّم بأنه يحتاج مراجعة متخصص.");

  return {
    exercise: alt,
    similarity,
    muscleSimilarity: Math.round(ms * 100),
    patternSimilarity: Math.round(ps * 100),
    similarityLabel: similarityLabel(similarity),
    availability,
    levelFit: lf,
    healthScore: health.score,
    healthWarnings: health.warnings,
    differences: describeDifferences(base, alt),
    clearFit: unclearReasons.length === 0,
    unclearReasons,
  };
}

const AVAIL_RANK: Record<Availability, number> = { available: 2, unknown: 1, unavailable: 0 };

/** مقارنة حسب الأولويات: التشابه (بشرائح 10%) ← المعدات ← المستوى ← الصحة ← التشابه الدقيق */
export function compareCandidates(a: Candidate, b: Candidate): number {
  const band = (c: Candidate) => Math.floor(c.similarity / 10);
  return (
    band(b) - band(a) ||
    AVAIL_RANK[b.availability] - AVAIL_RANK[a.availability] ||
    b.levelFit - a.levelFit ||
    b.healthScore - a.healthScore ||
    b.similarity - a.similarity ||
    a.exercise.id.localeCompare(b.exercise.id)
  );
}

export interface RankResult {
  suggested: Candidate[];
  needsReview: Candidate[];
}

export function rankAlternatives(base: Exercise, pool: Exercise[], ctx: SubstitutionContext): RankResult {
  const evaluated = pool
    .filter((e) => e.id !== base.id && e.kind === base.kind)
    .map((e) => evaluateCandidate(base, e, ctx))
    .filter((c) => c.similarity >= 25);
  const suggested = evaluated.filter((c) => !c.exercise.reviewRequired).sort(compareCandidates);
  const needsReview = evaluated.filter((c) => c.exercise.reviewRequired).sort(compareCandidates);
  return { suggested, needsReview };
}

/** البديل الأول والثاني: من القائمة المنتقاة يدويًا أولًا، ثم من المحرك إذا نقصت */
export function primaryAlternatives(base: Exercise, all: Record<string, Exercise>, ctx: SubstitutionContext): Candidate[] {
  const out: Candidate[] = [];
  for (const id of base.alternatives) {
    const e = all[id];
    if (e && !e.reviewRequired && out.length < 2) out.push(evaluateCandidate(base, e, ctx));
  }
  if (out.length < 2) {
    const ranked = rankAlternatives(base, Object.values(all), ctx).suggested;
    for (const c of ranked) {
      if (out.length >= 2) break;
      if (!out.some((o) => o.exercise.id === c.exercise.id)) out.push(c);
    }
  }
  return out;
}
