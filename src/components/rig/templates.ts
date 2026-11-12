import { BASE_T, G, type Pose, type Tpl, type V } from "./Rig";

/* Warm-up moves — knee/back friendly (no jumping, no deep knee flexion, no big spinal flexion). */
const frontStand = (hip: V, hands: Pose["hands"], feet: [V, V] = [[110, G], [130, G]]): Pose => ({ hip, t: 180, hands, feet, elbow: "down", knee: "front" });
export const WARMUP_T: Record<string, Tpl> = {
  wu_arm_circles: { view: "front", a: frontStand([120, 108], [[64, 64], [176, 64]]), b: frontStand([120, 108], [[64, 64], [176, 64]]), effort: "toB", props: [], cycle: (p) => {
    const a = p * 2 * Math.PI, r = 9;
    return frontStand([120, 108], [[66 + Math.cos(a) * r, 64 + Math.sin(a) * r], [174 - Math.cos(a) * r, 64 + Math.sin(a) * r]]);
  } },
  wu_shoulder_rolls: { view: "front", a: frontStand([120, 108], [[98, 158], [142, 158]]), b: frontStand([120, 108], [[98, 158], [142, 158]]), effort: "toB", props: [], cycle: (p) => {
    const a = p * 2 * Math.PI;
    return { ...frontStand([120, 108], [[98, 158 - Math.max(0, Math.sin(a)) * 8], [142, 158 - Math.max(0, Math.sin(a)) * 8]]), shrug: Math.max(0, Math.sin(a)) * 10 };
  } },
  wu_hip_circles: { view: "front", a: frontStand([120, 108], [[104, 112], [136, 112]], [[106, G], [134, G]]), b: frontStand([120, 108], [[104, 112], [136, 112]]), effort: "toB", props: [], cycle: (p) => {
    const a = p * 2 * Math.PI, dx = Math.cos(a) * 7, dy = Math.sin(a) * 2;
    return frontStand([120 + dx, 108 + dy], [[104 + dx, 112 + dy], [136 + dx, 112 + dy]], [[106, G], [134, G]]);
  } },
  wu_march: { a: BASE_T.walk.a, b: BASE_T.walk.b, effort: "toB", props: [], cycle: (p) => {
    const s = Math.sin(p * 2 * Math.PI);
    return { hip: [120, 105], t: 180, hands: [{ rel: [s * 14, 52] }, { rel: [-s * 14, 52] }], feet: [[124 + Math.max(0, s) * 14, G - Math.max(0, s) * 26], [118 + Math.max(0, -s) * 14, G - Math.max(0, -s) * 26]], elbow: "back", knee: "front" };
  } },
  wu_torso_twist: { view: "front", a: frontStand([120, 108], [[112, 84], [128, 84]], [[106, G], [134, G]]), b: frontStand([120, 108], [[112, 84], [128, 84]]), effort: "toB", props: [], cycle: (p) => {
    const s = Math.sin(p * 2 * Math.PI) * 14;
    return frontStand([120, 108], [[110 + s, 84], [130 + s, 84]], [[106, G], [134, G]]);
  } },
  wu_side_steps: { view: "front", a: frontStand([120, 108], [[100, 160], [140, 160]]), b: frontStand([120, 108], [[100, 160], [140, 160]]), effort: "toB", props: [], cycle: (p) => {
    const s = Math.sin(p * 2 * Math.PI), x = 120 + s * 18, lift = Math.abs(Math.cos(p * 2 * Math.PI)) < 0.3 ? 0 : 6 * Math.abs(Math.cos(p * 2 * Math.PI));
    return frontStand([x, 110], [[x - 20, 160], [x + 20, 160]], [[x - 18 + (s < 0 ? 0 : 0), G - (s > 0 ? lift : 0)], [x + 18, G - (s < 0 ? lift : 0)]]);
  } },
  wu_wall_pushup: {
    a: { hip: [124, 108], shoulderAt: [160, 66], hands: [[192, 70], [192, 72]], feet: [[100, G], [104, G]], elbow: "down", knee: "front" },
    b: { hip: [132, 112], shoulderAt: [172, 76], hands: [[192, 70], [192, 72]], feet: [[100, G], [104, G]], elbow: "down", knee: "front" },
    effort: "toA", props: ["wall"]
  },
  wu_sit_to_stand: {
    a: { hip: [104, 140], t: 160, hands: [{ rel: [30, 14] }, { rel: [32, 14] }], feet: [[136, G], [140, G]], elbow: "down", knee: "up" },
    b: { hip: [128, 104], t: 180, hands: [{ rel: [30, 14] }, { rel: [32, 14] }], feet: [[136, G], [140, G]], elbow: "down", knee: "front" },
    effort: "toB", props: ["boxSeat"]
  }
};

/* Machine Chest Press: correct form + the specific wrong variants from the content mistakes. */
const seatP = (hip: V, t: number, hands: Pose["hands"], extra: Partial<Pose> = {}): Pose => ({ hip, t, hands, feet: [[hip[0] + 40, G], [hip[0] + 36, G]], elbow: "back", knee: "up", ...extra });
const pressRight: Tpl = BASE_T.press_seated;
export const CHEST_PRESS_COMPARE: { mistake: string; mark: "elbow" | "shoulder" | "back" | "hands"; wrong: Tpl; wrongK: number; right: Tpl; rightK: number }[] = [
  { // seat too low -> handles at face height
    mistake: "Seat too low or too high", mark: "hands",
    wrong: { ...pressRight, a: seatP([100, 156], 182, [[128, 70], [130, 70]]), b: seatP([100, 156], 182, [[160, 68], [162, 68]]) }, wrongK: 0.25,
    right: pressRight, rightK: 0.25
  },
  { // back leaving the pad
    mistake: "Back leaving the pad", mark: "back",
    wrong: { ...pressRight, a: seatP([100, 140], 158, [{ rel: [14, 18] }, { rel: [12, 18] }]), b: seatP([100, 140], 158, [{ rel: [56, 8] }, { rel: [54, 8] }]) }, wrongK: 0.7,
    right: pressRight, rightK: 0.7
  },
  { // elbows snapped locked
    mistake: "Snapping the elbows locked", mark: "elbow",
    wrong: { ...pressRight, b: seatP([100, 140], 182, [{ rel: [62, 2] }, { rel: [60, 2] }]) }, wrongK: 1,
    right: pressRight, rightK: 1
  },
  { // shrugging
    mistake: "Shrugging the shoulders", mark: "shoulder",
    wrong: { ...pressRight, a: { ...pressRight.a, shrug: 14 }, b: { ...pressRight.b, shrug: 14 } }, wrongK: 0.6,
    right: pressRight, rightK: 0.6
  }
];

/* Extra templates for exercises of this program that the base set does not cover. */
const T = BASE_T;
export const EXTRA_T: Record<string, Tpl> = {
  press_incline_machine: { a: seatP([100, 140], 186, [{ rel: [14, 12] }, { rel: [12, 12] }]), b: seatP([100, 140], 186, [{ rel: [50, -16] }, { rel: [48, -16] }]), effort: "toB", props: ["seat", "backpad", "handle", "lever"] },
  straight_arm_pulldown: { a: { hip: [118, 106], t: 168, hands: [{ rel: [38, -30] }, { rel: [36, -30] }], feet: [[132, G], [104, G]], elbow: "down", knee: "front" }, b: { hip: [118, 106], t: 168, hands: [{ rel: [10, 54] }, { rel: [12, 54] }], feet: [[132, G], [104, G]], elbow: "down", knee: "front" }, effort: "toB", props: ["handle", "cableTopFront"] },
  step_up_low: { a: { hip: [122, 108], t: 178, hands: [{ rel: [2, 56] }, { rel: [4, 56] }], feet: [[150, 164], [116, G]], elbow: "down", knee: "front" }, b: { hip: [146, 94], t: 178, hands: [{ rel: [2, 56] }, { rel: [4, 56] }], feet: [[150, 164], [144, 164]], elbow: "down", knee: "front" }, effort: "toB", props: ["stepLow"] },
  hip_abduction: { view: "front", a: { hip: [120, 132], t: 180, hands: [[100, 136], [140, 136]], feet: [[112, G], [128, G]] }, b: { hip: [120, 132], t: 180, hands: [[100, 136], [140, 136]], feet: [[90, G], [150, G]] }, effort: "toB", props: ["seatFront"], label: "منظر من قدام" },
  calf_on_leg_press: { a: { hip: [104, 140], t: -128, hands: [[110, 146], [114, 146]], feet: [[172, 92], [176, 90]], elbow: "down", knee: "up" }, b: { hip: [104, 140], t: -128, hands: [[110, 146], [114, 146]], feet: [[178, 84], [182, 82]], elbow: "down", knee: "up" }, effort: "toB", props: ["legPressSeat", "platform"] },
  bird_dog: { a: { hip: [140, 140], t: -90, hands: [[90, G - 1], [94, G - 1]], feet: [[176, G - 2], [180, G - 2]], elbow: "down", knee: "down" }, b: { hip: [140, 140], t: -90, hands: [[36, 132], [94, G - 1]], feet: [[176, G - 2], [212, 138]], elbow: "down", knee: "down" }, effort: "toB", props: ["mat"] },
  farmer_walk: { a: T.walk.a, b: T.walk.b, effort: "toB", props: ["dumbbell"], cycle: (p) => {
    const s = Math.sin(p * 2 * Math.PI), c = Math.cos(p * 2 * Math.PI);
    return { hip: [120, 105 + Math.abs(c) * 2], t: 180, hands: [{ rel: [0, 56] }, { rel: [2, 56] }], feet: [[120 + s * 20, G - 3 - Math.max(0, c) * 7], [120 - s * 20, G - 3 - Math.max(0, -c) * 7]], elbow: "down", knee: "front" };
  } },
  biceps_seated: { a: seatP([110, 140], 180, [{ rel: [4, 56] }, { rel: [6, 56] }], { elbow: "back" }), b: seatP([110, 140], 180, [{ rel: [18, 8] }, { rel: [20, 8] }], { elbow: "back" }), effort: "toB", props: ["seat", "dumbbell"] },
  side_plank: { a: { hip: [136, 160], shoulderAt: [88, 150], hands: [[100, G - 1], [104, G - 1]], feet: [[176, G - 2], [180, G - 2]], elbow: "down", knee: "down" }, b: { hip: [136, 152], shoulderAt: [88, 148], hands: [[100, G - 1], [104, G - 1]], feet: [[176, G - 2], [180, G - 2]], elbow: "down", knee: "down" }, effort: "toB", hold: true, props: ["mat"] }
};
