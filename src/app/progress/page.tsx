"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BarTrend, LineTrend } from "@/components/Charts";
import { IconTrash } from "@/components/icons";
import { Alert, Loading, Modal, NumberField, PageHeader, PainScale, Section, Stat } from "@/components/ui";
import { db, uid } from "@/lib/db";
import { formatDateMedium, formatMonth, isValidISODate } from "@/lib/dates";
import { useExercises, useMeasurements, useSchedule, useWellness, useWorkouts } from "@/lib/hooks";
import { programProgress } from "@/lib/schedule";
import { bmi, cardioMinutes, doneSets, exerciseHistory, exercisesWithHistory, latestWeight, setVolume, weeklyAdherence } from "@/lib/stats";
import type { Measurement } from "@/lib/types";

type MForm = Omit<Measurement, "id" | "createdAt">;

function emptyM(today: string): MForm {
  return { date: today, weightKg: null, waistCm: null, hipCm: null, chestCm: null, armCm: null, thighCm: null, bpSys: null, bpDia: null, restingHr: null, notes: "" };
}

function MeasurementForm({ today }: { today: string }) {
  const [f, setF] = useState<MForm>(emptyM(today));
  const [msg, setMsg] = useState("");
  const set = (k: keyof MForm, v: MForm[keyof MForm]) => setF((p) => ({ ...p, [k]: v }));
  const hasValue = [f.weightKg, f.waistCm, f.hipCm, f.chestCm, f.armCm, f.thighCm, f.bpSys, f.bpDia, f.restingHr].some((x) => x != null) || f.notes.trim();
  return (
    <div className="card space-y-3" id="add-measurement">
      <div>
        <label className="label" htmlFor="m-date">التاريخ</label>
        <input id="m-date" type="date" className="input ltr" value={f.date} max={today} onChange={(e) => set("date", e.target.value)} />
      </div>
      <NumberField label="الوزن (كجم)" value={f.weightKg} step={0.1} onChange={(v) => set("weightKg", v)} testId="m-weight" />
      <details>
        <summary className="cursor-pointer text-sm font-medium">قياسات إضافية (اختيارية)</summary>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <NumberField label="الوسط (سم)" value={f.waistCm} step={0.5} onChange={(v) => set("waistCm", v)} />
          <NumberField label="الحوض (سم)" value={f.hipCm} step={0.5} onChange={(v) => set("hipCm", v)} />
          <NumberField label="الصدر (سم)" value={f.chestCm} step={0.5} onChange={(v) => set("chestCm", v)} />
          <NumberField label="الذراع (سم)" value={f.armCm} step={0.5} onChange={(v) => set("armCm", v)} />
          <NumberField label="الفخذ (سم)" value={f.thighCm} step={0.5} onChange={(v) => set("thighCm", v)} />
          <NumberField label="نبض الراحة" value={f.restingHr} step={1} onChange={(v) => set("restingHr", v)} />
          <NumberField label="الضغط الانقباضي" value={f.bpSys} step={1} onChange={(v) => set("bpSys", v)} />
          <NumberField label="الضغط الانبساطي" value={f.bpDia} step={1} onChange={(v) => set("bpDia", v)} />
        </div>
        <p className="mt-2 text-xs text-muted">قراءات الضغط تُحفظ لمشاركتها مع طبيبك؛ التطبيق لا يفسرها.</p>
      </details>
      <div>
        <label className="label" htmlFor="m-notes">ملاحظات</label>
        <input id="m-notes" className="input" value={f.notes} onChange={(e) => set("notes", e.target.value)} />
      </div>
      <button
        className="btn-primary w-full"
        disabled={!hasValue || !isValidISODate(f.date) || f.date > today}
        data-testid="save-measurement"
        onClick={async () => {
          await db.measurements.put({ ...f, notes: f.notes.trim(), id: uid("m_"), createdAt: Date.now() });
          setF(emptyM(today));
          setMsg("تم حفظ القياس.");
          setTimeout(() => setMsg(""), 2500);
        }}
      >
        حفظ القياس
      </button>
      {msg && <p className="text-sm text-brand-700 dark:text-brand-400" role="status">{msg}</p>}
    </div>
  );
}

function WellnessForm({ today }: { today: string }) {
  const [date, setDate] = useState(today);
  const [knee, setKnee] = useState<number | null>(null);
  const [back, setBack] = useState<number | null>(null);
  const [sleep, setSleep] = useState<number | null>(null);
  const [fatigue, setFatigue] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState("");
  return (
    <div className="card space-y-3">
      <div>
        <label className="label" htmlFor="wl-date">التاريخ</label>
        <input id="wl-date" type="date" className="input ltr" value={date} max={today} onChange={(e) => setDate(e.target.value)} />
      </div>
      <PainScale label="ألم الركبة" value={knee} onChange={setKnee} />
      <PainScale label="ألم الظهر" value={back} onChange={setBack} />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label" htmlFor="wl-sleep">جودة النوم (1-5)</label>
          <select id="wl-sleep" className="input" value={sleep ?? ""} onChange={(e) => setSleep(e.target.value ? Number(e.target.value) : null)}>
            <option value="">—</option>
            {[1, 2, 3, 4, 5].map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="wl-fat">الإرهاق (1-5)</label>
          <select id="wl-fat" className="input" value={fatigue ?? ""} onChange={(e) => setFatigue(e.target.value ? Number(e.target.value) : null)}>
            <option value="">—</option>
            {[1, 2, 3, 4, 5].map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </div>
      </div>
      <input className="input" placeholder="ملاحظات التعافي" value={notes} onChange={(e) => setNotes(e.target.value)} aria-label="ملاحظات التعافي" />
      <button
        className="btn-secondary w-full"
        disabled={knee == null && back == null && sleep == null && fatigue == null && !notes.trim()}
        onClick={async () => {
          await db.wellness.put({ id: uid("wl_"), date, kneePain: knee, backPain: back, sleepQuality: sleep, fatigue, notes: notes.trim(), createdAt: Date.now() });
          setKnee(null);
          setBack(null);
          setSleep(null);
          setFatigue(null);
          setNotes("");
          setMsg("تم الحفظ.");
          setTimeout(() => setMsg(""), 2500);
        }}
      >
        حفظ سجل التعافي
      </button>
      {msg && <p className="text-sm text-brand-700 dark:text-brand-400" role="status">{msg}</p>}
      {(knee ?? 0) >= 7 || (back ?? 0) >= 7 ? <Alert tone="red">ألم مرتفع. إذا استمر أو صاحبه أعراض أخرى اطلب تقييمًا متخصصًا، وراجع صفحة السلامة.</Alert> : null}
    </div>
  );
}

export default function ProgressPage() {
  const { schedule, loaded, today, settings } = useSchedule();
  const workouts = useWorkouts();
  const measurements = useMeasurements();
  const wellness = useWellness();
  const { map } = useExercises();
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
        title="متابعة التقدم"
        actions={
          <Link href="/reports/" className="btn-secondary px-3 text-sm">
            التقارير
          </Link>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3">
        <Stat label="الحصص المكتملة" value={`${prog.completed} / ${prog.total}`} hint={`${prog.pct}% من البرنامج`} />
        <Stat label="متوسط الالتزام الأسبوعي" value={avgAdh == null ? "—" : `${avgAdh}%`} hint={adherence.length ? `على ${adherence.length} أسبوع بدأ` : "البرنامج لم يبدأ بعد"} />
        <Stat label="إجمالي الكارديو" value={`${cardioMinutes(completed)} دقيقة`} />
        <Stat
          label="آخر وزن"
          value={<span className="ltr">{lw ? lw.weightKg : p.startWeightKg} كجم</span>}
          hint={lw ? `${formatDateMedium(lw.date)} · BMI ${bmi(lw.weightKg!, p.heightCm)}` : "الوزن الابتدائي من الإعدادات"}
        />
      </div>

      <Section title="الوزن والقياسات">
        <div className="mb-3">
          <Alert tone="blue">
            تغيّر الوزن من يوم لآخر يتأثر بالماء والملح والطعام، ولا يعني بالضرورة زيادة أو نقصًا في الدهون. ولا يعتبر نزول الوزن وحده دليلًا على نجاح البرنامج؛ انظر أيضًا لمحيط الوسط والقوة والالتزام والتعافي.
          </Alert>
        </div>
        <div className="space-y-3">
          <LineTrend title="تغيّر الوزن (كجم)" data={weightData} series={[{ key: "weight", label: "الوزن", color: "var(--series-1)" }]} unit="" />
          {waistData.length > 0 && <LineTrend title="محيط الوسط (سم)" data={waistData} series={[{ key: "waist", label: "الوسط", color: "var(--series-1)" }]} />}
          <MeasurementForm today={today} />
          {measurements.length > 0 && (
            <div className="card">
              <div className="mb-2 font-bold">سجل القياسات</div>
              <ul className="max-h-72 overflow-auto" data-testid="measurement-list">
                {[...measurements]
                  .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
                  .map((m, i, arr) => {
                    const prevW = arr.slice(i + 1).find((x) => x.weightKg != null)?.weightKg;
                    const delta = m.weightKg != null && prevW != null ? Math.round((m.weightKg - prevW) * 10) / 10 : null;
                    return (
                      <li key={m.id} className="flex items-center gap-2 border-b border-base py-2 text-sm last:border-0">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium">{formatDateMedium(m.date)}</div>
                          <div className="text-muted">
                            {m.weightKg != null && <span className="ltr">{m.weightKg} kg </span>}
                            {delta != null && <span className="ltr">({delta > 0 ? "+" : ""}{delta}) </span>}
                            {m.waistCm != null && <>· وسط {m.waistCm} </>}
                            {m.bpSys != null && <>· ضغط {m.bpSys}/{m.bpDia ?? "-"} </>}
                            {m.notes && <>· {m.notes}</>}
                          </div>
                        </div>
                        <button className="btn-ghost min-h-9 px-2 text-red-600" aria-label="حذف القياس" onClick={() => setDelId(m.id)}>
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

      <Section title="الالتزام">
        <BarTrend title="نسبة الالتزام الأسبوعي (%)" data={adherence.map((a) => ({ week: a.week, pct: a.pct }))} xKey="week" series={[{ key: "pct", label: "الالتزام", color: "var(--series-1)" }]} unit="%" xLabel={(v) => `أ${v}`} domain={[0, 100]} />
      </Section>

      <Section title="تطور التمارين">
        {withHistory.length === 0 ? (
          <div className="card text-sm text-muted">سجّل حصة مكتملة لتظهر هنا تطورات الأوزان والتكرارات.</div>
        ) : (
          <div className="space-y-3">
            <select className="input" value={selected} onChange={(e) => setExId(e.target.value)} aria-label="اختر التمرين">
              {withHistory.map((id) => (
                <option key={id} value={id}>
                  {map[id]?.nameAr ?? id}
                </option>
              ))}
            </select>
            <LineTrend title="أعلى وزن مستخدم (كجم)" data={history} series={[{ key: "maxWeight", label: "أعلى وزن", color: "var(--series-1)" }]} />
            <BarTrend title="إجمالي التكرارات في الحصة" data={history} xKey="date" series={[{ key: "totalReps", label: "التكرارات", color: "var(--series-1)" }]} xLabel={(v) => v.slice(5)} />
            <BarTrend title="عدد المجموعات المكتملة" data={history} xKey="date" series={[{ key: "sets", label: "المجموعات", color: "var(--series-1)" }]} xLabel={(v) => v.slice(5)} />
          </div>
        )}
      </Section>

      <Section title="سجل الألم والتعافي">
        <div className="space-y-3">
          <LineTrend
            title="أعلى ألم مسجل يوميًا (0-10)"
            data={painData}
            series={[
              { key: "knee", label: "الركبة", color: "var(--series-1)" },
              { key: "back", label: "الظهر", color: "var(--series-2)" },
            ]}
            domain={[0, 10]}
          />
          <WellnessForm today={today} />
        </div>
      </Section>

      <Section title="مقارنة الأسابيع">
        <div className="card overflow-x-auto">
          {weekRows.length === 0 ? (
            <div className="text-sm text-muted">لا توجد بيانات بعد.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-muted">
                <tr>
                  <th className="p-1 text-start">الأسبوع</th>
                  <th className="p-1 text-start">الحصص</th>
                  <th className="p-1 text-start">المجموعات</th>
                  <th className="p-1 text-start">الحجم (كجم)</th>
                  <th className="p-1 text-start">كارديو</th>
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

      <Section title="مقارنة الأشهر">
        <div className="card overflow-x-auto">
          {monthRows.length === 0 ? (
            <div className="text-sm text-muted">لا توجد بيانات بعد.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-muted">
                <tr>
                  <th className="p-1 text-start">الشهر</th>
                  <th className="p-1 text-start">الحصص</th>
                  <th className="p-1 text-start">المجموعات</th>
                  <th className="p-1 text-start">الحجم (كجم)</th>
                  <th className="p-1 text-start">كارديو</th>
                </tr>
              </thead>
              <tbody>
                {monthRows.map(([m, r]) => (
                  <tr key={m} className="border-t border-base">
                    <td className="p-1">{formatMonth(`${m}-01`)}</td>
                    <td className="p-1">{r.sessions}</td>
                    <td className="p-1">{r.sets}</td>
                    <td className="ltr p-1 text-start">{r.volume}</td>
                    <td className="p-1">{r.cardio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="mt-2 text-xs text-muted">الحجم = مجموع (الوزن × التكرارات) للمجموعات المكتملة. لا يقارن بدقة بين أجهزة مختلفة.</p>
        </div>
      </Section>

      <Modal
        open={!!delId}
        onClose={() => setDelId(null)}
        title="حذف القياس"
        footer={
          <div className="grid grid-cols-2 gap-2">
            <button className="btn-secondary" onClick={() => setDelId(null)}>رجوع</button>
            <button
              className="btn-danger"
              onClick={async () => {
                if (delId) await db.measurements.delete(delId);
                setDelId(null);
              }}
            >
              حذف
            </button>
          </div>
        }
      >
        هل تريد حذف هذا القياس نهائيًا؟ يُنصح بتصدير نسخة احتياطية أولًا.
      </Modal>
    </div>
  );
}
