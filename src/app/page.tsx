"use client";

import Link from "next/link";
import { useState } from "react";
import { IconAlert, IconCalendar, IconDumbbell } from "@/components/icons";
import { RedFlagList } from "@/components/Safety";
import { Alert, Badge, Loading, Modal, ProgressBar, Stat } from "@/components/ui";
import { phaseForWeek } from "@/data/program";
import { updateSettings } from "@/lib/db";
import { diffDays, formatDateLong, formatDateMedium, formatDateShort, isValidISODate } from "@/lib/dates";
import { DISCLAIMER } from "@/lib/health";
import { useExercises, useMeasurements, useSchedule } from "@/lib/hooks";
import { WEEKDAYS_AR } from "@/lib/labels";
import { pickCurrentSession, programEndDate, programProgress, programWeekOf, type ScheduledSession } from "@/lib/schedule";
import { cardioMinutes, doneSets, latestWeight, setVolume } from "@/lib/stats";
import { patchOverride } from "@/lib/workout";

function MissedRow({ s, today }: { s: ScheduledSession; today: string }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(today);
  const valid = isValidISODate(date) && date >= today;
  return (
    <li className="flex flex-wrap items-center gap-2 border-b border-base py-2 last:border-0" data-testid="missed-row">
      <div className="min-w-0 flex-1">
        <div className="font-medium">
          الأسبوع {s.session.week} – الحصة {s.session.slot}
        </div>
        <div className="text-xs text-muted">كانت مقررة: {formatDateMedium(s.date)}</div>
      </div>
      <button className="btn-secondary min-h-10 px-3 text-sm" onClick={() => setOpen(true)}>
        إعادة جدولة
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="إعادة جدولة الحصة"
        footer={
          <div className="grid grid-cols-2 gap-2">
            <button
              className="btn-secondary"
              onClick={async () => {
                await patchOverride(s.session.id, { skipped: true });
                setOpen(false);
              }}
            >
              تخطي الحصة
            </button>
            <button
              className="btn-primary"
              disabled={!valid}
              onClick={async () => {
                await patchOverride(s.session.id, { rescheduledDate: date, skipped: false });
                setOpen(false);
              }}
            >
              حفظ الموعد
            </button>
          </div>
        }
      >
        <p className="mb-3 text-sm">
          {s.session.name} (الأسبوع {s.session.week}). اختر تاريخًا جديدًا يدويًا. لن يتم تغيير أي حصة أخرى.
        </p>
        <label className="label" htmlFor={`d-${s.session.id}`}>
          التاريخ الجديد
        </label>
        <input id={`d-${s.session.id}`} type="date" className="input ltr" min={today} value={date} onChange={(e) => setDate(e.target.value)} />
        {!valid && <p className="mt-1 text-xs text-red-600">اختر تاريخًا صحيحًا اليوم أو بعده.</p>}
        <p className="mt-3 text-xs text-muted">ملاحظة: يفضل ترك يوم راحة بين حصص المقاومة.</p>
      </Modal>
    </li>
  );
}

export default function HomePage() {
  const { schedule, loaded, today, settings } = useSchedule();
  const measurements = useMeasurements();
  const { map } = useExercises();
  if (!loaded || !measurements) return <Loading />;

  const p = settings.profile;
  const current = pickCurrentSession(schedule, today);
  const progress = programProgress(schedule);
  const end = programEndDate(p.startDate);
  const week = programWeekOf(today, p.startDate);
  const thisWeek = week ? schedule.filter((s) => s.session.week === week) : [];
  const completedThisWeek = thisWeek.filter((s) => s.status === "completed").length;
  const missed = schedule.filter((s) => s.status === "missed").sort((a, b) => b.date.localeCompare(a.date));
  const lw = latestWeight(measurements);
  const lastDone = schedule
    .filter((s) => s.status === "completed" && s.workout)
    .map((s) => s.workout!)
    .sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0))[0];
  const beforeStart = today < p.startDate;
  const afterEnd = today > end;
  const days = [...p.trainingDays].sort((a, b) => ((a - 6 + 7) % 7) - ((b - 6 + 7) % 7));

  return (
    <div>
      <header className="mb-4">
        <div className="text-sm text-muted">اليوم</div>
        <h1 className="text-2xl font-bold" data-testid="today-date">
          {formatDateLong(today)}
        </h1>
        {week && (
          <div className="mt-1 text-sm text-muted">
            الأسبوع {week} من 26 · {phaseForWeek(week).nameAr}
          </div>
        )}
      </header>

      {!settings.safetyAcknowledgedAt && (
        <div className="mb-4 space-y-2">
          <Alert tone="blue" title="قبل البدء">
            <p>{DISCLAIMER}</p>
          </Alert>
          <RedFlagList />
          <button className="btn-primary w-full" onClick={() => updateSettings((s) => ({ ...s, safetyAcknowledgedAt: Date.now() }))}>
            قرأت التنبيهات
          </button>
        </div>
      )}

      {beforeStart && (
        <div className="mb-4">
          <Alert tone="green" title={`البرنامج يبدأ بعد ${diffDays(p.startDate, today)} يوم`}>
            تاريخ البداية: {formatDateLong(p.startDate)}. يمكنك تجهيز الإعدادات وتحديد الأجهزة المتوفرة في صالتك.
          </Alert>
        </div>
      )}

      {missed.length > 0 && (
        <div className="card mb-4 border-amber-400" data-testid="missed-alert">
          <div className="mb-2 flex items-center gap-2 font-bold text-amber-700 dark:text-amber-300">
            <IconAlert size={20} /> لديك {missed.length} حصة فائتة
          </div>
          <ul>
            {missed.slice(0, 4).map((s) => (
              <MissedRow key={s.session.id} s={s} today={today} />
            ))}
          </ul>
          {missed.length > 4 && (
            <Link href="/program/" className="mt-2 block text-sm underline">
              عرض كل الحصص الفائتة في البرنامج
            </Link>
          )}
        </div>
      )}

      {current ? (
        <div className="card mb-4" data-testid="current-session">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm text-muted">
              {current.status === "in_progress" ? "حصة قيد التنفيذ" : current.date === today ? "حصة اليوم" : "الحصة القادمة"}
            </div>
            {current.session.isDeload && <Badge tone="blue">أسبوع تخفيف</Badge>}
          </div>
          <div className="mt-1 text-lg font-bold">{current.session.name}</div>
          <div className="mt-1 text-sm text-muted">
            الأسبوع {current.session.week} · {formatDateMedium(current.date)} · حوالي {current.session.estimatedMinutes} دقيقة
            {current.rescheduled && " · (معاد جدولتها)"}
          </div>
          <div className="mt-2 text-sm">
            {current.session.exercises.map((e) => map[e.exerciseId]?.nameAr ?? e.exerciseId).join(" · ")}
          </div>
          <Link
            href={`/workout/?session=${current.session.id}`}
            className="btn-primary mt-4 min-h-16 w-full text-lg"
            data-testid="start-today"
          >
            <IconDumbbell />
            {current.status === "in_progress" ? "استكمل الحصة" : current.date === today ? "ابدأ تمرين اليوم" : "عرض الحصة القادمة"}
          </Link>
        </div>
      ) : (
        <div className="card mb-4">
          {afterEnd ? "انتهى البرنامج. راجع التقرير الشامل من صفحة التقدم." : "لا توجد حصص متبقية."}
        </div>
      )}

      <div className="card mb-4">
        <div className="mb-2 flex items-center gap-2 font-bold">
          <IconCalendar size={20} /> أيام التدريب
        </div>
        <div className="flex gap-2">
          {days.map((d) => (
            <span key={d} className="chip chip-active">
              {WEEKDAYS_AR[d]}
            </span>
          ))}
        </div>
        <div className="mt-2 text-xs text-muted">
          من {formatDateShort(p.startDate)} إلى {formatDateLong(end)}
        </div>
      </div>

      <div className="card mb-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-bold">نسبة إكمال البرنامج</span>
          <span className="ltr font-bold" data-testid="program-pct">
            {progress.pct}%
          </span>
        </div>
        <ProgressBar value={progress.pct} label="نسبة إكمال البرنامج" />
        <div className="mt-1 text-xs text-muted">
          {progress.completed} من {progress.total} حصة مكتملة (تُحتسب الحصة بعد تسجيل إنهائها فقط)
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <Stat label="حصص مكتملة هذا الأسبوع" value={week ? `${completedThisWeek} / ${thisWeek.length}` : "—"} hint={week ? `الأسبوع ${week}` : "خارج فترة البرنامج"} />
        <Stat
          label="آخر وزن مسجل"
          value={lw ? <span className="ltr">{lw.weightKg} كجم</span> : <span className="ltr">{p.startWeightKg} كجم</span>}
          hint={lw ? formatDateShort(lw.date) : "الوزن الابتدائي من الإعدادات"}
        />
      </div>

      <div className="card mb-4">
        <div className="mb-1 font-bold">آخر تمرين</div>
        {lastDone ? (
          <div className="text-sm">
            <div>
              {lastDone.planSnapshot.name} · {formatDateMedium(lastDone.date)}
            </div>
            <div className="mt-1 text-muted">
              {doneSets(lastDone)} مجموعة · حجم تدريبي <span className="ltr">{setVolume(lastDone)}</span> كجم · كارديو {cardioMinutes([lastDone])} دقيقة
            </div>
            {lastDone.entries.some((e) => e.substituted) && <div className="mt-1 text-xs text-muted">تم استخدام بدائل في هذه الحصة.</div>}
            {lastDone.notes && <div className="mt-1 text-xs">ملاحظات: {lastDone.notes}</div>}
          </div>
        ) : (
          <div className="text-sm text-muted">لم تسجل أي حصة مكتملة بعد.</div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/program/" className="btn-secondary">
          البرنامج الكامل
        </Link>
        <Link href="/reports/" className="btn-secondary">
          التقارير
        </Link>
        <Link href="/progress/#add-measurement" className="btn-secondary">
          تسجيل الوزن
        </Link>
        <Link href="/safety/" className="btn-secondary">
          السلامة
        </Link>
      </div>
    </div>
  );
}
