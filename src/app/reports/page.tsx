"use client";

import { useMemo, useState } from "react";
import { IconPrint } from "@/components/icons";
import { Alert, Loading, PageHeader } from "@/components/ui";
import { phaseForWeek, PROGRAM_WEEKS } from "@/data/program";
import { addDays, formatDateLong, formatDateMedium, formatMonth, parseISODate, toISODate } from "@/lib/dates";
import { useExercises, useMeasurements, useSchedule, useWellness, useWorkouts } from "@/lib/hooks";
import { programEndDate, programWeekOf, weekRange } from "@/lib/schedule";
import { doneSets, exerciseHistory, exercisesWithHistory, summarizePeriod, type PeriodSummary } from "@/lib/stats";

type Kind = "week" | "month" | "full";

function months(start: string, end: string): string[] {
  const out: string[] = [];
  let d = parseISODate(start.slice(0, 7) + "-01");
  while (toISODate(d) <= end) {
    out.push(toISODate(d).slice(0, 7));
    d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
  }
  return out;
}

function lastDayOfMonth(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return toISODate(new Date(Date.UTC(y, m, 0)));
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-2 border-b border-base py-1.5 last:border-0">
      <span className="text-muted">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function SummaryView({ s, nameOf, full }: { s: PeriodSummary; nameOf: (id: string) => string; full: boolean }) {
  const weightDelta = s.firstWeight && s.lastWeight && s.firstWeight.id !== s.lastWeight.id ? Math.round((s.lastWeight.weightKg! - s.firstWeight.weightKg!) * 10) / 10 : null;
  const exIds = exercisesWithHistory(s.workouts);
  return (
    <div className="space-y-3" data-testid="report">
      <div className="card text-sm">
        <div className="mb-2 font-bold">الالتزام</div>
        <Row label="الحصص المخططة" value={s.plannedSessions} />
        <Row label="الحصص المكتملة" value={s.completedSessions} />
        <Row label="الحصص الفائتة" value={s.missedSessions} />
        <Row label="الحصص المتخطاة" value={s.skippedSessions} />
        <Row label="نسبة الالتزام" value={s.plannedSessions - s.skippedSessions > 0 ? `${Math.round((s.completedSessions / (s.plannedSessions - s.skippedSessions)) * 100)}%` : "—"} />
      </div>
      <div className="card text-sm">
        <div className="mb-2 font-bold">التدريب</div>
        <Row label="المجموعات المكتملة" value={s.totalSets} />
        <Row label="الحجم التدريبي" value={<span className="ltr">{s.volume} kg</span>} />
        <Row label="الكارديو" value={`${s.cardioMinutes} دقيقة`} />
        <Row label="متوسط الجهد (RPE)" value={s.avgRpe ?? "—"} />
        <Row label="عدد مرات استخدام البدائل" value={s.substitutions} />
      </div>
      <div className="card text-sm">
        <div className="mb-2 font-bold">الألم والتعافي</div>
        <Row label="متوسط ألم الركبة" value={s.avgKneePain ?? "—"} />
        <Row label="أعلى ألم للركبة" value={s.maxKneePain ?? "—"} />
        <Row label="متوسط ألم الظهر" value={s.avgBackPain ?? "—"} />
        <Row label="أعلى ألم للظهر" value={s.maxBackPain ?? "—"} />
        {s.painNotes.length > 0 && (
          <details className="mt-2">
            <summary className="cursor-pointer">الملاحظات ({s.painNotes.length})</summary>
            <ul className="mt-1 list-disc ps-5">
              {s.painNotes.map((n, i) => (
                <li key={i}>
                  {formatDateMedium(n.date)}: {n.text}
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
      <div className="card text-sm">
        <div className="mb-2 font-bold">القياسات</div>
        {s.measurements.length === 0 ? (
          <div className="text-muted">لا توجد قياسات مسجلة في هذه الفترة.</div>
        ) : (
          <>
            {s.firstWeight && <Row label={`أول وزن (${formatDateMedium(s.firstWeight.date)})`} value={<span className="ltr">{s.firstWeight.weightKg} kg</span>} />}
            {s.lastWeight && <Row label={`آخر وزن (${formatDateMedium(s.lastWeight.date)})`} value={<span className="ltr">{s.lastWeight.weightKg} kg</span>} />}
            {weightDelta != null && <Row label="الفرق" value={<span className="ltr">{weightDelta > 0 ? "+" : ""}{weightDelta} kg</span>} />}
            <p className="mt-2 text-xs text-muted">تغير الوزن وحده لا يحدد تغير الدهون ولا نجاح البرنامج.</p>
          </>
        )}
      </div>
      {exIds.length > 0 && (
        <div className="card text-sm">
          <div className="mb-2 font-bold">الأداء في التمارين {full ? "(أول ← آخر)" : ""}</div>
          <table className="w-full">
            <thead className="text-muted">
              <tr>
                <th className="p-1 text-start">التمرين</th>
                <th className="p-1 text-start">أول أعلى وزن</th>
                <th className="p-1 text-start">آخر أعلى وزن</th>
                <th className="p-1 text-start">مرات</th>
              </tr>
            </thead>
            <tbody>
              {exIds.map((id) => {
                const h = exerciseHistory(s.workouts, id);
                return (
                  <tr key={id} className="border-t border-base">
                    <td className="p-1">{nameOf(id)}</td>
                    <td className="ltr p-1 text-start">{h[0]?.maxWeight ?? "—"}</td>
                    <td className="ltr p-1 text-start">{h[h.length - 1]?.maxWeight ?? "—"}</td>
                    <td className="p-1">{h.length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {s.workouts.length > 0 && (
        <div className="card text-sm">
          <div className="mb-2 font-bold">ملخص التمارين المسجلة</div>
          {s.workouts.map((w) => (
            <div key={w.id} className="border-b border-base py-2 last:border-0">
              <div className="font-medium">
                {formatDateMedium(w.date)} – الأسبوع {w.planSnapshot.week} ({w.planSnapshot.slot}) · {doneSets(w)} مجموعة
              </div>
              <ul className="ps-3 text-xs">
                {w.entries
                  .filter((e) => e.sets.some((x) => x.done))
                  .map((e, i) => (
                    <li key={i}>
                      {nameOf(e.exerciseId)}
                      {e.substituted ? " (بديل)" : ""}:{" "}
                      <span className="ltr">
                        {e.sets
                          .filter((x) => x.done)
                          .map((x) => `${x.weight ?? "-"}×${x.reps ?? "-"}`)
                          .join(", ")}
                      </span>
                    </li>
                  ))}
                {w.cardio.done && (
                  <li>
                    كارديو: {nameOf(w.cardio.exerciseId)} {w.cardio.minutes} دقيقة
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ReportsPage() {
  const { schedule, loaded, today, settings } = useSchedule();
  const workouts = useWorkouts();
  const measurements = useMeasurements();
  const wellness = useWellness();
  const { map } = useExercises();
  const start = settings.profile.startDate;
  const end = programEndDate(start);
  const [kind, setKind] = useState<Kind>("week");
  const [week, setWeek] = useState<number | null>(null);
  const [month, setMonth] = useState<string | null>(null);
  const monthList = useMemo(() => months(start, end), [start, end]);

  if (!loaded || !workouts || !measurements || !wellness) return <Loading />;
  const curWeek = week ?? programWeekOf(today, start) ?? 1;
  const curMonth = month ?? (monthList.includes(today.slice(0, 7)) ? today.slice(0, 7) : monthList[0]);

  let range: { start: string; end: string; title: string };
  if (kind === "week") {
    const r = weekRange(curWeek, start);
    range = { ...r, title: `التقرير الأسبوعي – الأسبوع ${curWeek} (${phaseForWeek(curWeek).nameAr})` };
  } else if (kind === "month") {
    const s = curMonth + "-01" < start ? start : curMonth + "-01";
    const e = lastDayOfMonth(curMonth) > end ? end : lastDayOfMonth(curMonth);
    range = { start: s, end: e, title: `التقرير الشهري – ${formatMonth(curMonth + "-01")}` };
  } else {
    range = { start, end, title: "التقرير الشامل لنهاية الستة أشهر" };
  }
  const summary = summarizePeriod(range.start, range.end, schedule, workouts, measurements, wellness);
  const nameOf = (id: string) => map[id]?.nameAr ?? id;

  return (
    <div>
      <PageHeader
        title="التقارير"
        back="/progress/"
        actions={
          <button className="btn-secondary no-print px-3" onClick={() => window.print()} aria-label="طباعة">
            <IconPrint size={20} />
          </button>
        }
      />
      <div className="no-print mb-3 grid grid-cols-3 gap-2" role="tablist">
        {(
          [
            ["week", "أسبوعي"],
            ["month", "شهري"],
            ["full", "شامل"],
          ] as const
        ).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={kind === k} className={`chip justify-center py-2 ${kind === k ? "chip-active" : ""}`} onClick={() => setKind(k)}>
            {l}
          </button>
        ))}
      </div>
      {kind === "week" && (
        <select className="input no-print mb-3" value={curWeek} onChange={(e) => setWeek(Number(e.target.value))} aria-label="الأسبوع">
          {Array.from({ length: PROGRAM_WEEKS }, (_, i) => i + 1).map((w) => (
            <option key={w} value={w}>
              الأسبوع {w} ({formatDateMedium(addDays(start, (w - 1) * 7))})
            </option>
          ))}
        </select>
      )}
      {kind === "month" && (
        <select className="input no-print mb-3" value={curMonth} onChange={(e) => setMonth(e.target.value)} aria-label="الشهر">
          {monthList.map((m) => (
            <option key={m} value={m}>
              {formatMonth(m + "-01")}
            </option>
          ))}
        </select>
      )}

      <h2 className="text-lg font-bold">{range.title}</h2>
      <p className="mb-3 text-sm text-muted">
        من {formatDateLong(range.start)} إلى {formatDateLong(range.end)}
        {settings.profile.name && <> · {settings.profile.name}</>}
      </p>
      {kind === "full" && today < end && (
        <div className="mb-3">
          <Alert tone="blue">البرنامج لم ينتهِ بعد؛ هذا التقرير يعرض ما سُجّل حتى الآن.</Alert>
        </div>
      )}
      <SummaryView s={summary} nameOf={nameOf} full={kind === "full"} />
      <p className="mt-4 text-xs text-muted">هذا التقرير مبني على ما سجّلته يدويًا في التطبيق فقط، وهو ليس تقييمًا طبيًا.</p>
    </div>
  );
}
