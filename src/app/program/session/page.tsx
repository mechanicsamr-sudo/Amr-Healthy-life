"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { IconDown, IconPlus, IconTrash, IconUp } from "@/components/icons";
import { Alert, Badge, Loading, Modal, NumberField, PageHeader, Section } from "@/components/ui";
import { getSession, phaseForWeek } from "@/data/program";
import { formatDateMedium, isValidISODate } from "@/lib/dates";
import { prescriptionText, UNIT_LABEL } from "@/lib/format";
import { useExercises, useSchedule, useSearchParam } from "@/lib/hooks";
import { MUSCLES } from "@/lib/labels";
import { matchesQuery } from "@/lib/search";
import type { PlannedExercise, PrescriptionUnit } from "@/lib/types";
import { patchOverride, resetSessionExercises } from "@/lib/workout";

function EditExercise({ pe, onSave, onClose }: { pe: PlannedExercise; onSave: (pe: PlannedExercise) => void; onClose: () => void }) {
  const [d, setD] = useState(pe);
  return (
    <Modal
      open
      onClose={onClose}
      title="تعديل التمرين لهذه الحصة"
      footer={
        <button className="btn-primary w-full" onClick={() => onSave({ ...d, repsMax: Math.max(d.repsMin, d.repsMax) })} data-testid="save-edit">
          حفظ
        </button>
      }
    >
      <div className="space-y-3">
        <NumberField label="المجموعات" value={d.sets} min={1} max={10} onChange={(v) => setD({ ...d, sets: v ?? 1 })} testId="edit-sets" />
        <div className="grid grid-cols-2 gap-2">
          <NumberField label="من" value={d.repsMin} min={1} onChange={(v) => setD({ ...d, repsMin: v ?? 1 })} />
          <NumberField label="إلى" value={d.repsMax} min={1} onChange={(v) => setD({ ...d, repsMax: v ?? 1 })} />
        </div>
        <div>
          <label className="label" htmlFor="unit">الوحدة</label>
          <select id="unit" className="input" value={d.unit} onChange={(e) => setD({ ...d, unit: e.target.value as PrescriptionUnit })}>
            {Object.entries(UNIT_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <NumberField label="الراحة (ثانية)" value={d.restSec} step={15} min={15} max={600} onChange={(v) => setD({ ...d, restSec: v ?? 60 })} />
        <div>
          <label className="label" htmlFor="rpe">الجهد المستهدف (RPE)</label>
          <input id="rpe" className="input ltr" value={d.rpe} onChange={(e) => setD({ ...d, rpe: e.target.value })} />
        </div>
      </div>
    </Modal>
  );
}

export default function SessionDetailPage() {
  const id = useSearchParam("id");
  const { schedule, loaded, today } = useSchedule();
  const { map, list } = useExercises();
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [q, setQ] = useState("");
  const [date, setDate] = useState("");
  const [pendingAdd, setPendingAdd] = useState<string | null>(null);
  const candidates = useMemo(() => list.filter((e) => e.kind === "strength" && matchesQuery(e, q)), [list, q]);

  if (!loaded || id === null) return <Loading />;
  const s = schedule.find((x) => x.session.id === id);
  const original = getSession(id);
  if (!s || !original)
    return (
      <div>
        <PageHeader title="غير موجود" back="/program/" />
      </div>
    );
  const sess = s.session;
  const exercises = sess.exercises;
  const edited = !!s.override?.exercises;
  const save = (next: PlannedExercise[]) => patchOverride(sess.id, { exercises: next });
  const locked = s.status === "completed";
  const addExercise = (exerciseId: string) => {
    const last = exercises[exercises.length - 1];
    save([...exercises, { exerciseId, sets: last?.sets ?? 2, repsMin: last?.repsMin ?? 10, repsMax: last?.repsMax ?? 12, unit: "reps", restSec: 75, rpe: last?.rpe ?? "6" }]);
    setAdding(false);
    setPendingAdd(null);
  };

  return (
    <div>
      <PageHeader title={`الأسبوع ${sess.week} – الحصة ${sess.slot}`} back="/program/" subtitle={`${sess.name} · ${formatDateMedium(s.date)}`} />
      <div className="mb-3 flex flex-wrap gap-1.5">
        <Badge tone="green">{phaseForWeek(sess.week).nameAr}</Badge>
        {sess.isDeload && <Badge tone="blue">أسبوع تخفيف</Badge>}
        {edited && <Badge tone="amber">معدلة لهذه الحصة فقط</Badge>}
        <Badge>حوالي {sess.estimatedMinutes} دقيقة</Badge>
      </div>
      <p className="mb-2 text-sm">{sess.weekFocus}</p>
      <p className="mb-4 text-xs text-muted">العضلات المستهدفة: {sess.targetMuscles.map((m) => MUSCLES[m].ar).join("، ")}</p>

      {locked ? (
        <Alert tone="green">هذه الحصة مكتملة. التعديل مغلق للحفاظ على السجل كما تم.</Alert>
      ) : (
        <Alert tone="blue">التعديلات هنا تخص هذه الحصة فقط. البرنامج الأساسي يبقى كما هو، والسجلات السابقة لا تتغير.</Alert>
      )}

      <Section title="تمارين المقاومة">
        <ol className="space-y-2" data-testid="session-exercises">
          {exercises.map((pe, i) => {
            const e = map[pe.exerciseId];
            return (
              <li key={`${pe.exerciseId}-${i}`} className="card p-3" data-testid="session-exercise">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <Link href={`/library/exercise/?id=${pe.exerciseId}`} className="font-bold underline-offset-2 hover:underline">
                      {i + 1}. {e?.nameAr ?? pe.exerciseId}
                    </Link>
                    <div className="ltr text-start text-xs text-muted">{e?.nameEn}</div>
                    <div className="text-sm">
                      {prescriptionText(pe)} · راحة {pe.restSec} ث · جهد {pe.rpe}
                    </div>
                    {e?.reviewRequired && <div className="mt-1 text-xs text-red-600">يحتاج مراجعة متخصص</div>}
                  </div>
                  {!locked && (
                    <div className="flex shrink-0 flex-col gap-1">
                      <button className="btn-secondary min-h-9 px-2" aria-label="تحريك للأعلى" disabled={i === 0} onClick={() => { const n = [...exercises]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; save(n); }}>
                        <IconUp size={16} />
                      </button>
                      <button className="btn-secondary min-h-9 px-2" aria-label="تحريك للأسفل" disabled={i === exercises.length - 1} onClick={() => { const n = [...exercises]; [n[i + 1], n[i]] = [n[i], n[i + 1]]; save(n); }}>
                        <IconDown size={16} />
                      </button>
                    </div>
                  )}
                </div>
                {!locked && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button className="btn-secondary min-h-10 text-sm" onClick={() => setEditIdx(i)} data-testid="edit-exercise">
                      تعديل
                    </button>
                    <button className="btn-secondary min-h-10 text-sm text-red-600" disabled={exercises.length <= 1} onClick={() => save(exercises.filter((_, j) => j !== i))} data-testid="delete-exercise">
                      <IconTrash size={16} /> حذف
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
        {!locked && (
          <div className="mt-3 grid gap-2">
            <button className="btn-secondary" onClick={() => setAdding(true)} data-testid="add-exercise">
              <IconPlus size={18} /> إضافة تمرين لهذه الحصة
            </button>
            {edited && (
              <button className="btn-ghost text-sm" onClick={() => resetSessionExercises(sess.id)}>
                استرجاع تمارين البرنامج الأصلية
              </button>
            )}
          </div>
        )}
      </Section>

      <Section title="الإحماء والكارديو">
        <div className="card text-sm">
          <div>الإحماء: {sess.warmup.minutes} دقائق – {sess.warmup.mobility.join("، ")}</div>
          <div className="mt-1">
            الكارديو: {map[sess.cardio.exerciseId]?.nameAr} {sess.cardio.minutes} دقيقة – {sess.cardio.intensity}
          </div>
        </div>
      </Section>

      <Section title="السلامة">
        <ul className="list-disc space-y-1 ps-5 text-sm">
          {sess.safetyNotes.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
      </Section>

      {!locked && (
        <Section title="الموعد">
          <div className="card space-y-2">
            <div className="text-sm">
              الموعد الأصلي: {formatDateMedium(s.plannedDate)}
              {s.rescheduled && <> · الموعد الحالي: {formatDateMedium(s.date)}</>}
            </div>
            <div className="flex gap-2">
              <input type="date" className="input ltr" value={date} onChange={(e) => setDate(e.target.value)} aria-label="تاريخ جديد" />
              <button className="btn-secondary shrink-0" disabled={!isValidISODate(date)} onClick={() => patchOverride(sess.id, { rescheduledDate: date, skipped: false })}>
                حفظ
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {s.rescheduled && (
                <button className="btn-ghost text-sm" onClick={() => patchOverride(sess.id, { rescheduledDate: null })}>
                  الرجوع للموعد الأصلي
                </button>
              )}
              <button className="btn-ghost text-sm" onClick={() => patchOverride(sess.id, { skipped: !s.override?.skipped })}>
                {s.override?.skipped ? "إلغاء التخطي" : "تخطي هذه الحصة"}
              </button>
            </div>
            {date && date < today && <p className="text-xs text-amber-600">التاريخ المختار في الماضي.</p>}
          </div>
        </Section>
      )}

      <Link href={`/workout/?session=${sess.id}`} className="btn-primary min-h-14 w-full text-lg">
        {s.status === "completed" ? "عرض سجل الحصة" : s.status === "in_progress" ? "استكمل الحصة" : "فتح الحصة"}
      </Link>

      {editIdx !== null && (
        <EditExercise
          pe={exercises[editIdx]}
          onClose={() => setEditIdx(null)}
          onSave={(pe) => {
            save(exercises.map((x, j) => (j === editIdx ? pe : x)));
            setEditIdx(null);
          }}
        />
      )}
      <Modal open={adding} onClose={() => setAdding(false)} title="إضافة تمرين">
        {pendingAdd && (
          <div className="mb-3 space-y-2">
            <Alert tone="red" title="هذا التمرين يحتاج مراجعة متخصص">
              {map[pendingAdd]?.reviewRequired} لا تضفه إلا إذا راجعه معك أخصائي.
            </Alert>
            <div className="grid grid-cols-2 gap-2">
              <button className="btn-secondary" onClick={() => setPendingAdd(null)}>
                إلغاء
              </button>
              <button className="btn-danger" onClick={() => addExercise(pendingAdd)}>
                تمت المراجعة، أضفه
              </button>
            </div>
          </div>
        )}
        <input className="input mb-3" type="search" placeholder="ابحث…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="بحث عن تمرين" />
        <ul className="space-y-1">
          {candidates.map((e) => (
            <li key={e.id}>
              <button
                className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-start surface-2"
                onClick={() => (e.reviewRequired ? setPendingAdd(e.id) : addExercise(e.id))}
              >
                <span>
                  {e.nameAr} <span className="ltr text-xs text-muted">{e.nameEn}</span>
                </span>
                {e.reviewRequired && <Badge tone="red">يحتاج مراجعة</Badge>}
              </button>
            </li>
          ))}
        </ul>
      </Modal>
    </div>
  );
}
