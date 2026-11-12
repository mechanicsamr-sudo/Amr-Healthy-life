"use client";

import Link from "next/link";
import { Badge, Loading, PageHeader } from "@/components/ui";
import { PHASES } from "@/data/program";
import { formatDateShort } from "@/lib/dates";
import { useSchedule } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { programEndDate, programWeekOf, type SessionStatus } from "@/lib/schedule";

export default function ProgramPage() {
  const { schedule, loaded, today, settings } = useSchedule();
  const { L, lang, pick } = useI18n();
  if (!loaded) return <Loading />;
  const start = settings.profile.startDate;
  const currentWeek = programWeekOf(today, start);
  const STATUS: Record<SessionStatus, { label: string; tone: "green" | "amber" | "red" | "blue" | "neutral" }> = {
    completed: { label: L("مكتملة", "Done"), tone: "green" },
    in_progress: { label: L("قيد التنفيذ", "In progress"), tone: "blue" },
    skipped: { label: L("تم تخطيها", "Skipped"), tone: "neutral" },
    missed: { label: L("فائتة", "Missed"), tone: "red" },
    today: { label: L("اليوم", "Today"), tone: "amber" },
    upcoming: { label: L("قادمة", "Upcoming"), tone: "neutral" },
  };

  return (
    <div>
      <PageHeader
        display
        title={L("البرنامج الكامل", "Full program")}
        back="/settings/"
        subtitle={`${formatDateShort(start, lang)} – ${formatDateShort(programEndDate(start), lang)} · ${L("26 أسبوع · 78 حصة", "26 weeks · 78 sessions")}`}
      />
      <p className="mb-4 text-sm text-muted">
        {L(
          "البرنامج مش بيزوّد الأوزان تلقائيًا. كل أسبوع ليه نطاق مجموعات وتكرارات وجهد، وانت بتختار الوزن حسب أداءك وتعافيك واستجابة الركبة والظهر.",
          "The program never raises weights automatically. Each week has a target range for sets, reps and effort; you choose the weight based on performance, recovery and how your knee and back respond.",
        )}
      </p>
      {PHASES.map((ph) => (
        <section key={ph.number} className="mb-6">
          <h2 className="text-lg font-bold">{pick(ph.name)}</h2>
          <p className="mb-1 text-sm">{pick(ph.goal)}</p>
          <p className="mb-3 text-xs text-muted">
            {L("قاعدة التقدم:", "Progression rule:")} {pick(ph.progressionRule)}
          </p>
          {ph.weeks.map((wk) => {
            const sessions = schedule.filter((s) => s.session.week === wk);
            return (
              <div key={wk} className={`card mb-2 p-3 ${wk === currentWeek ? "border-[rgb(var(--accent))]" : ""}`} id={`week-${wk}`}>
                <div className="mb-2 flex items-center justify-between">
                  <div className="font-bold">
                    {L("الأسبوع", "Week")} {wk} {wk === currentWeek && <Badge tone="accent">{L("الأسبوع الحالي", "This week")}</Badge>}
                  </div>
                  {sessions[0]?.session.isDeload && <Badge tone="blue">{L("تخفيف", "Deload")}</Badge>}
                </div>
                <p className="mb-2 text-xs text-muted">{pick(sessions[0]?.session.weekFocus)}</p>
                <ul className="space-y-1">
                  {sessions.map((s) => (
                    <li key={s.session.id}>
                      <Link href={`/program/session/?id=${s.session.id}`} className="flex items-center justify-between gap-2 rounded-xl px-2 py-2 surface-2" data-testid={`session-link-${s.session.id}`}>
                        <span className="min-w-0 truncate text-sm">
                          <b>{s.session.slot}</b> · {formatDateShort(s.date, lang)}
                          {s.rescheduled && ` (${L("معاد جدولتها", "rescheduled")})`}
                          {s.override?.exercises && ` · ${L("معدلة", "edited")}`}
                        </span>
                        <Badge tone={STATUS[s.status].tone}>{STATUS[s.status].label}</Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}
