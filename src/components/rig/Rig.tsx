"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Animated cartoon demonstration — a 2D rigged character driven by keyframes + two-bone IK.
 * It shows the movement direction, joint paths and tempo (fast effort / slow return) with synced breathing cues.
 * It is a schematic illustration, not a recording; the real start/end photos remain the reference.
 */

export type V = [number, number];
export type Bend = "front" | "back" | "up" | "down";
export interface Pose {
  shrug?: number;
  hip: V; t?: number; shoulderAt?: V;           // torso: absolute angle (deg, 180 = up) or aim at a point
  hands: [V | { rel: V }, V | { rel: V }];        // near, far (rel = offset from shoulder)
  feet: [V, V];
  elbow?: Bend; knee?: Bend;
}
export interface Tpl {
  view?: "side" | "front";
  a: Pose; b: Pose;                              // start / end
  effort: "toB" | "toA";                         // which direction is the hard (concentric) phase
  hold?: boolean;                                // isometric (plank)
  cycle?: (p: number) => Pose;                   // cyclic cardio
  props: string[];                               // prop ids to draw
  label?: string;
}

export const L = { torso: 52, ua: 30, fa: 28, th: 38, sh: 36, neck: 7, head: 12 };
export const G = 182; // ground
const rad = (d: number) => (d * Math.PI) / 180;
const dirOf = (deg: number): V => [Math.sin(rad(deg)), Math.cos(rad(deg))];
const add = (a: V, b: V, k = 1): V => [a[0] + b[0] * k, a[1] + b[1] * k];
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerpV = (a: V, b: V, k: number): V => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

function ik(base: V, target: V, l1: number, l2: number, bend: Bend): [V, V] {
  const dx = target[0] - base[0], dy = target[1] - base[1];
  let d = Math.hypot(dx, dy);
  const end: V = d > l1 + l2 - 0.5 ? add(base, [dx / d, dy / d], l1 + l2 - 0.5) : target;
  d = Math.min(Math.max(d, Math.abs(l1 - l2) + 0.5), l1 + l2 - 0.5);
  const th = Math.atan2(dy, dx);
  const a = Math.acos(Math.min(1, Math.max(-1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))));
  const j1: V = [base[0] + l1 * Math.cos(th + a), base[1] + l1 * Math.sin(th + a)];
  const j2: V = [base[0] + l1 * Math.cos(th - a), base[1] + l1 * Math.sin(th - a)];
  const pick = bend === "front" ? (j1[0] > j2[0] ? j1 : j2) : bend === "back" ? (j1[0] < j2[0] ? j1 : j2) : bend === "up" ? (j1[1] < j2[1] ? j1 : j2) : (j1[1] > j2[1] ? j1 : j2);
  return [pick, end];
}

export function solve(p: Pose) {
  const t = p.shoulderAt ? (Math.atan2(p.shoulderAt[0] - p.hip[0], p.shoulderAt[1] - p.hip[1]) * 180) / Math.PI : p.t ?? 180;
  const td = dirOf(t);
  const S = add(p.hip, td, L.torso - (p.shrug || 0) * 0.3);
  const headC = add(add(p.hip, td, L.torso), td, L.neck + L.head - (p.shrug || 0));
  const hand = (h: V | { rel: V }): V => ("rel" in h ? add(S, h.rel) : h);
  const arms = p.hands.map((h) => ik(S, hand(h), L.ua, L.fa, p.elbow || "down"));
  const legs = p.feet.map((f) => ik(p.hip, f, L.th, L.sh, p.knee || "front"));
  return { t, S, headC, arms, legs, hip: p.hip, hands: arms.map((a) => a[1]), feet: legs.map((l) => l[1]), shrugY: -(p.shrug || 0) * 0.5 };
}
type Rig = ReturnType<typeof solve>;

function shoulderOf(p: Pose): V {
  const t = p.shoulderAt ? (Math.atan2(p.shoulderAt[0] - p.hip[0], p.shoulderAt[1] - p.hip[1]) * 180) / Math.PI : p.t ?? 180;
  return add(p.hip, dirOf(t), L.torso);
}
export function mix(a: Pose, b: Pose, k: number): Pose {
  // mixed relative/absolute hand targets are resolved to absolute points first
  const sa = shoulderOf(a), sb = shoulderOf(b);
  const h = (x: V | { rel: V }, y: V | { rel: V }) => {
    if ("rel" in x && "rel" in y) return { rel: lerpV(x.rel, y.rel, k) };
    const ax: V = "rel" in x ? add(sa, x.rel) : x, by: V = "rel" in y ? add(sb, y.rel) : y;
    return lerpV(ax, by, k);
  };
  return {
    hip: lerpV(a.hip, b.hip, k), t: a.t !== undefined && b.t !== undefined ? lerp(a.t, b.t, k) : undefined,
    shoulderAt: a.shoulderAt && b.shoulderAt ? lerpV(a.shoulderAt, b.shoulderAt, k) : undefined,
    hands: [h(a.hands[0], b.hands[0]), h(a.hands[1], b.hands[1])], feet: [lerpV(a.feet[0], b.feet[0], k), lerpV(a.feet[1], b.feet[1], k)],
    elbow: a.elbow, knee: a.knee, shrug: lerp(a.shrug || 0, b.shrug || 0, k)
  };
}

// ---------- templates ----------
const stand = (hip: V, t: number, hands: Pose["hands"], elbow: Bend = "down"): Pose => ({ hip, t, hands, feet: [[hip[0] + 4, G], [hip[0] - 2, G]], elbow, knee: "front" });
const seat = (hip: V, t: number, hands: Pose["hands"], elbow: Bend = "down", feet: [V, V] = [[hip[0] + 40, G], [hip[0] + 36, G]]): Pose => ({ hip, t, hands, feet, elbow, knee: "up" });

export const BASE_T: Record<string, Tpl> = {
  press_seated: { a: seat([100, 140], 182, [{ rel: [14, 18] }, { rel: [12, 18] }], "back"), b: seat([100, 140], 182, [{ rel: [56, 4] }, { rel: [54, 4] }], "back"), effort: "toB", props: ["seat", "backpad", "handle", "lever"] },
  press_standing: { a: { ...stand([120, 106], 172, [{ rel: [14, 18] }, { rel: [12, 18] }], "back"), feet: [[136, G], [104, G]] }, b: { ...stand([120, 106], 172, [{ rel: [56, 8] }, { rel: [54, 8] }], "back"), feet: [[136, G], [104, G]] }, effort: "toB", props: ["handle", "cableBack"] },
  press_lying: { a: { hip: [132, 122], t: -90, hands: [{ rel: [4, -14] }, { rel: [6, -14] }], feet: [[152, G], [148, G]], elbow: "down", knee: "up" }, b: { hip: [132, 122], t: -90, hands: [{ rel: [2, -56] }, { rel: [4, -56] }], feet: [[152, G], [148, G]], elbow: "down", knee: "up" }, effort: "toB", props: ["benchFlat", "dumbbell"] },
  press_incline: { a: { hip: [134, 128], t: -125, hands: [{ rel: [10, -12] }, { rel: [12, -12] }], feet: [[160, G], [156, G]], elbow: "down", knee: "up" }, b: { hip: [134, 128], t: -125, hands: [{ rel: [24, -50] }, { rel: [26, -50] }], feet: [[160, G], [156, G]], elbow: "down", knee: "up" }, effort: "toB", props: ["benchIncline", "dumbbell"] },
  pushup: { a: { hip: [133, 145], shoulderAt: [86, 123], hands: [[88, G - 1], [92, G - 1]], feet: [[200, G - 4], [204, G - 4]], elbow: "back", knee: "down" }, b: { hip: [127, 160], shoulderAt: [76, 152], hands: [[88, G - 1], [92, G - 1]], feet: [[200, G - 4], [204, G - 4]], elbow: "back", knee: "down" }, effort: "toA", props: [] },
  pushup_incline: { a: { hip: [140, 132], shoulderAt: [92, 100], hands: [[92, 146], [96, 146]], feet: [[202, G - 3], [206, G - 3]], elbow: "back", knee: "down" }, b: { hip: [136, 142], shoulderAt: [86, 122], hands: [[92, 146], [96, 146]], feet: [[202, G - 3], [206, G - 3]], elbow: "back", knee: "down" }, effort: "toA", props: ["box"] },
  pulldown: { a: seat([116, 142], 176, [[130, 34], [134, 34]], "back"), b: seat([116, 142], 172, [{ rel: [16, 8] }, { rel: [18, 8] }], "back"), effort: "toB", props: ["seat", "kneepad", "bar", "cableTop"] },
  pullup: { a: { hip: [122, 126], t: 178, hands: [[124, 16], [128, 16]], feet: [[100, 186], [104, 186]], elbow: "back", knee: "back" }, b: { hip: [122, 92], t: 176, hands: [[124, 16], [128, 16]], feet: [[100, 152], [104, 152]], elbow: "back", knee: "back" }, effort: "toB", props: ["pullbar"] },
  row_cable: { a: seat([96, 158], 186, [[168, 128], [170, 128]], "back", [[176, 150], [172, 150]]), b: seat([96, 158], 176, [{ rel: [16, 26] }, { rel: [18, 26] }], "back", [[176, 150], [172, 150]]), effort: "toB", props: ["floorSeat", "footplate", "vhandle", "cableFront"] },
  row_machine: { a: seat([100, 142], 182, [{ rel: [54, 4] }, { rel: [52, 4] }], "back"), b: seat([100, 142], 182, [{ rel: [10, 18] }, { rel: [8, 18] }], "back"), effort: "toB", props: ["seat", "chestpad", "handle"] },
  row_bent: { a: { ...stand([112, 108], 112, [[158, 150], [162, 150]], "back"), feet: [[124, G], [104, G]] }, b: { ...stand([112, 108], 112, [{ rel: [-6, 24] }, { rel: [-4, 24] }], "up"), feet: [[124, G], [104, G]] }, effort: "toB", props: ["dumbbell"] },
  back_ext: { a: { hip: [120, 100], t: 40, hands: [{ rel: [-6, -6] }, { rel: [-4, -6] }], feet: [[176, 150], [180, 152]], elbow: "up", knee: "down" }, b: { hip: [120, 100], t: -126, hands: [{ rel: [6, 6] }, { rel: [8, 6] }], feet: [[176, 150], [180, 152]], elbow: "down", knee: "down" }, effort: "toB", props: ["hyperBench"] },
  row_bar: { a: { hip: [112, 108], t: 112, hands: [[158, 150], [162, 150]], feet: [[124, G], [104, G]], elbow: "back", knee: "front" }, b: { hip: [112, 108], t: 112, hands: [{ rel: [-6, 24] }, { rel: [-4, 24] }], feet: [[124, G], [104, G]], elbow: "up", knee: "front" }, effort: "toB", props: ["barbell"] },
  leg_press: { a: { hip: [104, 140], t: -128, hands: [[110, 146], [114, 146]], feet: [[146, 118], [150, 116]], elbow: "down", knee: "up" }, b: { hip: [104, 140], t: -128, hands: [[110, 146], [114, 146]], feet: [[161, 100], [165, 98]], elbow: "down", knee: "up" }, effort: "toB", props: ["legPressSeat", "platform"] },
  leg_ext: { a: seat([108, 132], 178, [[112, 140], [116, 140]], "down", [[146, 170], [150, 170]]), b: seat([108, 132], 178, [[112, 140], [116, 140]], "down", [[182, 130], [186, 130]]), effort: "toB", props: ["seat", "backpad", "anklePad"] },
  curl_lying: { a: { hip: [122, 112], t: -90, hands: [[60, 124], [64, 124]], feet: [[196, 112], [198, 112]], elbow: "down", knee: "down" }, b: { hip: [122, 112], t: -90, hands: [[60, 124], [64, 124]], feet: [[150, 78], [154, 78]], elbow: "down", knee: "down" }, effort: "toB", props: ["benchProne", "anklePad"] },
  curl_seated: { a: seat([108, 132], 176, [[112, 140], [116, 140]], "down", [[184, 132], [186, 132]]), b: seat([108, 132], 176, [[112, 140], [116, 140]], "down", [[140, 170], [144, 170]]), effort: "toB", props: ["seat", "backpad", "anklePad"] },
  squat_goblet: { a: stand([122, 105], 180, [{ rel: [16, 22] }, { rel: [18, 22] }]), b: stand([102, 142], 150, [{ rel: [18, 20] }, { rel: [20, 20] }]), effort: "toA", props: ["dumbbell"] },
  squat_bar: { a: stand([122, 105], 180, [{ rel: [-6, 2] }, { rel: [-4, 2] }], "down"), b: stand([100, 142], 145, [{ rel: [-6, 2] }, { rel: [-4, 2] }], "down"), effort: "toA", props: ["barback", "rack"] },
  rdl: { a: stand([126, 105], 180, [{ rel: [4, 56] }, { rel: [6, 56] }]), b: stand([108, 110], 112, [{ rel: [-2, 56] }, { rel: [0, 56] }]), effort: "toA", props: ["barbell"] },
  hip_thrust: { a: { hip: [116, 160], shoulderAt: [76, 124], hands: [{ rel: [40, 32] }, { rel: [42, 32] }], feet: [[160, G], [164, G]], elbow: "down", knee: "up" }, b: { hip: [124, 124], shoulderAt: [76, 120], hands: [{ rel: [48, 4] }, { rel: [50, 4] }], feet: [[160, G], [164, G]], elbow: "down", knee: "up" }, effort: "toB", props: ["benchLow", "barbellHip"] },
  bridge: { a: { hip: [112, 174], shoulderAt: [62, 174], hands: [[96, 180], [100, 180]], feet: [[150, G], [154, G]], elbow: "up", knee: "up" }, b: { hip: [116, 146], shoulderAt: [66, 172], hands: [[96, 180], [100, 180]], feet: [[150, G], [154, G]], elbow: "up", knee: "up" }, effort: "toB", props: ["mat"] },
  lunge: { a: { hip: [122, 110], t: 180, hands: [{ rel: [2, 56] }, { rel: [4, 56] }], feet: [[158, G], [88, G - 2]], knee: "front", elbow: "down" }, b: { hip: [120, 140], t: 180, hands: [{ rel: [2, 56] }, { rel: [4, 56] }], feet: [[158, G], [88, G - 2]], knee: "front", elbow: "down" }, effort: "toA", props: ["dumbbell"] },
  calf: { a: seat([100, 140], 180, [[136, 128], [140, 128]], "down", [[140, G - 2], [144, G - 2]]), b: seat([100, 132], 180, [[136, 122], [140, 122]], "down", [[140, G - 12], [144, G - 12]]), effort: "toB", props: ["seat", "calfPad", "step"] },
  press_overhead: { a: seat([110, 140], 180, [{ rel: [12, -4] }, { rel: [14, -4] }], "down"), b: seat([110, 140], 180, [{ rel: [6, -56] }, { rel: [8, -56] }], "down"), effort: "toB", props: ["seat", "backpad", "dumbbell"] },
  face_pull: { a: { ...stand([118, 106], 174, [{ rel: [56, 4] }, { rel: [54, 4] }], "up"), feet: [[132, G], [104, G]] }, b: { ...stand([118, 106], 178, [{ rel: [12, -10] }, { rel: [10, -10] }], "back"), feet: [[132, G], [104, G]] }, effort: "toB", props: ["rope", "cableFrontHigh"] },
  curl: { a: stand([120, 105], 180, [{ rel: [4, 57] }, { rel: [6, 57] }], "back"), b: stand([120, 105], 180, [{ rel: [18, 8] }, { rel: [20, 8] }], "back"), effort: "toB", props: ["dumbbell"] },
  pushdown: { a: stand([114, 106], 172, [{ rel: [24, 22] }, { rel: [26, 22] }], "back"), b: stand([114, 106], 172, [{ rel: [10, 56] }, { rel: [12, 56] }], "back"), effort: "toB", props: ["rope", "cableTopFront"] },
  oh_ext: { a: { ...stand([120, 106], 176, [{ rel: [-12, -12] }, { rel: [-10, -12] }], "up"), feet: [[136, G], [104, G]] }, b: { ...stand([120, 106], 170, [{ rel: [20, -52] }, { rel: [22, -52] }], "up"), feet: [[136, G], [104, G]] }, effort: "toB", props: ["rope", "cableBackLow"] },
  dips: { a: { hip: [94, 128], t: 176, hands: [[74, 128], [78, 128]], feet: [[182, G], [186, G]], elbow: "back", knee: "up" }, b: { hip: [96, 152], t: 176, hands: [[74, 128], [78, 128]], feet: [[182, G], [186, G]], elbow: "back", knee: "up" }, effort: "toA", props: ["benchBehind"] },
  plank: { a: { hip: [134, 158], shoulderAt: [86, 152], hands: [[104, G - 1], [108, G - 1]], feet: [[202, G - 3], [206, G - 3]], elbow: "down", knee: "down" }, b: { hip: [134, 156], shoulderAt: [86, 151], hands: [[104, G - 1], [108, G - 1]], feet: [[202, G - 3], [206, G - 3]], elbow: "down", knee: "down" }, effort: "toB", hold: true, props: ["mat"] },
  dead_bug: { a: { hip: [130, 172], t: -90, hands: [{ rel: [2, -56] }, { rel: [4, -56] }], feet: [[166, 136], [170, 136]], elbow: "down", knee: "up" }, b: { hip: [130, 172], t: -90, hands: [{ rel: [-54, -12] }, { rel: [4, -56] }], feet: [[166, 136], [202, 166]], elbow: "down", knee: "up" }, effort: "toB", props: ["mat"] },
  pallof: { a: { ...stand([120, 108], 180, [{ rel: [12, 12] }, { rel: [14, 12] }], "down"), feet: [[134, G], [106, G]], knee: "front" }, b: { ...stand([120, 108], 180, [{ rel: [54, 12] }, { rel: [56, 12] }], "down"), feet: [[134, G], [106, G]], knee: "front" }, effort: "toB", props: ["handle", "cableSide"] },
  cable_crunch: { a: { hip: [122, 142], t: 176, hands: [{ rel: [10, -4] }, { rel: [12, -4] }], feet: [[84, G], [88, G]], elbow: "down", knee: "front" }, b: { hip: [118, 144], t: 70, hands: [{ rel: [6, -6] }, { rel: [8, -6] }], feet: [[84, G], [88, G]], elbow: "down", knee: "front" }, effort: "toB", props: ["rope", "cableTopFront", "mat"] },
  raise_front: { view: "front", a: { hip: [120, 108], t: 180, hands: [[100, 160], [140, 160]], feet: [[110, G], [130, G]] }, b: { hip: [120, 108], t: 180, hands: [[66, 64], [174, 64]], feet: [[110, G], [130, G]] }, effort: "toB", props: ["dumbbell"], label: "منظر من قدام" },
  walk: { a: stand([120, 106], 178, [{ rel: [0, 56] }, { rel: [0, 56] }]), b: stand([120, 106], 178, [{ rel: [0, 56] }, { rel: [0, 56] }]), effort: "toB", props: ["treadmill"], cycle: (p) => {
    const s = Math.sin(p * 2 * Math.PI), c = Math.cos(p * 2 * Math.PI);
    return { hip: [120, 105 + Math.abs(c) * 2], t: 178, hands: [{ rel: [s * 22, 52] }, { rel: [-s * 22, 52] }], feet: [[120 + s * 26, G - 4 - Math.max(0, c) * 8], [120 - s * 26, G - 4 - Math.max(0, -c) * 8]], elbow: "back", knee: "front" };
  } },
  bike: { a: seat([110, 104], 160, [[164, 100], [166, 100]], "down"), b: seat([110, 104], 160, [[164, 100], [166, 100]], "down"), effort: "toB", props: ["bike"], cycle: (p) => {
    const a = p * 2 * Math.PI, cx = 132, cy = 152, r = 15;
    return { hip: [108, 104], t: 158, hands: [[164, 100], [166, 100]], feet: [[cx + Math.cos(a) * r, cy + Math.sin(a) * r], [cx - Math.cos(a) * r, cy - Math.sin(a) * r]], elbow: "down", knee: "front" };
  } },
  elliptical: { a: stand([120, 104], 176, [[150, 70], [150, 70]]), b: stand([120, 104], 176, [[150, 70], [150, 70]]), effort: "toB", props: ["elliptical"], cycle: (p) => {
    const a = p * 2 * Math.PI;
    return { hip: [120, 102], t: 176, hands: [[146 + Math.cos(a) * 10, 74], [146 - Math.cos(a) * 10, 74]], feet: [[120 + Math.cos(a) * 22, 166 + Math.sin(a) * 6], [120 - Math.cos(a) * 22, 166 - Math.sin(a) * 6]], elbow: "down", knee: "front" };
  } },
  rower: { a: { hip: [128, 160], t: 150, hands: [[178, 146], [180, 146]], feet: [[176, 160], [178, 160]], elbow: "down", knee: "up" }, b: { hip: [96, 160], t: 200, hands: [{ rel: [14, 30] }, { rel: [16, 30] }], feet: [[176, 160], [178, 160]], elbow: "back", knee: "up" }, effort: "toB", props: ["rower"] },
  stairs: { a: stand([120, 100], 172, [[150, 96], [150, 96]]), b: stand([120, 100], 172, [[150, 96], [150, 96]]), effort: "toB", props: ["steps"], cycle: (p) => {
    const s = Math.sin(p * 2 * Math.PI);
    return { hip: [120, 102 + Math.abs(s) * 3], t: 172, hands: [[150, 96], [150, 98]], feet: [[132, 164 - Math.max(0, s) * 16], [128, 164 - Math.max(0, -s) * 16]], elbow: "down", knee: "front" };
  } }
};

// ---------- drawing ----------
const C = { skin: "#f2c094", skinFar: "#c9946a", shirt: "#b6ff3b", shirtFar: "#7fb52a", shorts: "#2b3039", shortsFar: "#20242b", shoe: "#ff7a1a", metal: "#9aa3ad", pad: "#3a404b", cable: "#cfd6dd" };
const line = (a: V, b: V, stroke: string, w: number, key?: string) => <line key={key} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={stroke} strokeWidth={w} strokeLinecap="round" />;

function Props({ ids, r, layer }: { ids: string[]; r: Rig; layer: "back" | "front" }) {
  const h = r.hands[0], f = r.feet[0];
  const out: React.ReactNode[] = [];
  const back = (n: React.ReactNode) => layer === "back" && out.push(n);
  const front = (n: React.ReactNode) => layer === "front" && out.push(n);
  for (const id of ids) {
    switch (id) {
      case "seat": back(<g key={id}><rect x={r.hip[0] - 22} y={r.hip[1] + 6} width={44} height={8} rx={3} fill={C.pad} />{line([r.hip[0], r.hip[1] + 14], [r.hip[0], G], C.metal, 4)}</g>); break;
      case "floorSeat": back(<rect key={id} x={r.hip[0] - 26} y={r.hip[1] + 6} width={52} height={G - r.hip[1] - 6} rx={3} fill={C.pad} />); break;
      case "backpad": back(<rect key={id} x={r.hip[0] - 20} y={r.hip[1] - 58} width={8} height={64} rx={3} fill={C.pad} />); break;
      case "chestpad": back(<rect key={id} x={r.S[0] + 12} y={r.S[1] - 6} width={8} height={40} rx={3} fill={C.pad} />); break;
      case "kneepad": back(<rect key={id} x={r.hip[0] + 30} y={r.hip[1] - 12} width={18} height={7} rx={3} fill={C.pad} />); break;
      case "handle": front(<circle key={id} cx={h[0]} cy={h[1]} r={4} fill={C.metal} />); break;
      case "lever": back(<g key={id}>{line([r.hip[0] - 16, 52], h, C.metal, 4)}{line([r.hip[0] - 16, 52], [r.hip[0] - 16, G], C.metal, 5)}</g>); break;
      case "dumbbell": front(<g key={id}>{r.hands.map((p, i) => <g key={i}><rect x={p[0] - 9} y={p[1] - 3} width={18} height={6} rx={2} fill={C.metal} /><rect x={p[0] - 11} y={p[1] - 6} width={5} height={12} rx={1.5} fill="#5a636e" /><rect x={p[0] + 6} y={p[1] - 6} width={5} height={12} rx={1.5} fill="#5a636e" /></g>)}</g>); break;
      case "barbell": front(<g key={id}><circle cx={h[0]} cy={h[1]} r={13} fill="#5a636e" stroke={C.metal} strokeWidth={2} /><circle cx={h[0]} cy={h[1]} r={3} fill={C.metal} /></g>); break;
      case "barback": front(<g key={id}><circle cx={r.S[0] - 4} cy={r.S[1] - 2} r={14} fill="#5a636e" stroke={C.metal} strokeWidth={2} /><circle cx={r.S[0] - 4} cy={r.S[1] - 2} r={3} fill={C.metal} /></g>); break;
      case "barbellHip": front(<g key={id}><circle cx={r.hip[0]} cy={r.hip[1] - 12} r={13} fill="#5a636e" stroke={C.metal} strokeWidth={2} /><circle cx={r.hip[0]} cy={r.hip[1] - 12} r={3} fill={C.metal} /></g>); break;
      case "rack": back(<g key={id}>{line([52, 30], [52, G], C.metal, 4)}{line([52, 70], [64, 70], C.metal, 3)}</g>); break;
      case "bar": front(<g key={id}>{line([h[0] - 22, h[1]], [h[0] + 22, h[1]], C.metal, 4)}</g>); break;
      case "cableTop": back(line([h[0], h[1]], [h[0], 6], C.cable, 1.5, id)); break;
      case "cableTopFront": back(<g key={id}>{line(h, [160, 8], C.cable, 1.5)}{line([160, 4], [160, G], C.metal, 5)}</g>); break;
      case "cableFront": back(<g key={id}>{line(h, [214, 150], C.cable, 1.5)}{line([216, 40], [216, G], C.metal, 5)}</g>); break;
      case "cableFrontHigh": back(<g key={id}>{line(h, [214, 70], C.cable, 1.5)}{line([216, 20], [216, G], C.metal, 5)}</g>); break;
      case "cableBack": back(<g key={id}>{line(h, [40, 84], C.cable, 1.5)}{line([38, 30], [38, G], C.metal, 5)}</g>); break;
      case "cableBackLow": back(<g key={id}>{line(h, [40, 150], C.cable, 1.5)}{line([38, 30], [38, G], C.metal, 5)}</g>); break;
      case "cableSide": back(<g key={id}>{line(h, [40, r.S[1] + 12], C.cable, 1.5)}{line([38, 40], [38, G], C.metal, 5)}</g>); break;
      case "rope": front(<g key={id}>{line([h[0] - 3, h[1] - 6], [h[0] + 3, h[1] + 6], "#e8d6a8", 3)}</g>); break;
      case "vhandle": front(<path key={id} d={`M${h[0] - 4},${h[1] - 5} L${h[0] + 4},${h[1]} L${h[0] - 4},${h[1] + 5}`} stroke={C.metal} strokeWidth={3} fill="none" />); break;
      case "footplate": back(<rect key={id} x={f[0] + 2} y={f[1] - 22} width={6} height={30} rx={2} fill={C.metal} />); break;
      case "benchFlat": back(<g key={id}><rect x={52} y={r.hip[1] + 8} width={104} height={8} rx={3} fill={C.pad} />{line([70, r.hip[1] + 16], [70, G], C.metal, 4)}{line([140, r.hip[1] + 16], [140, G], C.metal, 4)}</g>); break;
      case "benchIncline": back(<g key={id}>{line([r.hip[0] + 8, r.hip[1] + 10], [r.hip[0] - 50, r.hip[1] - 66], C.pad, 9)}<rect x={r.hip[0] - 14} y={r.hip[1] + 6} width={34} height={8} rx={3} fill={C.pad} />{line([r.hip[0], r.hip[1] + 14], [r.hip[0], G], C.metal, 4)}</g>); break;
      case "benchProne": back(<g key={id}><rect x={52} y={r.hip[1] + 8} width={130} height={8} rx={3} fill={C.pad} />{line([80, r.hip[1] + 16], [80, G], C.metal, 4)}{line([160, r.hip[1] + 16], [160, G], C.metal, 4)}</g>); break;
      case "benchLow": back(<g key={id}><rect x={52} y={126} width={36} height={56} rx={3} fill={C.pad} /></g>); break;
      case "benchBehind": back(<g key={id}><rect x={50} y={132} width={40} height={50} rx={3} fill={C.pad} /></g>); break;
      case "box": back(<rect key={id} x={66} y={148} width={44} height={34} rx={3} fill={C.pad} />); break;
      case "hyperBench": back(<g key={id}><rect x={r.hip[0] - 10} y={r.hip[1] + 6} width={24} height={9} rx={3} transform={`rotate(36 ${r.hip[0]} ${r.hip[1] + 10})`} fill={C.pad} />{line([r.hip[0] + 4, r.hip[1] + 16], [r.hip[0] + 10, G], C.metal, 4)}{line([r.hip[0] + 40, 140], [r.hip[0] + 60, 158], C.pad, 7)}{line([186, 156], [196, G], C.metal, 4)}</g>); break;
      case "legPressSeat": back(<g key={id}>{line([r.hip[0] + 6, r.hip[1] + 8], [r.hip[0] - 46, r.hip[1] - 52], C.pad, 10)}<rect x={r.hip[0] - 10} y={r.hip[1] + 6} width={28} height={8} rx={3} fill={C.pad} />{line([r.hip[0], r.hip[1] + 14], [r.hip[0], G], C.metal, 4)}{line([130, 150], [210, 64], C.metal, 3)}</g>); break;
      case "platform": front(<g key={id}><rect x={f[0] + 2} y={f[1] - 22} width={9} height={40} rx={2} transform={`rotate(-40 ${f[0] + 6} ${f[1]})`} fill={C.metal} /></g>); break;
      case "anklePad": front(<circle key={id} cx={f[0] - 2} cy={f[1] - 4} r={6} fill={C.pad} stroke="#5a636e" strokeWidth={2} />); break;
      case "calfPad": front(<rect key={id} x={r.hip[0] + 26} y={r.hip[1] - 8} width={22} height={7} rx={3} fill={C.pad} />); break;
      case "step": back(<rect key={id} x={f[0] - 4} y={G - 6} width={24} height={6} fill={C.metal} />); break;
      case "pullbar": back(<g key={id}>{line([90, 16], [170, 16], C.metal, 5)}{line([92, 16], [92, G], C.metal, 4)}</g>); break;
      case "stepLow": back(<rect key={id} x={132} y={164} width={46} height={18} rx={3} fill={C.pad} />); break;
      case "seatFront": back(<rect key={id} x={r.hip[0] - 26} y={r.hip[1] + 4} width={52} height={8} rx={3} fill={C.pad} />); break;
      case "wall": back(<g key={id}><rect x={196} y={10} width={14} height={G - 10} fill="#2b3039" /><rect x={192} y={10} width={4} height={G - 10} fill="#3a404b" /></g>); break;
      case "boxSeat": back(<rect key={id} x={r.hip[0] - 26} y={146} width={40} height={36} rx={4} fill={C.pad} />); break;
      case "mat": back(<rect key={id} x={40} y={G - 2} width={180} height={4} rx={2} fill="#2f4f2a" />); break;
      case "treadmill": back(<g key={id}><rect x={70} y={G - 4} width={110} height={8} rx={4} fill={C.pad} />{line([170, G - 2], [176, 92], C.metal, 4)}{line([176, 92], [158, 92], C.metal, 4)}</g>); break;
      case "bike": back(<g key={id}>{line([108, 112], [132, 152], C.metal, 5)}{line([132, 152], [166, 104], C.metal, 5)}{line([108, 112], [100, G], C.metal, 5)}<circle cx={132} cy={152} r={18} fill="none" stroke={C.metal} strokeWidth={2} />{line([166, 104], [166, G], C.metal, 5)}<rect x={96} y={104} width={24} height={6} rx={3} fill={C.pad} /></g>); break;
      case "elliptical": back(<g key={id}>{line([150, 70], [158, G], C.metal, 4)}<ellipse cx={120} cy={168} rx={26} ry={8} fill="none" stroke={C.metal} strokeWidth={2} /><rect x={70} y={G - 4} width={110} height={6} rx={3} fill={C.pad} /></g>); break;
      case "rower": back(<g key={id}><rect x={60} y={166} width={140} height={6} rx={3} fill={C.metal} /><rect x={r.hip[0] - 14} y={r.hip[1] + 4} width={28} height={6} rx={3} fill={C.pad} /><rect x={176} y={140} width={22} height={28} rx={4} fill={C.pad} />{line(h, [186, 146], C.cable, 1.5)}</g>); break;
      case "steps": back(<g key={id}><rect x={110} y={164} width={44} height={18} fill={C.pad} /><rect x={140} y={148} width={44} height={34} fill={C.pad} />{line([156, 96], [170, G], C.metal, 4)}</g>); break;
    }
  }
  return <>{out}</>;
}

function Figure({ r, front }: { r: Rig; front?: boolean }) {
  const limb = (a: V, b: V, c: V, col: string, w: number, k: string) => <g key={k}>{line(a, b, col, w)}{line(b, c, col, w * 0.92)}</g>;
  if (front) {
    const sh: V = [r.hip[0], r.hip[1] - L.torso + (r.shrugY || 0)];
    const ls: V = [sh[0] - 14, sh[1] + 4], rs: V = [sh[0] + 14, sh[1] + 4];
    const [le, lh] = ik(ls, r.hands[0], L.ua, L.fa, "down"), [re, rh] = ik(rs, r.hands[1], L.ua, L.fa, "down");
    const lhip: V = [r.hip[0] - 8, r.hip[1]], rhip: V = [r.hip[0] + 8, r.hip[1]];
    return (
      <g>
        {(() => { const [lk, lf] = ik(lhip, r.feet[0], L.th, L.sh, "back"), [rk, rf] = ik(rhip, r.feet[1], L.th, L.sh, "front"); return <>{limb(lhip, lk, lf, C.skin, 10, "ll")}{limb(rhip, rk, rf, C.skin, 10, "rl")}<rect x={lf[0] - 7} y={lf[1] - 3} width={12} height={7} rx={3.5} fill={C.shoe} /><rect x={rf[0] - 5} y={rf[1] - 3} width={12} height={7} rx={3.5} fill={C.shoe} /></>; })()}
        <rect x={r.hip[0] - 15} y={r.hip[1] - 4} width={30} height={18} rx={6} fill={C.shorts} />
        <rect x={sh[0] - 17} y={sh[1]} width={34} height={L.torso} rx={10} fill={C.shirt} />
        {limb(ls, le, lh, C.skin, 9, "la")}{limb(rs, re, rh, C.skin, 9, "ra")}
        <circle cx={sh[0]} cy={sh[1] - 16} r={L.head} fill={C.skin} /><path d={`M${sh[0] - 12},${sh[1] - 20} Q${sh[0]},${sh[1] - 34} ${sh[0] + 12},${sh[1] - 20}`} fill="#3b2a1e" />
        <circle cx={sh[0] - 4} cy={sh[1] - 16} r={1.6} fill="#222" /><circle cx={sh[0] + 4} cy={sh[1] - 16} r={1.6} fill="#222" /><path d={`M${sh[0] - 4},${sh[1] - 10} Q${sh[0]},${sh[1] - 7} ${sh[0] + 4},${sh[1] - 10}`} stroke="#7a3b2b" strokeWidth={1.4} fill="none" />
      </g>
    );
  }
  const [farArm, nearArm] = [r.arms[1], r.arms[0]];
  const [farLeg, nearLeg] = [r.legs[1], r.legs[0]];
  const td = dirOf(r.t);
  const foot = (a: V, k: string, col: string) => { const dir: V = [Math.abs(td[0]) > 0.8 && td[1] > -0.2 ? 0 : 1, 0]; return <rect key={k} x={a[0] - 3} y={a[1] - 3} width={14} height={7} rx={3.5} fill={col} transform={dir[0] ? undefined : `rotate(90 ${a[0]} ${a[1]})`} />; };
  const eyeDir = td[1] < -0.5 ? 1 : td[0] < 0 ? -1 : 1;
  return (
    <g>
      {limb(r.S, farArm[0], farArm[1], C.skinFar, 8, "fa")}
      {limb(r.hip, farLeg[0], farLeg[1], C.skinFar, 10, "fl")}{foot(farLeg[1], "ff", "#b85a14")}
      {line(r.hip, farLeg[0], C.shortsFar, 12, "fs")}
      {line(r.hip, r.S, C.shirt, 20, "torso")}
      {limb(r.hip, nearLeg[0], nearLeg[1], C.skin, 11, "nl")}{foot(nearLeg[1], "nf", C.shoe)}
      {line(r.hip, lerpV(r.hip, nearLeg[0], 0.55), C.shorts, 14, "ns")}
      <circle cx={r.hip[0]} cy={r.hip[1]} r={9} fill={C.shorts} />
      <circle cx={r.headC[0]} cy={r.headC[1]} r={L.head} fill={C.skin} />
      <path d={`M${r.headC[0] - 12},${r.headC[1] - 3} A12,12 0 0 1 ${r.headC[0] + 12},${r.headC[1] - 3}`} fill="#3b2a1e" transform={`rotate(${180 - r.t} ${r.headC[0]} ${r.headC[1]})`} />
      <circle cx={r.headC[0] + 5 * eyeDir} cy={r.headC[1] - 1} r={1.8} fill="#222" />
      {limb(r.S, nearArm[0], nearArm[1], C.skin, 9, "na")}
      <circle cx={r.S[0]} cy={r.S[1]} r={6} fill={C.shirt} />
    </g>
  );
}

export const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

/** Pose of a template at a point of the loop (or a fixed progress k for stills). */
export function poseAt(tpl: Tpl, time: number, k?: number): { pose: Pose; phase: "effort" | "return" | "hold" | "cycle" | "iso" } {
  if (k !== undefined) return { pose: tpl.cycle ? tpl.cycle(k) : mix(tpl.a, tpl.b, k), phase: "hold" };
  if (tpl.cycle) return { pose: tpl.cycle((time / 1.6) % 1), phase: "cycle" };
  if (tpl.hold) return { pose: mix(tpl.a, tpl.b, (Math.sin(time * 1.6) + 1) / 2), phase: "iso" };
  const eff = 1.2, h1 = 0.5, ret = 2.2, h2 = 0.4, total = eff + h1 + ret + h2;
  const tt = time % total, fwd = tpl.effort === "toB";
  const d1 = fwd ? eff : ret, d2 = fwd ? ret : eff;
  if (tt < d1) return { pose: mix(tpl.a, tpl.b, ease(tt / d1)), phase: fwd ? "effort" : "return" };
  if (tt < d1 + h1) return { pose: tpl.b, phase: "hold" };
  if (tt < d1 + h1 + d2) return { pose: mix(tpl.a, tpl.b, 1 - ease((tt - d1 - h1) / d2)), phase: fwd ? "return" : "effort" };
  return { pose: tpl.a, phase: "hold" };
}

/** Renders the male cartoon figure + equipment. `k` freezes it (0 = start, 1 = end). */
export type Mark = "elbow" | "shoulder" | "back" | "hands" | "hips" | "knee";
export function RigSvg({ tpl, k, playing = true, speed = 1, className = "", label, tint, mark }: { tpl: Tpl; k?: number; playing?: boolean; speed?: number; className?: string; label: string; tint?: "wrong" | "right"; mark?: Mark }) {
  const [time, setTime] = useState(0);
  const raf = useRef<number | undefined>(undefined);
  const last = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (k !== undefined || !playing) { last.current = undefined; return; }
    const tick = (ts: number) => { if (last.current !== undefined) setTime((t) => t + ((ts - last.current!) / 1000) * speed); last.current = ts; raf.current = requestAnimationFrame(tick); };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [k, playing, speed]);
  const { pose } = poseAt(tpl, time, k);
  const r = solve(pose);
  const bg = tint === "wrong" ? "from-[#3a1418] to-[#1d0c0f]" : tint === "right" ? "from-[#123018] to-[#0b1a0e]" : "from-[#1b2330] to-[#11161d]";
  return (
    <svg viewBox="0 0 240 200" className={`block w-full bg-gradient-to-b ${bg} ${className}`} role="img" aria-label={label} style={{ direction: "ltr" }}>
      <rect x={0} y={G} width={240} height={20} fill="#0c0f13" />
      <Props ids={tpl.props} r={r} layer="back" />
      <Figure r={r} front={tpl.view === "front"} />
      <Props ids={tpl.props} r={r} layer="front" />
      {mark && (() => {
        const pt: V = mark === "elbow" ? r.arms[0][0] : mark === "shoulder" ? [r.S[0], r.S[1] - 6] : mark === "hands" ? r.hands[0] : mark === "hips" ? r.hip : mark === "knee" ? r.legs[0][0] : [r.hip[0] - 13, r.S[1] + 4];
        const col = tint === "wrong" ? "#ff3b3b" : "#3ddc6a";
        return <circle cx={pt[0]} cy={pt[1]} r={15} fill="none" stroke={col} strokeWidth={3.5} strokeDasharray={tint === "wrong" ? "0" : "5 4"} />;
      })()}
    </svg>
  );
}
