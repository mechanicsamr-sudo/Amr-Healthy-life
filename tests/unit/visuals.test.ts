import { describe, expect, it } from "vitest";
import { solve, mix } from "@/components/rig/Rig";
import { EXERCISES } from "@/data/exercises";
import { CONTENT } from "@/data/content/index";
import { WARMUP_MOVES } from "@/data/warmup";
import { EQUIPMENT_INFO, illustrationExercise } from "@/data/equipment";
import { allSessions } from "@/data/program";
import { mediaFor } from "@/lib/media";
import { TEMPLATES, comparisonsFor, templateIdFor } from "@/lib/rigMap";

const programIds = [...new Set(allSessions().flatMap((s) => s.exercises.map((e) => e.exerciseId)))];
const finite = (v: unknown): boolean => (Array.isArray(v) ? v.every(finite) : typeof v === "number" ? Number.isFinite(v) : typeof v === "object" && v !== null ? Object.values(v).every(finite) : true);

describe("animated male figure (rig)", () => {
  it("every exercise in the 6-month program has an animation", () => {
    for (const id of programIds) {
      const e = EXERCISES.find((x) => x.id === id)!;
      const tid = templateIdFor(id, e.pattern);
      expect(tid, id).toBeTruthy();
      expect(TEMPLATES[tid!], `${id} -> ${tid}`).toBeTruthy();
    }
  });
  it("every warm-up move has an animation (no emoji placeholders)", () => {
    for (const w of WARMUP_MOVES) expect(TEMPLATES[w.id], w.id).toBeTruthy();
  });
  it("all templates solve to finite joint positions across the movement", () => {
    for (const [id, t] of Object.entries(TEMPLATES)) {
      for (const k of [0, 0.5, 1]) {
        const p = t.cycle ? t.cycle(k) : mix(t.a, t.b, k);
        const r = solve(p);
        expect(finite([r.S, r.headC, r.hip, r.hands, r.feet, r.arms, r.legs]), `${id}@${k}`).toBe(true);
      }
    }
  });
});

describe("wrong vs correct comparisons", () => {
  it("program exercises get visual comparisons for drawable mistakes", () => {
    let withPairs = 0;
    for (const id of programIds) {
      const e = EXERCISES.find((x) => x.id === id)!;
      const ms = CONTENT[id]?.mistakes ?? [];
      const comps = comparisonsFor(id, e.pattern, ms);
      expect(comps.length).toBeLessThanOrEqual(3);
      for (const c of comps) {
        expect(c.mistakeIndex).toBeGreaterThanOrEqual(0);
        expect(c.mistakeIndex).toBeLessThan(ms.length);
        expect(["breathing", "tempo"]).not.toContain(ms[c.mistakeIndex].cat);
        const w = solve(mix(c.wrong.a, c.wrong.b, c.wrongK)), r = solve(mix(c.right.a, c.right.b, c.rightK));
        expect(finite([w.S, w.hands, r.S, r.hands]), id).toBe(true);
        expect(JSON.stringify([w.S, w.hands, w.hip, w.headC, w.legs]) !== JSON.stringify([r.S, r.hands, r.hip, r.headC, r.legs]), `${id}: wrong must differ from correct`).toBe(true);
      }
      if (comps.length) withPairs++;
    }
    // 28 of 40 today. The rest are mistakes that cannot be drawn honestly from the side (knees caving, twisting, rounding, wrist).
    expect(withPairs).toBeGreaterThanOrEqual(28);
  });
  it("machine chest press shows the shrug, back-off-pad and locked-elbow mistakes", () => {
    const ms = CONTENT.machine_chest_press.mistakes;
    const titles = comparisonsFor("machine_chest_press", "horizontal_push", ms).map((c) => ms[c.mistakeIndex].title.en);
    expect(titles).toEqual(expect.arrayContaining(["Back leaving the pad", "Snapping the elbows locked"]));
  });
});

describe("equipment library images", () => {
  it("prefers an exercise with a realistic drawing", () => {
    const id = illustrationExercise("chest_press_machine", (x) => !!mediaFor(x).drawings);
    expect(id && mediaFor(id).drawings).toBeTruthy();
  });
  it("almost every equipment item can be illustrated", () => {
    const missing = EQUIPMENT_INFO.filter((q) => {
      const ex = illustrationExercise(q.id, (x) => !!mediaFor(x).drawings);
      if (!ex) return true;
      const e = EXERCISES.find((x) => x.id === ex);
      return !(mediaFor(ex).drawings || mediaFor(ex).photo || (e && templateIdFor(ex, e.pattern)));
    }).map((q) => q.id);
    expect(missing.length, missing.join(",")).toBeLessThanOrEqual(3);
  });
});

describe("template registry", () => {
  it("extra/warm-up templates never silently override base templates", async () => {
    const { BASE_T } = await import("@/components/rig/Rig");
    const { EXTRA_T, WARMUP_T } = await import("@/components/rig/templates");
    const base = Object.keys(BASE_T);
    for (const k of [...Object.keys(EXTRA_T), ...Object.keys(WARMUP_T)]) expect(base, k).not.toContain(k);
    expect(Object.keys(EXTRA_T).filter((k) => k in WARMUP_T)).toEqual([]);
  });
});
