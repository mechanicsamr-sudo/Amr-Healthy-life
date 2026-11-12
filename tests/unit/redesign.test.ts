import { describe, expect, it } from "vitest";
import { EXERCISE_MAP, EXERCISES } from "@/data/exercises";
import { VIDEOS } from "@/data/videos";
import { DEFAULT_SETTINGS, mergeSettings } from "@/lib/db";
import { MOTIVATION, PAIN_LEVELS, painLevelOf } from "@/lib/health";
import { makeI18n } from "@/lib/i18n";
import { loadsPainfulArea, primaryAlternatives, rankAlternatives, type SubstitutionContext } from "@/lib/substitution";
import { paletteVars, resolveMode, THEMES } from "@/lib/themes";
import type { ExerciseEntry } from "@/lib/types";
import { entryStatus } from "@/lib/workout";

const ctx: SubstitutionContext = { equipment: {}, level: "beginner", conditions: DEFAULT_SETTINGS.profile.conditions };

describe("الثيمات", () => {
  it("6 ثيمات لكل منها نسخة داكنة وفاتحة كاملة", () => {
    expect(THEMES.map((t) => t.id).sort()).toEqual(["clean", "graphite", "midnight", "ocean", "premium", "sport"]);
    for (const t of THEMES) {
      for (const mode of ["dark", "light"] as const) {
        const vars = paletteVars(t[mode]);
        for (const k of ["--bg", "--surface", "--text", "--accent", "--go"]) expect(vars[k], `${t.id} ${mode} ${k}`).toMatch(/^\d+ \d+ \d+$/);
      }
    }
  });
  it("وضع النظام يتبع إعداد الموبايل", () => {
    expect(resolveMode("system", true)).toBe("dark");
    expect(resolveMode("system", false)).toBe("light");
    expect(resolveMode("light", true)).toBe("light");
  });
  it("الإعدادات القديمة أو التالفة ترجع للقيم الافتراضية", () => {
    const s = mergeSettings({ themeId: "nope" as never, language: "fr" as never });
    expect(s.themeId).toBe("sport");
    expect(s.language).toBe("ar");
    expect(mergeSettings({ themeId: "ocean", language: "en" }).themeId).toBe("ocean");
  });
});

describe("اللغتين", () => {
  it("اختيار النص والاتجاه حسب اللغة", () => {
    const ar = makeI18n("ar");
    const en = makeI18n("en");
    expect(ar.dir).toBe("rtl");
    expect(en.dir).toBe("ltr");
    expect(ar.L("أ", "A")).toBe("أ");
    expect(en.pick({ ar: "أ", en: "A" })).toBe("A");
    expect(en.pick("نص قديم")).toBe("نص قديم");
  });
  it("كل خيارات الألم ورسائل التحفيز لها نص عربي وإنجليزي", () => {
    for (const p of PAIN_LEVELS) expect(p.label.ar && p.label.en).toBeTruthy();
    expect(MOTIVATION.length).toBeGreaterThanOrEqual(4);
    for (const m of MOTIVATION) expect(m.ar && m.en).toBeTruthy();
  });
  it("الرقم المحفوظ للألم يتحول لمستوى الاختيار والعكس", () => {
    for (const p of PAIN_LEVELS) expect(painLevelOf(p.value)).toBe(p.id);
    expect(painLevelOf(null)).toBeNull();
    expect(painLevelOf(10)).toBe("severe");
  });
});

describe("الألم الشديد والبدائل", () => {
  it("لا يُقترح بديل يحمّل الركبة بعد ألم شديد فيها", () => {
    const base = EXERCISE_MAP.leg_press;
    const r = rankAlternatives(base, EXERCISES, { ...ctx, severePain: ["knee"] });
    for (const c of r.suggested) expect(c.exercise.kneeLoad).toBe("low");
    expect(r.blockedByPain.length).toBeGreaterThan(0);
    for (const c of primaryAlternatives(base, EXERCISE_MAP, { ...ctx, severePain: ["knee"] })) expect(loadsPainfulArea(c.exercise, base, ["knee"])).toBe(false);
  });
  it("بدون ألم شديد يوجد بديلان على الأقل لكل تمرين مقاومة", () => {
    for (const e of EXERCISES.filter((x) => x.kind === "strength")) {
      expect(primaryAlternatives(e, EXERCISE_MAP, ctx).length, e.id).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("حالة التمرين", () => {
  const entry = (p: Partial<ExerciseEntry>): ExerciseEntry =>
    ({ exerciseId: "x", plannedExerciseId: "x", slotIndex: 0, substituted: false, substitutionReason: "", skipped: false, kneePain: null, backPain: null, notes: "", sets: [{ done: false }, { done: false }], ...p }) as unknown as ExerciseEntry;
  it("تم / جزئي / لم يتم / مستبدل / متخطى", () => {
    expect(entryStatus(entry({}))).toBe("pending");
    expect(entryStatus(entry({ sets: [{ done: true }, { done: false }] as never }))).toBe("partial");
    expect(entryStatus(entry({ sets: [{ done: true }, { done: true }] as never }))).toBe("completed");
    expect(entryStatus(entry({ substituted: true, sets: [{ done: true }] as never }))).toBe("replaced");
    expect(entryStatus(entry({ skipped: true }))).toBe("skipped");
  });
});

describe("الفيديوهات", () => {
  it("كل فيديو له معرف يوتيوب صحيح وقناة من القائمة المعتمدة (رجال فقط)", () => {
    const allowed = ["ATHLEAN-X", "ScottHermanFitness", "Jeremy Ethier", "Jeff Nippard", "Colossus Fitness", "Bob & Brad", "E3 Rehab", "Squat University", "Tone and Tighten", "Calisthenicmovement", "The Hybrid Athlete", "Mind Pump TV"];
    for (const [id, v] of Object.entries(VIDEOS)) {
      expect(v.id, id).toMatch(/^[A-Za-z0-9_-]{11}$/);
      expect(allowed.some((a) => v.channel.replace("™", "").includes(a)), `${id}: ${v.channel}`).toBe(true);
    }
  });
});
