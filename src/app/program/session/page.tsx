"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ExerciseThumb } from "@/components/ExerciseMedia";
import { IconDown, IconPlus, IconTrash, IconUp } from "@/components/icons";
import { Alert, Badge, Choice, Loading, Modal, NumberField, PageHeader, Section } from "@/components/ui";
import { getSession, phaseForWeek } from "@/data/program";
import { formatDateMedium, isValidISODate } from "@/lib/dates";
import { exerciseText } from "@/lib/exerciseText";
import { prescriptionText, UNIT_LABEL } from "@/lib/format";
import { useExercises, useSchedule, useSearchParam } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { MUSCLES } from "@/lib/labels";
import { matchesQuery } from "@/lib/search";
import { sessionName } from "@/lib/sessionText";
import type { PlannedExercise, PrescriptionUnit } from "@/lib/types";
import { patchOverride, resetSessionExercises } from "@/lib/workout";

function EditExercise({ pe, onSave, onClose }: { pe: PlannedExercise; onSave: (pe: PlannedExercise) => void; onClose: () => void }) {
  const { L, pick } = useI18n();
  const [d, setD] = useState(pe);
  return (
    <Modal
      open
      onClose={onClose}
      title={L("تعديل التمرين لهذه الحصة", "Edit exercise for this session")}
      footer={
        <button className="btn-primary w-full" onClick={() => onSave({ ...d, repsMax: Math.max(d.repsMin, d.repsMax) })} data-testid="save-edit">
          {L("حفظ", "Save")}
        </button>
      }
    >
      <div className="space-y-3">
        <NumberField label={L("المجموعات", "Sets")} value={d.sets} min={1} max={10} onChange={(v) => setD({ ...d, sets: v ?? 1 })} testId="edit-sets" />
        <div className="grid grid-cols-2 gap-2">
          <NumberField label={L("من", "From")} value={d.repsMin} min={1} onChange={(v) => setD({ ...d, repsMin: v ?? 1 })} />
          <NumberField label={L("إلى", "To")} value={d.repsMax} min={1} onChange={(v) => setD({ ...d, repsMax: v ?? 1 })} />
        </div>
        <Choice
          label={L("الوحدة", "Unit")}
          cols={2}
          options={(Object.keys(UNIT_LABEL) as PrescriptionUnit[]).map((k) => ({ id: k, label: pick(UNIT_LABEL[k]) }))}
          value={d.unit}
          onChange={(v) => v && setD({ ...d, unit: v })}
          allowClear={false}
        />
        <NumberField label={L("الراحة (ثانية)", "Rest (seconds)")} value={d.restSec} step={15} min={15} max={600} onChange={(v) => setD({ ...d, restSec: v ?? 60 })} />
        <Choice label={L("الجهد المستهدف (RPE)", "Target effort (RPE)")} cols={5} options={["5", "5-6", "6", "6-7", "7", "7-8", "8"].map((x) => ({ id: x, label: x }))} value={d.rpe} onChange={(v) => v && setD({ ...d, rpe: v })} allowClear={false} />
      </div>
    </Modal>
  );
}

export default function SessionDetailPage() {
  const id = useSearchParam("id");
  const { schedule, loaded, today } = useSchedule();
  const { map, list } = useExercises();
  const { L, lang, pick } = useI18n();
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [q, setQ] = useState("");
  const [date, setDate] = useState("");
  const [pendingAdd, setPendingAdd] = useState<string | null>(null);
  const candidates = useMemo(() => list.filter((e) => e.kind === "strength" && matchesQuery(e, q)), [list, q]);

  if (!loaded || id === null) return <Loading />;
  const s = schedule.find((x) => x.session.id === id);
  const original = getSession(id);
  if (!s || !original) return <PageHeader title={L("غير موجود", "Not found")} back="/program/" />;
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
      <PageHeader title={L(`الأسبوع ${sess.week} – الحصة ${sess.slot}`, `Week ${sess.week} – Session ${sess.slot}`)} back="/program/" subtitle={`${sessionName(sess, lang)} · ${formatDateMedium(s.date, lang)}`} />
      <div className="mb-3 flex flex-wrap gap-1.5">
        <Badge tone="accent">{pick(phaseForWeek(sess.week).name)}</Badge>
        {sess.isDeload && <Badge tone="blue">{L("أسبوع تخفيف", "Deload week")}</Badge>}
        {edited && <Badge tone="amber">{L("معدلة لهذه الحصة فقط", "Edited for this session only")}</Badge>}
        <Badge>
          ~{sess.estimatedMinutes} {L("دقيقة", "min")}
        </Badge>
      </div>
      <p className="mb-2 text-sm">{pick(sess.weekFocus)}</p>
      <p className="mb-4 text-xs text-muted">
        {L("العضلات المستهدفة:", "Target muscles:")} {sess.targetMuscles.map((m) => pick(MUSCLES[m])).join(" · ")}
      </p>

      {locked ? (
        <Alert tone="green">{L("الحصة دي مكتملة. التعديل مقفول عشان السجل يفضل زي ما اتعمل.", "This session is completed. Editing is locked to keep the log as it happened.")}</Alert>
      ) : (
        <Alert tone="blue">{L("التعديلات هنا للحصة دي بس. البرنامج الأساسي والسجلات القديمة مش بتتغير.", "Changes here apply to this session only. The base program and past logs don't change.")}</Alert>
      )}

      <Section title={L("تمارين المقاومة", "Strength exercises")}>
        <ol className="space-y-2" data-testid="session-exercises">
          {exercises.map((pe, i) => {
            const e = map[pe.exerciseId];
            const t = e ? exerciseText(e, lang) : null;
            return (
              <li key={`${pe.exerciseId}-${i}`} className="card p-3" data-testid="session-exercise">
                <div className="flex items-start gap-3">
                  {e && <ExerciseThumb exercise={e} className="h-14 w-14 shrink-0" />}
                  <div className="min-w-0 flex-1">
                    <Link href={`/library/exercise/?id=${pe.exerciseId}`} className="font-bold underline-offset-2 hover:underline">
                      {i + 1}. {t?.name ?? pe.exerciseId}
                    </Link>
                    <div className={`text-xs text-muted ${lang === "ar" ? "ltr text-start" : ""}`}>{t?.otherName}</div>
                    <div className="text-sm">
                      {prescriptionText(pe, lang)} · {L("راحة", "rest")} {pe.restSec}s · RPE {pe.rpe}
                    </div>
                    {e?.reviewRequired && <div className="mt-1 text-xs text-red-600">{L("يحتاج مراجعة متخصص", "Needs a specialist's review")}</div>}
                  </div>
                  {!locked && (
                    <div className="flex shrink-0 flex-col gap-1">
                      <button
                        className="btn-secondary min-h-9 px-2"
                        aria-label={L("تحريك للأعلى", "Move up")}
                        disabled={i === 0}
                        onClick={() => {
                          const n = [...exercises];
                          [n[i - 1], n[i]] = [n[i], n[i - 1]];
                          save(n);
                        }}
                      >
                        <IconUp size={16} />
                      </button>
                      <button
                        className="btn-secondary min-h-9 px-2"
                        aria-label={L("تحريك للأسفل", "Move down")}
                        disabled={i === exercises.length - 1}
                        onClick={() => {
                          const n = [...exercises];
                          [n[i + 1], n[i]] = [n[i], n[i + 1]];
                          save(n);
                        }}
                      >
                        <IconDown size={16} />
                      </button>
                    </div>
                  )}
                </div>
                {!locked && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button className="btn-secondary min-h-10 text-sm" onClick={() => setEditIdx(i)} data-testid="edit-exercise">
                      {L("تعديل", "Edit")}
                    </button>
                    <button className="btn-secondary min-h-10 text-sm text-red-600" disabled={exercises.length <= 1} onClick={() => save(exercises.filter((_, j) => j !== i))} data-testid="delete-exercise">
                      <IconTrash size={16} /> {L("حذف", "Delete")}
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
              <IconPlus size={18} /> {L("إضافة تمرين لهذه الحصة", "Add an exercise to this session")}
            </button>
            {edited && (
              <button className="btn-ghost text-sm" onClick={() => resetSessionExercises(sess.id)} data-testid="reset-exercises">
                {L("استرجاع تمارين البرنامج الأصلية", "Restore the original exercises")}
              </button>
            )}
          </div>
        )}
      </Section>

      <Section title={L("الإحماء والكارديو", "Warm-up & cardio")}>
        <div className="card p-3 text-sm">
          <div>
            {L("الإحماء:", "Warm-up:")} {sess.warmup.minutes} {L("دقائق", "min")} – {sess.warmup.mobility.map((x) => pick(x)).join(" · ")}
          </div>
          <div className="mt-1">
            {L("الكارديو:", "Cardio:")} {map[sess.cardio.exerciseId] ? exerciseText(map[sess.cardio.exerciseId], lang).name : ""} {sess.cardio.minutes} {L("دقيقة", "min")} – {pick(sess.cardio.intensity)}
          </div>
        </div>
      </Section>

      <Section title={L("السلامة", "Safety")}>
        <ul className="list-disc space-y-1 ps-5 text-sm">
          {sess.safetyNotes.map((n, i) => (
            <li key={i}>{pick(n)}</li>
          ))}
        </ul>
      </Section>

      {!locked && (
        <Section title={L("الموعد", "Date")}>
          <div className="card space-y-2 p-3">
            <div className="text-sm">
              {L("الموعد الأصلي:", "Planned:")} {formatDateMedium(s.plannedDate, lang)}
              {s.rescheduled && (
                <>
                  {" "}
                  · {L("الموعد الحالي:", "Now:")} {formatDateMedium(s.date, lang)}
                </>
              )}
            </div>
            <div className="flex gap-2">
              <input type="date" className="input ltr" value={date} onChange={(e) => setDate(e.target.value)} aria-label={L("تاريخ جديد", "New date")} />
              <button className="btn-secondary shrink-0" disabled={!isValidISODate(date)} onClick={() => patchOverride(sess.id, { rescheduledDate: date, skipped: false })}>
                {L("حفظ", "Save")}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {s.rescheduled && (
                <button className="btn-ghost text-sm" onClick={() => patchOverride(sess.id, { rescheduledDate: null })}>
                  {L("الرجوع للموعد الأصلي", "Back to the planned date")}
                </button>
              )}
              <button className="btn-ghost text-sm" onClick={() => patchOverride(sess.id, { skipped: !s.override?.skipped })}>
                {s.override?.skipped ? L("إلغاء التخطي", "Un-skip") : L("تخطي هذه الحصة", "Skip this session")}
              </button>
            </div>
            {date && date < today && <p className="text-xs text-amber-600">{L("التاريخ المختار في الماضي.", "The chosen date is in the past.")}</p>}
          </div>
        </Section>
      )}

      <Link href={`/workout/?session=${sess.id}`} className="btn-go min-h-14 w-full text-lg">
        {s.status === "completed" ? L("عرض سجل الحصة", "View session log") : s.status === "in_progress" ? L("كمّل الحصة", "Resume session") : L("فتح الحصة", "Open session")}
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
      <Modal open={adding} onClose={() => setAdding(false)} title={L("إضافة تمرين", "Add exercise")}>
        {pendingAdd && (
          <div className="mb-3 space-y-2">
            <Alert tone="red" title={L("التمرين ده يحتاج مراجعة متخصص", "This exercise needs a specialist's review")}>
              {map[pendingAdd] && exerciseText(map[pendingAdd], lang).reviewRequired} {L("متضيفوش إلا لو راجعه معاك أخصائي.", "Only add it if a specialist has reviewed it with you.")}
            </Alert>
            <div className="grid grid-cols-2 gap-2">
              <button className="btn-secondary" onClick={() => setPendingAdd(null)}>
                {L("إلغاء", "Cancel")}
              </button>
              <button className="btn-danger" onClick={() => addExercise(pendingAdd)}>
                {L("اتراجع، أضفه", "Reviewed – add it")}
              </button>
            </div>
          </div>
        )}
        <input className="input mb-3" type="search" placeholder={L("ابحث…", "Search…")} value={q} onChange={(e) => setQ(e.target.value)} aria-label={L("بحث عن تمرين", "Search exercises")} />
        <ul className="space-y-1">
          {candidates.map((e) => {
            const t = exerciseText(e, lang);
            return (
              <li key={e.id}>
                <button className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-start surface-2" onClick={() => (e.reviewRequired ? setPendingAdd(e.id) : addExercise(e.id))}>
                  <span>
                    {t.name} <span className="ltr text-xs text-muted">{t.otherName}</span>
                  </span>
                  {e.reviewRequired && <Badge tone="red">{L("يحتاج مراجعة", "Needs review")}</Badge>}
                </button>
              </li>
            );
          })}
        </ul>
      </Modal>
    </div>
  );
}
