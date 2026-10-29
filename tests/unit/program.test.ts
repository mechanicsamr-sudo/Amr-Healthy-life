import { describe, expect, it } from "vitest";
import { EXERCISE_MAP, EXERCISES } from "@/data/exercises";
import { allSessions, DELOAD_WEEKS, PHASES, weekParams } from "@/data/program";
import { addDays, formatDateLong, isValidISODate, weekday } from "@/lib/dates";
import { buildSchedule, DEFAULT_START_DATE, DEFAULT_TRAINING_DAYS, pickCurrentSession, plannedDate, programEndDate, programWeekOf } from "@/lib/schedule";

describe("التواريخ", () => {
  it("بداية البرنامج السبت 31 أكتوبر 2026 ونهايته الجمعة 30 أبريل 2027", () => {
    expect(weekday(DEFAULT_START_DATE)).toBe(6);
    expect(programEndDate(DEFAULT_START_DATE)).toBe("2027-04-30");
    expect(weekday("2027-04-30")).toBe(5);
    expect(formatDateLong("2026-10-31")).toContain("السبت");
  });
  it("التحقق من صحة التاريخ", () => {
    expect(isValidISODate("2027-02-29")).toBe(false);
    expect(isValidISODate("2028-02-29")).toBe(true);
    expect(isValidISODate("2026-13-01")).toBe(false);
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });
});

describe("البرنامج", () => {
  const sessions = allSessions();
  it("78 حصة على 26 أسبوعًا", () => {
    expect(sessions).toHaveLength(78);
    expect(new Set(sessions.map((s) => s.id)).size).toBe(78);
    expect(PHASES.flatMap((p) => p.weeks).sort((a, b) => a - b)).toEqual(Array.from({ length: 26 }, (_, i) => i + 1));
  });
  it("كل الحصص تستخدم تمارين موجودة ولا تستخدم تمارين تحتاج مراجعة", () => {
    for (const s of sessions) {
      expect(s.exercises.length).toBeGreaterThanOrEqual(5);
      for (const e of s.exercises) {
        const ex = EXERCISE_MAP[e.exerciseId];
        expect(ex, e.exerciseId).toBeDefined();
        expect(ex.reviewRequired, e.exerciseId).toBeUndefined();
        expect(e.sets).toBeGreaterThanOrEqual(1);
        expect(e.repsMin).toBeLessThanOrEqual(e.repsMax);
        expect(e.restSec).toBeGreaterThan(0);
      }
      expect(EXERCISE_MAP[s.cardio.exerciseId].kind).toBe("cardio");
      expect(s.cardio.minutes).toBeGreaterThan(0);
      expect(s.estimatedMinutes).toBeGreaterThan(30);
      expect(s.estimatedMinutes).toBeLessThan(110);
      expect(s.safetyNotes.length).toBeGreaterThan(0);
    }
  });
  it("أسابيع التخفيف بحجم أقل من الأسبوع السابق", () => {
    for (const w of DELOAD_WEEKS) {
      const a = weekParams(w);
      const b = weekParams(w - 1);
      expect(a.mainSets + a.accSets).toBeLessThan(b.mainSets + b.accSets);
    }
  });
  it("كل أسبوع له خطة وتركيز خاص", () => {
    const foci = new Set(Array.from({ length: 26 }, (_, i) => weekParams(i + 1).focus));
    expect(foci.size).toBe(26);
  });
  it("كل البدائل المنتقاة موجودة", () => {
    for (const e of EXERCISES) for (const a of e.alternatives) expect(EXERCISE_MAP[a], `${e.id} -> ${a}`).toBeDefined();
  });
});

describe("الجدول", () => {
  it("الحصص في السبت والاثنين والأربعاء", () => {
    for (const s of allSessions()) {
      const d = plannedDate(s, DEFAULT_START_DATE, DEFAULT_TRAINING_DAYS);
      expect([6, 1, 3]).toContain(weekday(d));
      expect(d >= "2026-10-31" && d <= "2027-04-30").toBe(true);
    }
    expect(plannedDate(allSessions()[0], DEFAULT_START_DATE, DEFAULT_TRAINING_DAYS)).toBe("2026-10-31");
    expect(plannedDate(allSessions()[1], DEFAULT_START_DATE, DEFAULT_TRAINING_DAYS)).toBe("2026-11-02");
    expect(plannedDate(allSessions()[2], DEFAULT_START_DATE, DEFAULT_TRAINING_DAYS)).toBe("2026-11-04");
    expect(plannedDate(allSessions()[77], DEFAULT_START_DATE, DEFAULT_TRAINING_DAYS)).toBe("2027-04-28");
  });
  it("الحالات: فائتة/اليوم/قادمة، والمكتملة فقط بعد تسجيل الإنهاء", () => {
    const sched = buildSchedule(DEFAULT_START_DATE, DEFAULT_TRAINING_DAYS, [], [], "2026-11-02");
    expect(sched[0].status).toBe("missed");
    expect(sched[1].status).toBe("today");
    expect(sched[2].status).toBe("upcoming");
    expect(pickCurrentSession(sched, "2026-11-02")?.session.id).toBe("w01-B");
    const inProg = { sessionId: "w01-A", status: "in_progress", updatedAt: 1 } as never;
    expect(buildSchedule(DEFAULT_START_DATE, DEFAULT_TRAINING_DAYS, [], [inProg], "2026-11-02")[0].status).toBe("in_progress");
  });
  it("إعادة الجدولة والتخطي", () => {
    const sched = buildSchedule(DEFAULT_START_DATE, DEFAULT_TRAINING_DAYS, [{ sessionId: "w01-A", rescheduledDate: "2026-11-03", updatedAt: 1 }, { sessionId: "w01-B", skipped: true, updatedAt: 1 }], [], "2026-11-02");
    expect(sched[0].date).toBe("2026-11-03");
    expect(sched[0].rescheduled).toBe(true);
    expect(sched[0].status).toBe("upcoming");
    expect(sched[1].status).toBe("skipped");
  });
  it("قبل البداية الحصة القادمة هي الأولى", () => {
    const sched = buildSchedule(DEFAULT_START_DATE, DEFAULT_TRAINING_DAYS, [], [], "2026-10-29");
    expect(pickCurrentSession(sched, "2026-10-29")?.session.id).toBe("w01-A");
    expect(programWeekOf("2026-10-29", DEFAULT_START_DATE)).toBeNull();
    expect(programWeekOf("2027-04-30", DEFAULT_START_DATE)).toBe(26);
    expect(programWeekOf("2027-05-01", DEFAULT_START_DATE)).toBeNull();
  });
});
