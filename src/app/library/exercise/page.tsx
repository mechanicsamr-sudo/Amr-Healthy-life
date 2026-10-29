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
  const [url, setUrl] = useState("");
  const [source, setSource] = useState("");
  const [err, setErr] = useState("");

  return (
    <div className="card space-y-3">
      <p className="text-sm text-muted">
        أفضل صورة مطابقة هي صورة الجهاز الفعلي في صالتك. الصورة تُحفظ على جهازك فقط وتظهر بعلامة &quot;صورة أضفتها أنت&quot;.
      </p>
      <label className="btn-primary w-full cursor-pointer">
        التقاط/اختيار صورة للجهاز
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
              await db.media.put({ exerciseId, imageUrl: null, imageDataUrl: dataUrl, source: "صورة من صالتي", updatedAt: Date.now() });
              setErr("");
            } catch {
              setErr("تعذر قراءة الصورة.");
            }
          }}
        />
      </label>
      <details>
        <summary className="cursor-pointer text-sm font-medium">أو أضف رابط صورة من الإنترنت</summary>
        <div className="mt-2 space-y-2">
          <input className="input ltr" type="url" placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} aria-label="رابط الصورة" />
          <input className="input" placeholder="مصدر الصورة (اسم الموقع)" value={source} onChange={(e) => setSource(e.target.value)} aria-label="مصدر الصورة" />
          <button
            className="btn-secondary w-full"
            onClick={async () => {
              if (!/^https:\/\//.test(url)) return setErr("أدخل رابطًا يبدأ بـ https://");
              if (!source.trim()) return setErr("اكتب مصدر الصورة.");
              await db.media.put({ exerciseId, imageUrl: url, imageDataUrl: null, source: source.trim(), updatedAt: Date.now() });
              setErr("");
              setUrl("");
            }}
          >
            حفظ الرابط
          </button>
          <p className="text-xs text-muted">تأكد بنفسك أن الصورة لنفس الجهاز. صور الروابط الخارجية لا تظهر دون اتصال.</p>
        </div>
      </details>
      {err && <p className="text-sm text-red-600">{err}</p>}
      {media && (
        <button className="btn-ghost w-full text-sm text-red-600" onClick={() => db.media.delete(exerciseId)}>
          إزالة الصورة المضافة
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
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  if (!loaded || id === null) return <Loading />;
  const e = map[id];
  if (!e)
    return (
      <div>
        <PageHeader title="غير موجود" back="/library/" />
        <Alert>لم يتم العثور على هذا التمرين.</Alert>
      </div>
    );

  return (
    <div>
      <PageHeader title={e.nameAr} back="/library/" />
      <ExerciseDetails e={e} settings={settings} />

      <Section title="صورة الجهاز">
        <ImageManager exerciseId={e.id} />
      </Section>

      <Section title="البدائل">
        <AlternativesPanel base={e} settings={settings} all={map} />
        <p className="text-xs text-muted">لاختيار بديل لحصة معينة، افتح البدائل من شاشة التمرين المباشر. الاختيار هنا للاطلاع فقط.</p>
      </Section>

      {e.custom && (
        <Section title="إدارة التمرين المخصص">
          <div className="grid grid-cols-2 gap-2">
            <Link href={`/library/custom/?id=${encodeURIComponent(e.id)}`} className="btn-secondary">
              تعديل
            </Link>
            <button className="btn-danger" onClick={() => setConfirmDelete(true)}>
              حذف
            </button>
          </div>
          <Modal
            open={confirmDelete}
            onClose={() => setConfirmDelete(false)}
            title="حذف التمرين المخصص"
            footer={
              <div className="grid grid-cols-2 gap-2">
                <button className="btn-secondary" onClick={() => setConfirmDelete(false)}>
                  رجوع
                </button>
                <button
                  className="btn-danger"
                  onClick={async () => {
                    // لا نحذف تمرينًا مستخدمًا في حصة معدلة أو حصة قيد التنفيذ حتى لا تنكسر
                    const usedInPlan = (await db.overrides.toArray()).some((o) => o.exercises?.some((x) => x.exerciseId === e.id));
                    const usedLive = (await db.workouts.where("status").equals("in_progress").toArray()).some((w) => w.entries.some((x) => x.exerciseId === e.id));
                    if (usedInPlan || usedLive) {
                      setDeleteError("هذا التمرين مستخدم في حصة معدلة أو حصة قيد التنفيذ. أزله منها أولًا.");
                      return;
                    }
                    await db.customExercises.delete(e.id);
                    router.push("/library/");
                  }}
                >
                  حذف
                </button>
              </div>
            }
          >
            سيتم حذف التمرين من المكتبة. سجلات التمارين السابقة التي استخدمته تبقى محفوظة كما هي.
            {deleteError && <p className="mt-2 text-red-600">{deleteError}</p>}
          </Modal>
        </Section>
      )}
    </div>
  );
}
