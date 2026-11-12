"use client";

import { useMemo, useState } from "react";
import { IconPrint } from "@/components/icons";
import { Alert, Loading, PageHeader } from "@/components/ui";
import { phaseForWeek, PROGRAM_WEEKS } from "@/data/program";
import { addDays, formatDateLong, formatDateMedium, formatMonth, parseISODate, toISODate } from "@/lib/dates";
import { exerciseText } from "@/lib/exerciseText";
import { useExercises, useMeasurements, useSchedule, useWellness, useWorkouts } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
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
  const { L, lang } = useI18n();
  const fd = (d: string) => formatDateMedium(d, lang);
  return (
    <div className="space-y-3" data-testid="report">
      <div className="card text-sm">
        <div className="mb-2 font-bold">{L("الالتزام", "Adherence")}</div>
        <Row label={L("الحصص المخططة", "Planned sessions")} value={s.plannedSessions} />
        <Row label={L("الحصص المكتملة", "Completed sessions")} value={s.completedSessions} />
        <Row label={L("الحصص الفائتة", "Missed sessions")} value={s.missedSessions} />
        <Row label={L("الحصص المتخطاة", "Skipped sessions")} value={s.skippedSessions} />
        <Row label={L("نسبة الالتزام", "Adherence rate")} value={s.plannedSessions - s.skippedSessions > 0 ? `${Math.round((s.completedSessions / (s.plannedSessions - s.skippedSessions)) * 100)}%` : "—"} />
      </div>
      <div className="card text-sm">
        <div className="mb-2 font-bold">{L("التدريب", "Training")}</div>
        <Row label={L("المجموعات المكتملة", "Completed sets")} value={s.totalSets} />
        <Row label={L("الحجم التدريبي", "Training volume")} value={<span className="ltr">{s.volume} kg</span>} />
        <Row label={L("الكارديو", "Cardio")} value={`${s.cardioMinutes} ${L("دقيقة", "min")}`} />
        <Row label={L("متوسط الجهد (RPE)", "Average effort (RPE)")} value={s.avgRpe ?? "—"} />
        <Row label={L("عدد مرات استخدام البدائل", "Alternatives used")} value={s.substitutions} />
      </div>
      <div className="card text-sm">
        <div className="mb-2 font-bold">{L("الألم والتعافي", "Pain & recovery")}</div>
        <Row label={L("متوسط ألم الركبة", "Avg knee pain")} value={s.avgKneePain ?? "—"} />
        <Row label={L("أعلى ألم للركبة", "Max knee pain")} value={s.maxKneePain ?? "—"} />
        <Row label={L("متوسط ألم الظهر", "Avg back pain")} value={s.avgBackPain ?? "—"} />
        <Row label={L("أعلى ألم للظهر", "Max back pain")} value={s.maxBackPain ?? "—"} />
        {s.painNotes.length > 0 && (
          <details className="mt-2">
            <summary className="cursor-pointer">{L("الملاحظات", "Notes")} ({s.painNotes.length})</summary>
            <ul className="mt-1 list-disc ps-5">
              {s.painNotes.map((n, i) => (
                <li key={i}>
                  {fd(n.date)}: {n.text}
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
      <div className="card text-sm">
        <div className="mb-2 font-bold">{L("القياسات", "Measurements")}</div>
        {s.measurements.length === 0 ? (
          <div className="text-muted">{L("لا توجد قياسات مسجلة في هذه الفترة.", "No measurements recorded in this period.")}</div>
        ) : (
          <>
            {s.firstWeight && <Row label={`${L("أول وزن", "First weight")} (${fd(s.firstWeight.date)})`} value={<span className="ltr">{s.firstWeight.weightKg} kg</span>} />}
            {s.lastWeight && <Row label={`${L("آخر وزن", "Last weight")} (${fd(s.lastWeight.date)})`} value={<span className="ltr">{s.lastWeight.weightKg} kg</span>} />}
            {weightDelta != null && <Row label={L("الفرق", "Change")} value={<span className="ltr">{weightDelta > 0 ? "+" : ""}{weightDelta} kg</span>} />}
            <p className="mt-2 text-xs text-muted">{L("تغير الوزن وحده لا يحدد تغير الدهون ولا نجاح البرنامج.", "Weight change alone doesn't determine fat change or program success.")}</p>
          </>
        )}
      </div>
      {exIds.length > 0 && (
        <div className="card text-sm">
          <div className="mb-2 font-bold">{L("الأداء في التمارين", "Exercise performance")} {full ? L("(أول ← آخر)", "(first → last)") : ""}</div>
          <table className="w-full">
            <thead className="text-muted">
              <tr>
                <th className="p-1 text-start">{L("التمرين", "Exercise")}</th>
                <th className="p-1 text-start">{L("أول أعلى وزن", "First top weight")}</th>
                <th className="p-1 text-start">{L("آخر أعلى وزن", "Last top weight")}</th>
                <th className="p-1 text-start">{L("مرات", "Times")}</th>
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
          <div className="mb-2 font-bold">{L("ملخص التمارين المسجلة", "Logged exercise summary")}</div>
          {s.workouts.map((w) => (
            <div key={w.id} className="border-b border-base py-2 last:border-0">
              <div className="font-medium">
                {fd(w.date)} – {L("الأسبوع", "Week")} {w.planSnapshot.week} ({w.planSnapshot.slot}) · {doneSets(w)} {L("مجموعة", "sets")}
              </div>
              <ul className="ps-3 text-xs">
                {w.entries
                  .filter((e) => e.sets.some((x) => x.done))
                  .map((e, i) => (
                    <li key={i}>
                      {nameOf(e.exerciseId)}
                      {e.substituted ? ` (${L("بديل", "alternative")})` : ""}:{" "}
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
                    {L("كارديو", "Cardio")}: {nameOf(w.cardio.exerciseId)} {w.cardio.minutes} {L("دقيقة", "min")}
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
  const { L, lang, pick } = useI18n();
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
    range = { ...r, title: L(`التقرير الأسبوعي – الأسبوع ${curWeek}`, `Weekly report – Week ${curWeek}`) + ` (${pick(phaseForWeek(curWeek).name)})` };
  } else if (kind === "month") {
    const s = curMonth + "-01" < start ? start : curMonth + "-01";
    const e = lastDayOfMonth(curMonth) > end ? end : lastDayOfMonth(curMonth);
    range = { start: s, end: e, title: `${L("التقرير الشهري", "Monthly report")} – ${formatMonth(curMonth + "-01", lang)}` };
  } else {
    range = { start, end, title: L("التقرير الشامل لنهاية الستة أشهر", "Full 6-month report") };
  }
  const summary = summarizePeriod(range.start, range.end, schedule, workouts, measurements, wellness);
  const nameOf = (id: string) => (map[id] ? exerciseText(map[id], lang).name : id);

  return (
    <div>
      <PageHeader
        display
        title={L("التقارير", "Reports")}
        back="/progress/"
        actions={
          <button className="btn-secondary no-print px-3" onClick={() => window.print()} aria-label={L("طباعة", "Print")}>
            <IconPrint size={20} />
          </button>
        }
      />
      <div className="no-print mb-3 grid grid-cols-3 gap-2" role="tablist">
        {(
          [
            ["week", L("أسبوعي", "Weekly")],
            ["month", L("شهري", "Monthly")],
            ["full", L("شامل", "Full")],
          ] as const
        ).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={kind === k} className={`chip justify-center py-2 ${kind === k ? "chip-active" : ""}`} onClick={() => setKind(k)}>
            {l}
          </button>
        ))}
      </div>
      {kind === "week" && (
        <select className="input no-print mb-3" value={curWeek} onChange={(e) => setWeek(Number(e.target.value))} aria-label={L("الأسبوع", "Week")}>
          {Array.from({ length: PROGRAM_WEEKS }, (_, i) => i + 1).map((w) => (
            <option key={w} value={w}>
              {L("الأسبوع", "Week")} {w} ({formatDateMedium(addDays(start, (w - 1) * 7), lang)})
            </option>
          ))}
        </select>
      )}
      {kind === "month" && (
        <select className="input no-print mb-3" value={curMonth} onChange={(e) => setMonth(e.target.value)} aria-label={L("الشهر", "Month")}>
          {monthList.map((m) => (
            <option key={m} value={m}>
              {formatMonth(m + "-01", lang)}
            </option>
          ))}
        </select>
      )}

      <h2 className="text-lg font-bold">{range.title}</h2>
      <p className="mb-3 text-sm text-muted">
        {L("من", "From")} {formatDateLong(range.start, lang)} {L("إلى", "to")} {formatDateLong(range.end, lang)}
        {settings.profile.name && <> · {settings.profile.name}</>}
      </p>
      {kind === "full" && today < end && (
        <div className="mb-3">
          <Alert tone="blue">{L("البرنامج لم ينتهِ بعد؛ هذا التقرير يعرض ما سُجّل حتى الآن.", "The program hasn't ended yet; this report shows what has been logged so far.")}</Alert>
        </div>
      )}
      <SummaryView s={summary} nameOf={nameOf} full={kind === "full"} />
      <p className="mt-4 text-xs text-muted">{L("هذا التقرير مبني على ما سجّلته يدويًا في التطبيق فقط، وهو ليس تقييمًا طبيًا.", "This report is based only on what you logged manually in the app; it is not a medical assessment.")}</p>
    </div>
  );
}
