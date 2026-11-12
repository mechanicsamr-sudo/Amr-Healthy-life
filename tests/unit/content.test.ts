import { describe, expect, it } from "vitest";
import { CONTENT } from "@/data/content";
import { EXERCISE_MAP, EXERCISES } from "@/data/exercises";

describe("المحتوى ثنائي اللغة والأخطاء الشائعة", () => {
  it("كل تمرين مدمج له محتوى إنجليزي وأخطاء شائعة (3-5)", () => {
    for (const e of EXERCISES) {
      const c = CONTENT[e.id];
      expect(c, e.id).toBeDefined();
      expect(c.en.steps.length, e.id).toBeGreaterThan(0);
      expect(c.en.setup.length, e.id).toBeGreaterThan(0);
      expect(c.en.breathing.length, e.id).toBeGreaterThan(5);
      expect(c.mistakes.length, e.id).toBeGreaterThanOrEqual(3);
      expect(c.mistakes.length, e.id).toBeLessThanOrEqual(5);
      for (const mk of c.mistakes) {
        for (const f of [mk.title, mk.why, mk.fix]) {
          expect(f.ar.length, e.id).toBeGreaterThan(3);
          expect(f.en.length, e.id).toBeGreaterThan(3);
        }
      }
      for (const f of [c.start, c.posture, c.range]) expect(f.ar && f.en, e.id).toBeTruthy();
      expect(!!e.reviewRequired, e.id).toBe(!!c.en.reviewRequired);
    }
  });
  it("لا يوجد محتوى لتمرين غير موجود", () => {
    for (const id of Object.keys(CONTENT)) expect(EXERCISE_MAP[id], id).toBeDefined();
  });
  it("كل تمرين له بديلين على الأقل موجودين", () => {
    for (const e of EXERCISES) {
      const alts = e.alternatives.filter((a) => EXERCISE_MAP[a] && a !== e.id);
      expect(alts.length, e.id).toBeGreaterThanOrEqual(2);
    }
  });
});

import { EQUIPMENT_INFO, EQUIPMENT_INFO_MAP, relatedExercises } from "@/data/equipment";
import { EQUIPMENT } from "@/lib/labels";

describe("مكتبة الأجهزة", () => {
  it("كل معدة لها بطاقة كاملة باللغتين", () => {
    const ids = Object.keys(EQUIPMENT).filter((k) => k !== "none");
    for (const id of ids) {
      const e = EQUIPMENT_INFO_MAP[id];
      expect(e, id).toBeDefined();
      expect(e.howTo.ar.length, id).toBeGreaterThan(0);
      expect(e.howTo.en.length, id).toBe(e.howTo.ar.length);
      expect(e.mistakes.length, id).toBeGreaterThanOrEqual(3);
      expect(e.alternatives.length, id).toBeGreaterThanOrEqual(2);
      for (const a of e.alternatives) expect(EQUIPMENT_INFO_MAP[a], `${id} -> ${a}`).toBeDefined();
      expect(relatedExercises(e.id).length, id).toBeGreaterThan(0);
    }
    expect(EQUIPMENT_INFO.length).toBe(ids.length);
  });
  it("كل الأجهزة المطلوبة في المواصفات موجودة", () => {
    const required = ["chest_press_machine", "incline_press_machine", "pec_deck_machine", "lat_pulldown_machine", "seated_row_machine", "assisted_pullup_machine", "shoulder_press_machine", "lateral_raise_machine", "rear_delt_machine", "preacher_curl_machine", "triceps_machine", "leg_press_machine", "leg_extension_machine", "seated_leg_curl_machine", "lying_leg_curl_machine", "hip_abduction_machine", "hip_adduction_machine", "seated_calf_machine", "smith_machine", "hack_squat_machine", "dumbbells", "barbell_rack", "ez_bar", "weight_plates", "adjustable_bench", "flat_bench", "incline_bench", "decline_bench", "cable_crossover", "functional_trainer", "cable_pulley", "triceps_rope", "straight_bar", "lat_attachments", "resistance_band", "mat", "medicine_ball", "stability_ball", "suspension_trainer", "foam_roller", "kettlebell", "treadmill", "upright_bike", "recumbent_bike", "elliptical", "stair_climber", "rowing_machine"];
    for (const id of required) expect(EQUIPMENT_INFO_MAP[id], id).toBeDefined();
  });
});
