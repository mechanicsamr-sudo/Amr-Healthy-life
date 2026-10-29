import { describe, expect, it } from "vitest";
import { EXERCISE_MAP, EXERCISES } from "@/data/exercises";
import { DEFAULT_SETTINGS } from "@/lib/db";
import { evaluateCandidate, muscleSimilarity, primaryAlternatives, rankAlternatives, type SubstitutionContext } from "@/lib/substitution";

const ctx: SubstitutionContext = { equipment: {}, level: "beginner", conditions: DEFAULT_SETTINGS.profile.conditions };

describe("محرك البدائل", () => {
  it("التشابه العضلي متماثل وصفر للتمارين غير المرتبطة", () => {
    const a = EXERCISE_MAP.machine_chest_press;
    const b = EXERCISE_MAP.db_bench_press;
    expect(muscleSimilarity(a, b)).toBe(1);
    expect(muscleSimilarity(a, EXERCISE_MAP.seated_calf_raise)).toBe(0);
  });
  it("البديلان الأول والثاني لضغط الصدر من نفس العضلات", () => {
    const alts = primaryAlternatives(EXERCISE_MAP.machine_chest_press, EXERCISE_MAP, ctx);
    expect(alts).toHaveLength(2);
    for (const c of alts) expect(c.exercise.primaryMuscles).toContain("chest");
  });
  it("الترتيب يبدأ بالأعلى تشابهًا ويستبعد ما يحتاج مراجعة", () => {
    const r = rankAlternatives(EXERCISE_MAP.leg_press, EXERCISES, ctx);
    expect(r.suggested[0].similarity).toBeGreaterThanOrEqual(r.suggested[r.suggested.length - 1].similarity);
    expect(r.suggested.some((c) => c.exercise.reviewRequired)).toBe(false);
    expect(r.needsReview.map((c) => c.exercise.id)).toContain("hack_squat");
    expect(r.suggested.every((c) => c.exercise.kind === "strength")).toBe(true);
  });
  it("توفر المعدات يغير الترتيب داخل نفس شريحة التشابه", () => {
    const base = EXERCISE_MAP.lat_pulldown;
    const withUnavailable = rankAlternatives(base, EXERCISES, { ...ctx, equipment: { assisted_pullup_machine: "unavailable" } });
    const c = withUnavailable.suggested.find((x) => x.exercise.id === "assisted_pullup")!;
    expect(c.availability).toBe("unavailable");
    expect(c.clearFit).toBe(false);
  });
  it("بديل أقل تشابهًا أو أقل توافقًا صحيًا يحتاج تأكيد المستخدم", () => {
    const c = evaluateCandidate(EXERCISE_MAP.machine_chest_press, EXERCISE_MAP.cable_fly, ctx);
    expect(c.clearFit).toBe(false);
    expect(c.unclearReasons.length).toBeGreaterThan(0);
    const good = evaluateCandidate(EXERCISE_MAP.seated_leg_curl, EXERCISE_MAP.lying_leg_curl, { ...ctx, conditions: { ...ctx.conditions, backPain: false } });
    expect(good.clearFit).toBe(true);
  });
  it("تحذيرات الركبة تظهر عند وجود الخشونة فقط", () => {
    const withKnee = evaluateCandidate(EXERCISE_MAP.leg_press, EXERCISE_MAP.step_up_low, ctx);
    expect(withKnee.healthWarnings.join(" ")).toContain("الركبة");
    const noKnee = evaluateCandidate(EXERCISE_MAP.leg_press, EXERCISE_MAP.step_up_low, { ...ctx, conditions: { ...ctx.conditions, kneeOA: false } });
    expect(noKnee.healthWarnings.join(" ")).not.toContain("الركبة");
  });
});
