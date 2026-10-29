"use client";

import Link from "next/link";
import { Badge, Loading, PageHeader } from "@/components/ui";
import { PHASES } from "@/data/program";
import { formatDateShort } from "@/lib/dates";
import { useSchedule } from "@/lib/hooks";
import { programEndDate, programWeekOf, type SessionStatus } from "@/lib/schedule";

const STATUS: Record<SessionStatus, { label: string; tone: "green" | "amber" | "red" | "blue" | "neutral" }> = {
  completed: { label: "مكتملة", tone: "green" },
  in_progress: { label: "قيد التنفيذ", tone: "blue" },
  skipped: { label: "تم تخطيها", tone: "neutral" },
  missed: { label: "فائتة", tone: "red" },
  today: { label: "اليوم", tone: "amber" },
  upcoming: { label: "قادمة", tone: "neutral" },
};

export default function ProgramPage() {
  const { schedule, loaded, today, settings } = useSchedule();
  if (!loaded) return <Loading />;
  const start = settings.profile.startDate;
  const currentWeek = programWeekOf(today, start);

  return (
    <div>
      <PageHeader
        title="البرنامج الكامل"
        back="/settings/"
        subtitle={`${formatDateShort(start)} – ${formatDateShort(programEndDate(start))} · 26 أسبوعًا · 78 حصة`}
      />
      <p className="mb-4 text-sm text-muted">
        البرنامج لا يرفع الأوزان تلقائيًا. كل أسبوع له نطاق مجموعات وتكرارات وجهد مستهدف، وأنت تختار الوزن حسب أدائك وتعافيك واستجابة الركبة والظهر.
      </p>
      {PHASES.map((ph) => (
        <section key={ph.number} className="mb-6">
          <h2 className="text-lg font-bold">{ph.nameAr}</h2>
          <p className="mb-1 text-sm">{ph.goal}</p>
          <p className="mb-3 text-xs text-muted">قاعدة التقدم: {ph.progressionRule}</p>
          {ph.weeks.map((wk) => {
            const sessions = schedule.filter((s) => s.session.week === wk);
            return (
              <div key={wk} className={`card mb-2 p-3 ${wk === currentWeek ? "border-brand-500" : ""}`} id={`week-${wk}`}>
                <div className="mb-2 flex items-center justify-between">
                  <div className="font-bold">
                    الأسبوع {wk} {wk === currentWeek && <Badge tone="green">الأسبوع الحالي</Badge>}
                  </div>
                  {sessions[0]?.session.isDeload && <Badge tone="blue">تخفيف</Badge>}
                </div>
                <p className="mb-2 text-xs text-muted">{sessions[0]?.session.weekFocus}</p>
                <ul className="space-y-1">
                  {sessions.map((s) => (
                    <li key={s.session.id}>
                      <Link href={`/program/session/?id=${s.session.id}`} className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 surface-2" data-testid={`session-link-${s.session.id}`}>
                        <span className="min-w-0 truncate text-sm">
                          <b>{s.session.slot}</b> · {formatDateShort(s.date)}
                          {s.rescheduled && " (معاد جدولتها)"}
                          {s.override?.exercises && " · معدلة"}
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
