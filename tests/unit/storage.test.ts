import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { getSession } from "@/data/program";
import { BackupError, exportBackup, importBackup, toCSV, validateBackup, workoutsToCSV } from "@/lib/backup";
import { GymDB, getSettings, updateSettings } from "@/lib/db";
import { finishWorkout, patchOverride, resetSessionExercises, saveWorkout, startOrResumeWorkout, substituteInWorkout, updateSet, workoutCompletion } from "@/lib/workout";

let db: GymDB;
beforeEach(async () => {
  db = new GymDB("test-" + Math.random());
  await db.open();
});

describe("الحفظ والاستعادة", () => {
  it("الإعدادات الافتراضية تطابق بيانات المستخدم", async () => {
    const s = await getSettings(db);
    expect(s.profile.startWeightKg).toBe(132.4);
    expect(s.profile.heightCm).toBe(179);
    expect(s.profile.trainingDays.sort()).toEqual([1, 3, 6]);
    await updateSettings((x) => ({ ...x, profile: { ...x.profile, startWeightKg: 130 } }), db);
    expect((await getSettings(db)).profile.startWeightKg).toBe(130);
  });

  it("استئناف الحصة غير المكتملة دون فقدان البيانات", async () => {
    const sess = getSession("w01-A")!;
    let w = await startOrResumeWorkout(sess, "2026-10-31", db);
    w = updateSet(w, 0, 0, { weight: 40, reps: 12, rpe: 6, done: true });
    await saveWorkout(w, db);
    // محاكاة إغلاق التطبيق ثم فتحه
    const resumed = await startOrResumeWorkout(sess, "2026-10-31", db);
    expect(resumed.id).toBe(w.id);
    expect(resumed.entries[0].sets[0]).toMatchObject({ weight: 40, reps: 12, rpe: 6, done: true });
    expect(workoutCompletion(resumed).doneSets).toBe(1);
  });

  it("البديل يغيّر الحصة الحالية فقط ويحتفظ بالأصلي", async () => {
    const sess = getSession("w01-A")!;
    let w = await startOrResumeWorkout(sess, "2026-10-31", db);
    w = substituteInWorkout(w, 0, "goblet_box_squat", "الجهاز غير موجود");
    expect(w.entries[0].exerciseId).toBe("goblet_box_squat");
    expect(w.entries[0].plannedExerciseId).toBe("leg_press");
    expect(w.planSnapshot.exercises[0].exerciseId).toBe("leg_press");
    expect(getSession("w01-A")!.exercises[0].exerciseId).toBe("leg_press");
    w = await finishWorkout(w, db);
    expect(w.status).toBe("completed");
  });

  it("تعديل تمارين حصة لا يغير البرنامج الأساسي ويمكن استرجاعه", async () => {
    const orig = getSession("w02-B")!;
    await patchOverride("w02-B", { exercises: orig.exercises.slice(1) }, db);
    expect((await db.overrides.get("w02-B"))!.exercises).toHaveLength(orig.exercises.length - 1);
    expect(getSession("w02-B")!.exercises).toHaveLength(orig.exercises.length);
    await patchOverride("w02-B", { rescheduledDate: "2026-11-10" }, db);
    await resetSessionExercises("w02-B", db);
    const ov = (await db.overrides.get("w02-B"))!;
    expect(ov.exercises).toBeUndefined();
    expect(ov.rescheduledDate).toBe("2026-11-10");
  });

  it("تصدير واستيراد نسخة احتياطية (دمج لا يحذف)", async () => {
    const sess = getSession("w01-A")!;
    const w = await startOrResumeWorkout(sess, "2026-10-31", db);
    await db.measurements.put({ id: "m1", date: "2026-10-31", weightKg: 132.4, waistCm: null, hipCm: null, chestCm: null, armCm: null, thighCm: null, bpSys: null, bpDia: null, restingHr: null, notes: "", createdAt: 1 });
    const backup = JSON.parse(JSON.stringify(await exportBackup(db)));
    const valid = validateBackup(backup);

    const db2 = new GymDB("test2-" + Math.random());
    await db2.measurements.put({ id: "m-existing", date: "2026-11-01", weightKg: 131, waistCm: null, hipCm: null, chestCm: null, armCm: null, thighCm: null, bpSys: null, bpDia: null, restingHr: null, notes: "", createdAt: 2 });
    await importBackup(valid, "merge", db2);
    expect(await db2.measurements.count()).toBe(2);
    expect((await db2.workouts.get(w.id))?.sessionId).toBe("w01-A");
    await importBackup(valid, "replace", db2);
    expect(await db2.measurements.count()).toBe(1);
  });

  it("رفض الملفات غير الصالحة", () => {
    expect(() => validateBackup({})).toThrow(BackupError);
    expect(() => validateBackup({ format: "amr-healthy-life-backup", version: 99, data: {} })).toThrow(BackupError);
    expect(() => validateBackup({ format: "amr-healthy-life-backup", version: 1, data: { workouts: [{ id: "x" }] } })).toThrow(BackupError);
  });

  it("CSV يهرب الفواصل وعلامات الاقتباس", async () => {
    expect(toCSV([["a,b", 'c"d', null]])).toBe('﻿"a,b","c""d",');
    const sess = getSession("w01-A")!;
    let w = await startOrResumeWorkout(sess, "2026-10-31", db);
    w = updateSet(w, 0, 0, { weight: 40, reps: 12, done: true });
    const csv = workoutsToCSV([w], (id) => ({ ar: id, en: id }));
    expect(csv.split("\r\n")[1]).toContain("leg_press");
    expect(csv).toContain(",40,12,");
  });
});
