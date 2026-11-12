import { BASE_T, mix, type Mark, type Pose, type Tpl, type V } from "@/components/rig/Rig";
import { EXTRA_T, WARMUP_T } from "@/components/rig/templates";
import type { Mistake, MovementPattern } from "@/lib/types";

/** All animation templates available to exercises and warm-up moves. */
export const TEMPLATES: Record<string, Tpl> = { ...BASE_T, ...EXTRA_T, ...WARMUP_T };

/** Exercise id -> animation template (male cartoon figure). */
export const EXERCISE_TEMPLATE: Record<string, string> = {
  machine_chest_press: "press_seated", incline_machine_press: "press_incline_machine", db_bench_press: "press_lying", incline_db_press: "press_incline",
  pec_deck: "press_seated", cable_fly: "press_standing", incline_pushup: "pushup_incline", smith_bench_press: "press_lying", barbell_bench_press: "press_lying",
  decline_db_press: "press_lying", med_ball_chest_pass: "press_standing",
  lat_pulldown: "pulldown", seated_cable_row: "row_cable", machine_row: "row_machine", assisted_pullup: "pullup", one_arm_db_row: "row_bent",
  chest_supported_db_row: "row_bent", straight_arm_pulldown: "straight_arm_pulldown", trx_row: "row_bent", back_extension_45: "back_ext",
  machine_shoulder_press: "press_overhead", seated_db_shoulder_press: "press_overhead", db_lateral_raise: "raise_front", cable_lateral_raise: "raise_front",
  machine_lateral_raise: "raise_front", reverse_pec_deck: "raise_front", band_pull_apart: "raise_front", face_pull: "face_pull",
  db_curl: "biceps_seated", cable_curl: "curl", machine_preacher_curl: "biceps_seated", hammer_curl: "curl", ez_bar_curl: "curl",
  cable_pushdown: "pushdown", overhead_cable_ext: "oh_ext", triceps_machine: "pushdown", db_overhead_ext: "oh_ext",
  leg_press: "leg_press", sit_to_stand: "wu_sit_to_stand", goblet_box_squat: "squat_goblet", step_up_low: "step_up_low", leg_extension: "leg_ext",
  hack_squat: "squat_bar", barbell_back_squat: "squat_bar", walking_lunge: "lunge",
  seated_leg_curl: "curl_seated", lying_leg_curl: "curl_lying", ball_hamstring_curl: "bridge", db_romanian_deadlift: "rdl", cable_pull_through: "rdl",
  glute_bridge: "bridge", hip_thrust_machine: "hip_thrust", hip_abduction_machine: "hip_abduction", hip_adduction_machine: "hip_abduction", band_lateral_walk: "wu_side_steps",
  seated_calf_raise: "calf", standing_calf_machine: "calf", leg_press_calf_raise: "calf_on_leg_press", standing_calf_raise_bw: "calf",
  dead_bug: "dead_bug", bird_dog: "bird_dog", pallof_press: "pallof", side_plank_knees: "side_plank", incline_plank: "plank", cable_crunch: "cable_crunch",
  farmer_walk: "farmer_walk", kettlebell_suitcase_carry: "farmer_walk",
  treadmill_walk: "walk", recumbent_bike: "bike", upright_bike: "bike", elliptical: "elliptical", rowing_machine: "rower", stair_climber: "stairs", foam_roll_quads: "plank"
};

const BY_PATTERN: Partial<Record<MovementPattern, string>> = {
  horizontal_push: "press_seated", incline_push: "press_incline", chest_fly: "press_seated", vertical_pull: "pulldown", horizontal_pull: "row_machine",
  vertical_push: "press_overhead", lateral_raise: "raise_front", rear_delt: "face_pull", elbow_flexion: "curl", elbow_extension: "pushdown",
  squat: "squat_goblet", hinge: "rdl", knee_flexion: "curl_seated", hip_extension: "bridge", calf_raise: "calf", cardio: "walk"
};

export function templateIdFor(id: string, pattern?: MovementPattern): string | null {
  return EXERCISE_TEMPLATE[id] || (pattern && BY_PATTERN[pattern]) || (TEMPLATES[id] ? id : null);
}

// ---------- wrong-vs-correct ----------
const shrug = (p: Pose): Pose => ({ ...p, shrug: 14 });
const lean = (deg: number) => (p: Pose): Pose => (p.t !== undefined ? { ...p, t: p.t + deg } : p);
const lift = (dy: number) => (p: Pose): Pose => ({ ...p, hip: [p.hip[0], p.hip[1] + dy] as V });
const both = (t: Tpl, f: (p: Pose) => Pose): Tpl => ({ ...t, a: f(t.a), b: f(t.b), cycle: undefined, hold: false });

export interface Comparison { mistakeIndex: number; mark: Mark; wrong: Tpl; wrongK: number; right: Tpl; rightK: number; }

interface Rule { test: RegExp; build: (t: Tpl, id: string) => { mark: Mark; wrong: Tpl; wrongK: number; rightK: number } | null }
const RULES: Rule[] = [
  { test: /shrug/i, build: (t) => ({ mark: "shoulder", wrong: both(t, shrug), wrongK: 0.6, rightK: 0.6 }) },
  { test: /seat too low|seat at the wrong height/i, build: (t) => t.a.t !== undefined && Math.abs((t.a.t ?? 180) - 180) < 15 ? ({ mark: "hands", wrong: both(t, (p) => ({ ...lift(16)(p), hands: p.hands.map((h) => ("rel" in h ? { rel: [h.rel[0], h.rel[1] - 16] as V } : h)) as Pose["hands"] })), wrongK: 0.3, rightK: 0.3 }) : null },
  { test: /back leaving the pad|chest off the (pad|bench)|leaning forward too much|leaning over/i, build: (t) => ({ mark: "back", wrong: both(t, lean(-22)), wrongK: 0.7, rightK: 0.7 }) },
  { test: /arching|leaning back|swinging back|leaning away|rocking the torso/i, build: (t, id) => /press|ext|shoulder|curl|pulldown|row|face|raise|fly/.test(id) && t.view !== "front" ? ({ mark: "back", wrong: both(t, lean(16)), wrongK: 0.8, rightK: 0.8 }) : null },
  { test: /locked|locking|snapping/i, build: (t) => ({ mark: /knee/i.test(JSON.stringify(t.props)) ? "knee" : "elbow", wrong: t, wrongK: 1.22, rightK: 1 }) },
  { test: /too deep|too far|far below|hips roll up|behind the (body|shoulders)|lowering too deep/i, build: (t) => ({ mark: t.props.includes("legPressSeat") ? "hips" : "shoulder", wrong: t, wrongK: -0.35, rightK: 0 }) },
  { test: /above shoulder/i, build: (t) => ({ mark: "hands", wrong: t, wrongK: 1.45, rightK: 1 }) },
  { test: /hips sagging|hips dropping/i, build: (t) => ({ mark: "hips", wrong: both(t, lift(12)), wrongK: 0.5, rightK: 0.5 }) },
  { test: /lifting the hips|hips off the seat|piking/i, build: (t) => ({ mark: "hips", wrong: both(t, lift(-9)), wrongK: 0.6, rightK: 0.6 }) },
  { test: /pressing forward instead of up/i, build: (t) => ({ mark: "hands", wrong: { ...t, b: { ...t.b, hands: t.b.hands.map((h) => ("rel" in h ? { rel: [h.rel[0] + 22, h.rel[1] + 8] as V } : h)) as Pose["hands"] } }, wrongK: 1, rightK: 1 }) },
  { test: /elbows drifting forward|moving the elbows|elbows moving/i, build: (t) => ({ mark: "elbow", wrong: { ...t, b: { ...t.b, hands: t.b.hands.map((h) => ("rel" in h ? { rel: [h.rel[0] + 18, h.rel[1] - 10] as V } : h)) as Pose["hands"] } }, wrongK: 1, rightK: 1 }) },
  { test: /bench angle too steep/i, build: (t) => ({ mark: "back", wrong: both(t, lean(-28)), wrongK: 0.6, rightK: 0.6 }) },
  { test: /leaning far forward/i, build: (t) => ({ mark: "back", wrong: both(t, lean(-24)), wrongK: 0.5, rightK: 0.5 }) },
  { test: /half reps/i, build: (t) => ({ mark: t.props.includes("calfPad") ? "knee" : "hands", wrong: t, wrongK: 0.45, rightK: 1 }) },
  { test: /over-arching at the top/i, build: (t) => ({ mark: "back", wrong: t, wrongK: 1.35, rightK: 1 }) }
];

/**
 * Builds visual wrong-vs-correct pairs for an exercise's drawable mistakes (max 3).
 * Non-visual mistakes (tempo, weight, breathing, knee caving seen only from the front) stay text-only.
 */
export function comparisonsFor(id: string, pattern: MovementPattern | undefined, mistakes: Mistake[], max = 3): Comparison[] {
  const tid = templateIdFor(id, pattern);
  const t = tid ? TEMPLATES[tid] : null;
  if (!t || t.cycle) return [];
  const out: Comparison[] = [];
  mistakes.forEach((m, i) => {
    if (out.length >= max || m.cat === "breathing" || m.cat === "tempo") return;
    const title = typeof m.title === "string" ? m.title : m.title.en;
    let built: ReturnType<Rule["build"]> = null;
    for (const r of RULES) { if (r.test.test(title)) { built = r.build(t, id); if (built) break; } }
    if (built) out.push({ mistakeIndex: i, mark: built.mark, wrong: built.wrong, wrongK: built.wrongK, right: t, rightK: built.rightK });
  });
  return out;
}

export { mix };
