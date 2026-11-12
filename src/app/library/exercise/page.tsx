"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import AlternativesPanel from "@/components/AlternativesPanel";
import ExerciseDetails from "@/components/ExerciseDetails";
import { Alert, Loading, Modal, PageHeader, Section } from "@/components/ui";
import { db } from "@/lib/db";
import { useExercises, useSearchParam, useSettings } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";

/** تصغير الصورة قبل حفظها محليًا لتقليل المساحة */
async function fileToDataUrl(file: File, max = 1024): Promise<string> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.82);
}

function ImageManager({ exerciseId }: { exerciseId: string }) {
  const media = useLiveQuery(() => db.media.get(exerciseId), [exerciseId]);
  const { L } = useI18n();
  const [url, setUrl] = useState("");
  const [source, setSource] = useState("");
  const [err, setErr] = useState("");

  return (
    <div className="card space-y-3 p-3">
      <p className="text-sm text-muted">
        {L("أدق صورة هي صورة الجهاز اللي في جيمك. الصورة بتتحفظ على موبايلك بس.", "The most accurate picture is the machine in your own gym. It's saved on your phone only.")}
      </p>
      <label className="btn-primary w-full cursor-pointer">
        📷 {L("صوّر/اختار صورة للجهاز", "Take/choose a photo of the machine")}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            try {
              const dataUrl = await fileToDataUrl(f);
              await db.media.put({ exerciseId, imageUrl: null, imageDataUrl: dataUrl, source: L("صورة من جيمي", "Photo from my gym"), updatedAt: Date.now() });
              setErr("");
            } catch {
              setErr(L("تعذر قراءة الصورة.", "Couldn't read the image."));
            }
          }}
        />
      </label>
      <details>
        <summary className="cursor-pointer text-sm font-medium">{L("أو أضف رابط صورة من الإنترنت", "Or add an image link")}</summary>
        <div className="mt-2 space-y-2">
          <input className="input ltr" type="url" placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} aria-label={L("رابط الصورة", "Image URL")} />
          <input className="input" placeholder={L("مصدر الصورة", "Image source")} value={source} onChange={(e) => setSource(e.target.value)} aria-label={L("مصدر الصورة", "Image source")} />
          <button
            className="btn-secondary w-full"
            onClick={async () => {
              if (!/^https:\/\//.test(url)) return setErr(L("أدخل رابطًا يبدأ بـ https://", "Enter a link starting with https://"));
              if (!source.trim()) return setErr(L("اكتب مصدر الصورة.", "Enter the image source."));
              await db.media.put({ exerciseId, imageUrl: url, imageDataUrl: null, source: source.trim(), updatedAt: Date.now() });
              setErr("");
              setUrl("");
            }}
          >
            {L("حفظ الرابط", "Save link")}
          </button>
          <p className="text-xs text-muted">{L("اتأكد إن الصورة لنفس الجهاز ولرجل.", "Make sure the photo shows the same machine and a male model.")}</p>
        </div>
      </details>
      {err && <p className="text-sm text-red-600">{err}</p>}
      {media && (
        <button className="btn-ghost w-full text-sm text-red-600" onClick={() => db.media.delete(exerciseId)}>
          {L("إزالة الصورة المضافة", "Remove added photo")}
        </button>
      )}
    </div>
  );
}

export default function ExercisePage() {
  const id = useSearchParam("id");
  const router = useRouter();
  const { map, loaded } = useExercises();
  const { settings } = useSettings();
  const { L } = useI18n();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [altOpen, setAltOpen] = useState(false);
  if (!loaded || id === null) return <Loading />;
  const e = map[id];
  if (!e)
    return (
      <div>
        <PageHeader title={L("غير موجود", "Not found")} back="/library/" />
        <Alert>{L("لم يتم العثور على هذا التمرين.", "This exercise wasn't found.")}</Alert>
      </div>
    );

  return (
    <div>
      <PageHeader title="" back="/library/" />
      <ExerciseDetails e={e} settings={settings} onAlternatives={() => setAltOpen(true)} />

      <Section title={L("صورة الجهاز في جيمك", "Photo of the machine in your gym")}>
        <ImageManager exerciseId={e.id} />
      </Section>

      <Modal open={altOpen} onClose={() => setAltOpen(false)} title={L("البدائل", "Alternatives")}>
        <AlternativesPanel base={e} settings={settings} all={map} />
        <p className="text-xs text-muted">{L("لاختيار بديل لحصة معينة افتح البدائل من شاشة التمرين.", "To use an alternative in a session, open it from the workout screen.")}</p>
      </Modal>

      {e.custom && (
        <Section title={L("إدارة التمرين المخصص", "Manage custom exercise")}>
          <div className="grid grid-cols-2 gap-2">
            <Link href={`/library/custom/?id=${encodeURIComponent(e.id)}`} className="btn-secondary">
              {L("تعديل", "Edit")}
            </Link>
            <button className="btn-danger" onClick={() => setConfirmDelete(true)}>
              {L("حذف", "Delete")}
            </button>
          </div>
          <Modal
            open={confirmDelete}
            onClose={() => setConfirmDelete(false)}
            title={L("حذف التمرين المخصص", "Delete custom exercise")}
            footer={
              <div className="grid grid-cols-2 gap-2">
                <button className="btn-secondary" onClick={() => setConfirmDelete(false)}>
                  {L("رجوع", "Back")}
                </button>
                <button
                  className="btn-danger"
                  onClick={async () => {
                    // لا نحذف تمرينًا مستخدمًا في حصة معدلة أو حصة قيد التنفيذ حتى لا تنكسر
                    const usedInPlan = (await db.overrides.toArray()).some((o) => o.exercises?.some((x) => x.exerciseId === e.id));
                    const usedLive = (await db.workouts.where("status").equals("in_progress").toArray()).some((w) => w.entries.some((x) => x.exerciseId === e.id));
                    if (usedInPlan || usedLive) {
                      setDeleteError(L("التمرين مستخدم في حصة معدلة أو حصة قيد التنفيذ. شيله منها الأول.", "This exercise is used in an edited or in-progress session. Remove it there first."));
                      return;
                    }
                    await db.customExercises.delete(e.id);
                    router.push("/library/");
                  }}
                >
                  {L("حذف", "Delete")}
                </button>
              </div>
            }
          >
            {L("هيتشال من المكتبة. سجلات التمارين القديمة اللي استخدمته هتفضل محفوظة.", "It will be removed from the library. Past logs that used it are kept.")}
            {deleteError && <p className="mt-2 text-red-600">{deleteError}</p>}
          </Modal>
        </Section>
      )}
    </div>
  );
}
