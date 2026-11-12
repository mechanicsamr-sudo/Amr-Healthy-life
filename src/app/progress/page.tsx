"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BarTrend, LineTrend } from "@/components/Charts";
import { IconTrash } from "@/components/icons";
import { Alert, Choice, Loading, Modal, NumberField, PageHeader, Section, Stat } from "@/components/ui";
import { db, uid } from "@/lib/db";
import { formatDateMedium, formatMonth, isValidISODate } from "@/lib/dates";
import { exerciseText } from "@/lib/exerciseText";
import { PAIN_LEVELS, painLevelOf } from "@/lib/health";
import { useExercises, useMeasurements, useSchedule, useWellness, useWorkouts } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { programProgress } from "@/lib/schedule";
import { bmi, cardioMinutes, doneSets, exerciseHistory, exercisesWithHistory, latestWeight, setVolume, weeklyAdherence } from "@/lib/stats";
import type { Measurement } from "@/lib/types";

type MForm = Omit<Measurement, "id" | "createdAt">;

function emptyM(today: string): MForm {
  return { date: today, weightKg: null, waistCm: null, hipCm: null, chestCm: null, armCm: null, thighCm: null, bpSys: null, bpDia: null, restingHr: null, notes: "" };
}

function MeasurementForm({ today }: { today: string }) {
  const { L } = useI18n();
  const [f, setF] = useState<MForm>(emptyM(today));
  const [msg, setMsg] = useState("");
  const set = (k: keyof MForm, v: MForm[keyof MForm]) => setF((p) => ({ ...p, [k]: v }));
  const hasValue = [f.weightKg, f.waistCm, f.hipCm, f.chestCm, f.armCm, f.thighCm, f.bpSys, f.bpDia, f.restingHr].some((x) => x != null) || f.notes.trim();
  return (
    <div className="card space-y-3" id="add-measurement">
      <div>
        <label className="label" htmlFor="m-date">{L("التاريخ", "Date")}</label>
        <input id="m-date" type="date" className="input ltr" value={f.date} max={today} onChange={(e) => set("date", e.target.value)} />
      </div>
      <NumberField label={L("الوزن (كجم)", "Weight (kg)")} value={f.weightKg} step={0.1} onChange={(v) => set("weightKg", v)} testId="m-weight" />
      <details>
        <summary className="cursor-pointer text-sm font-medium">{L("قياسات إضافية (اختيارية)", "More measurements (optional)")}</summary>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <NumberField label={L("الوسط (سم)", "Waist (cm)")} value={f.waistCm} step={0.5} onChange={(v) => set("waistCm", v)} />
          <NumberField label={L("الحوض (سم)", "Hips (cm)")} value={f.hipCm} step={0.5} onChange={(v) => set("hipCm", v)} />
          <NumberField label={L("الصدر (سم)", "Chest (cm)")} value={f.chestCm} step={0.5} onChange={(v) => set("chestCm", v)} />
          <NumberField label={L("الذراع (سم)", "Arm (cm)")} value={f.armCm} step={0.5} onChange={(v) => set("armCm", v)} />
          <NumberField label={L("الفخذ (سم)", "Thigh (cm)")} value={f.thighCm} step={0.5} onChange={(v) => set("thighCm", v)} />
          <NumberField label={L("نبض الراحة", "Resting HR")} value={f.restingHr} step={1} onChange={(v) => set("restingHr", v)} />
          <NumberField label={L("الضغط الانقباضي", "Systolic BP")} value={f.bpSys} step={1} onChange={(v) => set("bpSys", v)} />
          <NumberField label={L("الضغط الانبساطي", "Diastolic BP")} value={f.bpDia} step={1} onChange={(v) => set("bpDia", v)} />
        </div>
        <p className="mt-2 text-xs text-muted">{L("قراءات الضغط تُحفظ لمشاركتها مع طبيبك؛ التطبيق لا يفسرها.", "BP readings are stored to share with your doctor; the app doesn't interpret them.")}</p>
      </details>
      <div>
        <label className="label" htmlFor="m-notes">{L("ملاحظات", "Notes")}</label>
        <input id="m-notes" className="input" value={f.notes} onChange={(e) => set("notes", e.target.value)} />
      </div>
      <button
        className="btn-primary w-full"
        disabled={!hasValue || !isValidISODate(f.date) || f.date > today}
        data-testid="save-measurement"
        onClick={async () => {
          await db.measurements.put({ ...f, notes: f.notes.trim(), id: uid("m_"), createdAt: Date.now() });
          setF(emptyM(today));
          setMsg(L("تم حفظ القياس.", "Measurement saved."));
          setTimeout(() => setMsg(""), 2500);
        }}
      >
        {L("حفظ القياس", "Save measurement")}
      </button>
      {msg && <p className="text-sm text-accent" role="status">{msg}</p>}
    </div>
  );
}

function WellnessForm({ today }: { today: string }) {
  const { L, pick } = useI18n();
  const [date, setDate] = useState(today);
  const [knee, setKnee] = useState<number | null>(null);
  const [back, setBack] = useState<number | null>(null);
  const [sleep, setSleep] = useState<number | null>(null);
  const [fatigue, setFatigue] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState("");
  const painOpts = PAIN_LEVELS.map((p) => ({ id: p.id, label: pick(p.label), emoji: p.emoji, danger: p.id === "severe" }));
  const toNum = (id: string | null) => (id == null ? null : (PAIN_LEVELS.find((p) => p.id === id)?.value ?? null));
  const SLEEP = [
    { id: "5", label: L("ممتاز", "Excellent") },
    { id: "4", label: L("جيد", "Good") },
    { id: "3", label: L("متوسط", "Average") },
    { id: "1", label: L("سيئ", "Poor") },
  ];
  const FATIGUE = [
    { id: "1", label: L("مرتاح", "Fresh") },
    { id: "3", label: L("متعب شوية", "A bit tired") },
    { id: "5", label: L("مرهق جدًا", "Very tired") },
  ];
  return (
    <div className="card space-y-3">
      <div>
        <label className="label" htmlFor="wl-date">{L("التاريخ", "Date")}</label>
        <input id="wl-date" type="date" className="input ltr" value={date} max={today} onChange={(e) => setDate(e.target.value)} />
      </div>
      <Choice label={L("ألم الركبة", "Knee pain")} cols={2} options={painOpts} value={painLevelOf(knee)} onChange={(v) => setKnee(toNum(v))} testId="wl-knee" />
      <Choice label={L("ألم الظهر", "Back pain")} cols={2} options={painOpts} value={painLevelOf(back)} onChange={(v) => setBack(toNum(v))} testId="wl-back" />
      <Choice label={L("جودة النوم", "Sleep quality")} cols={4} options={SLEEP} value={sleep == null ? null : String(sleep)} onChange={(v) => setSleep(v ? Number(v) : null)} />
      <Choice label={L("الإرهاق", "Fatigue")} cols={3} options={FATIGUE} value={fatigue == null ? null : String(fatigue)} onChange={(v) => setFatigue(v ? Number(v) : null)} />
      <input className="input" placeholder={L("ملاحظات التعافي", "Recovery notes")} value={notes} onChange={(e) => setNotes(e.target.value)} aria-label={L("ملاحظات التعافي", "Recovery notes")} />
      <button
        className="btn-secondary w-full"
        disabled={knee == null && back == null && sleep == null && fatigue == null && !notes.trim()}
        data-testid="save-wellness"
        onClick={async () => {
          await db.wellness.put({ id: uid("wl_"), date, kneePain: knee, backPain: back, sleepQuality: sleep, fatigue, notes: notes.trim(), createdAt: Date.now() });
          setKnee(null);
          setBack(null);
          setSleep(null);
          setFatigue(null);
          setNotes("");
          setMsg(L("تم الحفظ.", "Saved."));
          setTimeout(() => setMsg(""), 2500);
        }}
      >
        {L("حفظ سجل التعافي", "Save recovery log")}
      </button>
      {msg && <p className="text-sm text-accent" role="status">{msg}</p>}
      {(knee ?? 0) >= 7 || (back ?? 0) >= 7 ? (
        <Alert tone="red">
          {L("ألم شديد. لو استمر أو صاحبه أعراض تانية اطلب تقييم متخصص، وراجع صفحة السلامة.", "Severe pain. If it persists or comes with other symptoms, get a specialist assessment and check the Safety page.")}
        </Alert>
      ) : null}
    </div>
  );
}

export default function ProgressPage() {
  const { schedule, loaded, today, settings } = useSchedule();
  const workouts = useWorkouts();
  const measurements = useMeasurements();
  const wellness = useWellness();
  const { map } = useExercises();
  const { L, lang } = useI18n();
  const [exId, setExId] = useState<string>("");
  const [delId, setDelId] = useState<string | null>(null);

  const completed = useMemo(() => (workouts ?? []).filter((w) => w.status === "completed").sort((a, b) => a.date.localeCompare(b.date)), [workouts]);
  const withHistory = useMemo(() => exercisesWithHistory(completed), [completed]);
  const selected = exId || withHistory[0] || "";
  const history = useMemo(() => (selected ? exerciseHistory(completed, selected) : []), [completed, selected]);

  if (!loaded || !workouts || !measurements || !wellness) return <Loading />;

  const p = settings.profile;
  const prog = programProgress(schedule);
  const adherence = weeklyAdherence(schedule, today);
  const avgAdh = adherence.length ? Math.round(adherence.reduce((a, b) => a + b.pct, 0) / adherence.length) : null;
  const weights = measurements.filter((m) => m.weightKg != null).sort((a, b) => a.date.localeCompare(b.date) || a.createdAt - b.createdAt);
  const lw = latestWeight(measurements);
  const weightData = weights.map((m) => ({ date: m.date, weight: m.weightKg }));
  const waistData = measurements.filter((m) => m.waistCm != null).sort((a, b) => a.date.localeCompare(b.date)).map((m) => ({ date: m.date, waist: m.waistCm }));

  // سجل الألم: من الحصص (قبل/بعد) ومن سجل التعافي اليومي
  const painByDate = new Map<string, { knee: number[]; back: number[] }>();
  const push = (d: string, k: number | null, b: number | null) => {
    const e = painByDate.get(d) ?? { knee: [], back: [] };
    if (k != null) e.knee.push(k);
    if (b != null) e.back.push(b);
    painByDate.set(d, e);
  };
  completed.forEach((w) => {
    push(w.date, w.painAfter.knee ?? w.painBefore.knee, w.painAfter.back ?? w.painBefore.back);
    w.entries.forEach((e) => push(w.date, e.kneePain, e.backPain));
  });
  wellness.forEach((x) => push(x.date, x.kneePain, x.backPain));
  const maxOr = (xs: number[]) => (xs.length ? Math.max(...xs) : null);
  const painData = [...painByDate.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, v]) => ({ date, knee: maxOr(v.knee), back: maxOr(v.back) }))
    .filter((x) => x.knee != null || x.back != null);

  // مقارنة الأسابيع والأشهر
  const byWeek = new Map<number, { sessions: number; sets: number; volume: number; cardio: number }>();
  completed.forEach((w) => {
    const k = w.planSnapshot.week;
    const e = byWeek.get(k) ?? { sessions: 0, sets: 0, volume: 0, cardio: 0 };
    e.sessions++;
    e.sets += doneSets(w);
    e.volume += setVolume(w);
    e.cardio += cardioMinutes([w]);
    byWeek.set(k, e);
  });
  const weekRows = [...byWeek.entries()].sort((a, b) => a[0] - b[0]);
  const byMonth = new Map<string, { sessions: number; sets: number; volume: number; cardio: number }>();
  completed.forEach((w) => {
    const k = w.date.slice(0, 7);
    const e = byMonth.get(k) ?? { sessions: 0, sets: 0, volume: 0, cardio: 0 };
    e.sessions++;
    e.sets += doneSets(w);
    e.volume += setVolume(w);
    e.cardio += cardioMinutes([w]);
    byMonth.set(k, e);
  });
  const monthRows = [...byMonth.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div>
      <PageHeader
        display
        title={L("التقدم", "Progress")}
        actions={
          <Link href="/reports/" className="btn-secondary px-3 text-sm">
            {L("التقارير", "Reports")}
          </Link>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3">
        <Stat label={L("الحصص المكتملة", "Sessions done")} value={`${prog.completed} / ${prog.total}`} hint={L(`${prog.pct}% من البرنامج`, `${prog.pct}% of the program`)} />
        <Stat label={L("متوسط الالتزام الأسبوعي", "Avg weekly adherence")} value={avgAdh == null ? "—" : `${avgAdh}%`} hint={adherence.length ? L(`على ${adherence.length} أسبوع بدأ`, `over ${adherence.length} started weeks`) : L("البرنامج لم يبدأ بعد", "Program hasn't started yet")} />
        <Stat label={L("إجمالي الكارديو", "Total cardio")} value={`${cardioMinutes(completed)} ${L("دقيقة", "min")}`} />
        <Stat
          label={L("آخر وزن", "Latest weight")}
          value={<span className="ltr">{lw ? lw.weightKg : p.startWeightKg} kg</span>}
          hint={lw ? `${formatDateMedium(lw.date, lang)} · BMI ${bmi(lw.weightKg!, p.heightCm)}` : L("الوزن الابتدائي من الإعدادات", "Starting weight from Settings")}
        />
      </div>

      <Section title={L("الوزن والقياسات", "Weight & measurements")}>
        <div className="mb-3">
          <Alert tone="blue">
            {L(
              "تغيّر الوزن من يوم لآخر يتأثر بالماء والملح والطعام، ولا يعني بالضرورة زيادة أو نقصًا في الدهون. ولا يعتبر نزول الوزن وحده دليلًا على نجاح البرنامج؛ انظر أيضًا لمحيط الوسط والقوة والالتزام والتعافي.",
              "Day-to-day weight changes are affected by water, salt and food and don't necessarily mean fat gain or loss. Weight loss alone isn't proof the program works; also look at waist, strength, adherence and recovery.",
            )}
          </Alert>
        </div>
        <div className="space-y-3">
          <LineTrend title={L("تغيّر الوزن (كجم)", "Weight (kg)")} data={weightData} series={[{ key: "weight", label: L("الوزن", "Weight"), color: "var(--series-1)" }]} unit="" />
          {waistData.length > 0 && <LineTrend title={L("محيط الوسط (سم)", "Waist (cm)")} data={waistData} series={[{ key: "waist", label: L("الوسط", "Waist"), color: "var(--series-1)" }]} />}
          <MeasurementForm today={today} />
          {measurements.length > 0 && (
            <div className="card">
              <div className="mb-2 font-bold">{L("سجل القياسات", "Measurement log")}</div>
              <ul className="max-h-72 overflow-auto" data-testid="measurement-list">
                {[...measurements]
                  .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
                  .map((m, i, arr) => {
                    const prevW = arr.slice(i + 1).find((x) => x.weightKg != null)?.weightKg;
                    const delta = m.weightKg != null && prevW != null ? Math.round((m.weightKg - prevW) * 10) / 10 : null;
                    return (
                      <li key={m.id} className="flex items-center gap-2 border-b border-base py-2 text-sm last:border-0">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium">{formatDateMedium(m.date, lang)}</div>
                          <div className="text-muted">
                            {m.weightKg != null && <span className="ltr">{m.weightKg} kg </span>}
                            {delta != null && <span className="ltr">({delta > 0 ? "+" : ""}{delta}) </span>}
                            {m.waistCm != null && <>· {L("وسط", "waist")} {m.waistCm} </>}
                            {m.bpSys != null && <>· {L("ضغط", "BP")} {m.bpSys}/{m.bpDia ?? "-"} </>}
                            {m.notes && <>· {m.notes}</>}
                          </div>
                        </div>
                        <button className="btn-ghost min-h-9 px-2 text-red-600" aria-label={L("حذف القياس", "Delete measurement")} onClick={() => setDelId(m.id)}>
                          <IconTrash size={18} />
                        </button>
                      </li>
                    );
                  })}
              </ul>
            </div>
          )}
        </div>
      </Section>

      <Section title={L("الالتزام", "Adherence")}>
        <BarTrend title={L("نسبة الالتزام الأسبوعي (%)", "Weekly adherence (%)")} data={adherence.map((a) => ({ week: a.week, pct: a.pct }))} xKey="week" series={[{ key: "pct", label: L("الالتزام", "Adherence"), color: "var(--series-1)" }]} unit="%" xLabel={(v) => L(`أ${v}`, `W${v}`)} domain={[0, 100]} />
      </Section>

      <Section title={L("تطور التمارين", "Exercise progress")}>
        {withHistory.length === 0 ? (
          <div className="card text-sm text-muted">{L("سجّل حصة مكتملة لتظهر هنا تطورات الأوزان والتكرارات.", "Complete a session to see weight and rep progress here.")}</div>
        ) : (
          <div className="space-y-3">
            <select className="input" value={selected} onChange={(e) => setExId(e.target.value)} aria-label={L("اختر التمرين", "Choose exercise")}>
              {withHistory.map((id) => (
                <option key={id} value={id}>
                  {map[id] ? exerciseText(map[id], lang).name : id}
                </option>
              ))}
            </select>
            <LineTrend title={L("أعلى وزن مستخدم (كجم)", "Top weight used (kg)")} data={history} series={[{ key: "maxWeight", label: L("أعلى وزن", "Top weight"), color: "var(--series-1)" }]} />
            <BarTrend title={L("إجمالي التكرارات في الحصة", "Total reps per session")} data={history} xKey="date" series={[{ key: "totalReps", label: L("التكرارات", "Reps"), color: "var(--series-1)" }]} xLabel={(v) => v.slice(5)} />
            <BarTrend title={L("عدد المجموعات المكتملة", "Completed sets")} data={history} xKey="date" series={[{ key: "sets", label: L("المجموعات", "Sets"), color: "var(--series-1)" }]} xLabel={(v) => v.slice(5)} />
          </div>
        )}
      </Section>

      <Section title={L("سجل الألم والتعافي", "Pain & recovery log")}>
        <div className="space-y-3">
          <LineTrend
            title={L("أعلى ألم مسجل يوميًا (0-10)", "Highest daily pain (0-10)")}
            data={painData}
            series={[
              { key: "knee", label: L("الركبة", "Knee"), color: "var(--series-1)" },
              { key: "back", label: L("الظهر", "Back"), color: "var(--series-2)" },
            ]}
            domain={[0, 10]}
          />
          <WellnessForm today={today} />
        </div>
      </Section>

      <Section title={L("مقارنة الأسابيع", "Week comparison")}>
        <div className="card overflow-x-auto">
          {weekRows.length === 0 ? (
            <div className="text-sm text-muted">{L("لا توجد بيانات بعد.", "No data yet.")}</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-muted">
                <tr>
                  <th className="p-1 text-start">{L("الأسبوع", "Week")}</th>
                  <th className="p-1 text-start">{L("الحصص", "Sessions")}</th>
                  <th className="p-1 text-start">{L("المجموعات", "Sets")}</th>
                  <th className="p-1 text-start">{L("الحجم (كجم)", "Volume (kg)")}</th>
                  <th className="p-1 text-start">{L("كارديو", "Cardio")}</th>
                </tr>
              </thead>
              <tbody>
                {weekRows.map(([wk, r]) => (
                  <tr key={wk} className="border-t border-base">
                    <td className="p-1">{wk}</td>
                    <td className="p-1">{r.sessions}</td>
                    <td className="p-1">{r.sets}</td>
                    <td className="ltr p-1 text-start">{r.volume}</td>
                    <td className="p-1">{r.cardio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Section>

      <Section title={L("مقارنة الأشهر", "Month comparison")}>
        <div className="card overflow-x-auto">
          {monthRows.length === 0 ? (
            <div className="text-sm text-muted">{L("لا توجد بيانات بعد.", "No data yet.")}</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-muted">
                <tr>
                  <th className="p-1 text-start">{L("الشهر", "Month")}</th>
                  <th className="p-1 text-start">{L("الحصص", "Sessions")}</th>
                  <th className="p-1 text-start">{L("المجموعات", "Sets")}</th>
                  <th className="p-1 text-start">{L("الحجم (كجم)", "Volume (kg)")}</th>
                  <th className="p-1 text-start">{L("كارديو", "Cardio")}</th>
                </tr>
              </thead>
              <tbody>
                {monthRows.map(([m, r]) => (
                  <tr key={m} className="border-t border-base">
                    <td className="p-1">{formatMonth(`${m}-01`, lang)}</td>
                    <td className="p-1">{r.sessions}</td>
                    <td className="p-1">{r.sets}</td>
                    <td className="ltr p-1 text-start">{r.volume}</td>
                    <td className="p-1">{r.cardio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="mt-2 text-xs text-muted">{L("الحجم = مجموع (الوزن × التكرارات) للمجموعات المكتملة. لا يقارن بدقة بين أجهزة مختلفة.", "Volume = sum of (weight × reps) for completed sets. Not precisely comparable across machines.")}</p>
        </div>
      </Section>

      <Modal
        open={!!delId}
        onClose={() => setDelId(null)}
        title={L("حذف القياس", "Delete measurement")}
        footer={
          <div className="grid grid-cols-2 gap-2">
            <button className="btn-secondary" onClick={() => setDelId(null)}>{L("رجوع", "Back")}</button>
            <button
              className="btn-danger"
              onClick={async () => {
                if (delId) await db.measurements.delete(delId);
                setDelId(null);
              }}
            >
              {L("حذف", "Delete")}
            </button>
          </div>
        }
      >
        {L("هل تريد حذف هذا القياس نهائيًا؟ يُنصح بتصدير نسخة احتياطية أولًا.", "Delete this measurement permanently? Export a backup first.")}
      </Modal>
    </div>
  );
}
