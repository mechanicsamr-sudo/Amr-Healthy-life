"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Alert, Loading, Modal, NumberField, PageHeader, Section } from "@/components/ui";
import { BackupError, downloadText, exportBackup, importBackup, measurementsToCSV, validateBackup, workoutsToCSV, type BackupFile } from "@/lib/backup";
import { db, saveSettings } from "@/lib/db";
import { formatDateLong, isValidISODate, todayISO } from "@/lib/dates";
import { useExercises, useSettings } from "@/lib/hooks";
import { EQUIPMENT, LEVELS, WEEKDAYS_AR } from "@/lib/labels";
import { programEndDate } from "@/lib/schedule";
import type { Availability, EquipmentId, Level, Settings } from "@/lib/types";

const DAY_ORDER = [6, 0, 1, 2, 3, 4, 5];

function BackupSection() {
  const { map } = useExercises();
  const [pending, setPending] = useState<BackupFile | null>(null);
  const [mode, setMode] = useState<"merge" | "replace">("merge");
  const [msg, setMsg] = useState<{ tone: "green" | "red"; text: string } | null>(null);
  const stamp = todayISO();

  return (
    <div className="card space-y-2">
      <Alert tone="blue">
        بياناتك محفوظة محليًا على هذا الجهاز وهذا المتصفح فقط (IndexedDB). لا توجد مزامنة بين الأجهزة ولا حفظ سحابي. صدّر نسخة احتياطية بانتظام واحفظها في مكان آمن.
      </Alert>
      <button
        className="btn-primary w-full"
        data-testid="export-json"
        onClick={async () => downloadText(`gym-backup-${stamp}.json`, JSON.stringify(await exportBackup(), null, 2), "application/json")}
      >
        تصدير نسخة احتياطية كاملة (JSON)
      </button>
      <div className="grid grid-cols-2 gap-2">
        <button
          className="btn-secondary text-sm"
          data-testid="export-csv"
          onClick={async () => downloadText(`gym-workouts-${stamp}.csv`, workoutsToCSV(await db.workouts.toArray(), (id) => ({ ar: map[id]?.nameAr ?? id, en: map[id]?.nameEn ?? id })), "text/csv;charset=utf-8")}
        >
          سجل التمارين CSV
        </button>
        <button className="btn-secondary text-sm" onClick={async () => downloadText(`gym-measurements-${stamp}.csv`, measurementsToCSV(await db.measurements.toArray()), "text/csv;charset=utf-8")}>
          القياسات CSV
        </button>
      </div>
      <label className="btn-secondary w-full cursor-pointer">
        استيراد نسخة احتياطية
        <input
          type="file"
          accept="application/json,.json"
          className="sr-only"
          data-testid="import-file"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f) return;
            try {
              setPending(validateBackup(JSON.parse(await f.text())));
              setMsg(null);
            } catch (err) {
              setMsg({ tone: "red", text: err instanceof BackupError ? err.message : "تعذر قراءة الملف. تأكد أنه ملف JSON صحيح." });
            }
          }}
        />
      </label>
      <Link href="/reports/" className="btn-secondary w-full">
        طباعة ملخص التمارين (التقارير)
      </Link>
      {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
      <Modal
        open={!!pending}
        onClose={() => setPending(null)}
        title="استيراد نسخة احتياطية"
        footer={
          <div className="grid grid-cols-2 gap-2">
            <button className="btn-secondary" onClick={() => setPending(null)}>
              إلغاء
            </button>
            <button
              className={mode === "replace" ? "btn-danger" : "btn-primary"}
              data-testid="confirm-import"
              onClick={async () => {
                if (!pending) return;
                const r = await importBackup(pending, mode);
                setPending(null);
                setMsg({ tone: "green", text: `تم الاستيراد: ${r.workouts} حصة، ${r.measurements} قياس، ${r.wellness} سجل تعافٍ.` });
              }}
            >
              استيراد
            </button>
          </div>
        }
      >
        {pending && (
          <div className="space-y-3 text-sm">
            <p>
              تاريخ النسخة: {pending.exportedAt ? new Date(pending.exportedAt).toLocaleString("ar-EG-u-nu-latn") : "غير معروف"} · {pending.data.workouts.length} حصة · {pending.data.measurements.length} قياس
            </p>
            <label className="flex items-start gap-2">
              <input type="radio" name="mode" className="mt-1 h-5 w-5" checked={mode === "merge"} onChange={() => setMode("merge")} />
              <span>
                <b>دمج (موصى به):</b> إضافة وتحديث السجلات دون حذف أي بيانات موجودة.
              </span>
            </label>
            <label className="flex items-start gap-2">
              <input type="radio" name="mode" className="mt-1 h-5 w-5" checked={mode === "replace"} onChange={() => setMode("replace")} />
              <span>
                <b>استبدال:</b> حذف كل البيانات الحالية على هذا الجهاز واستبدالها بالنسخة.
              </span>
            </label>
            {mode === "replace" && <Alert tone="red">سيتم حذف البيانات الحالية. صدّر نسخة احتياطية أولًا إذا لم تكن متأكدًا.</Alert>}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function SettingsPage() {
  const { settings, loaded } = useSettings();
  const [d, setD] = useState<Settings | null>(null);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  const base = useRef<string | null>(null);
  // مزامنة المسودة مع الإعدادات المحفوظة إذا تغيرت من مكان آخر ولم يعدلها المستخدم بعد
  useEffect(() => {
    if (!loaded) return;
    if (!d || JSON.stringify(d) === base.current) setD(settings);
    base.current = JSON.stringify(settings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, settings]);

  if (!d) return <Loading />;
  const p = d.profile;
  const setP = (patch: Partial<Settings["profile"]>) => setD({ ...d, profile: { ...p, ...patch } });
  const setC = (patch: Partial<Settings["profile"]["conditions"]>) => setP({ conditions: { ...p.conditions, ...patch } });
  const dirty = JSON.stringify(d) !== JSON.stringify(settings);

  const save = async () => {
    if (!isValidISODate(p.startDate)) return setErr("تاريخ البداية غير صحيح.");
    if (p.trainingDays.length !== 3) return setErr("اختر 3 أيام تدريب بالضبط.");
    if (!(p.startWeightKg > 30 && p.startWeightKg < 400)) return setErr("الوزن الابتدائي غير منطقي.");
    if (!(p.heightCm > 100 && p.heightCm < 250)) return setErr("الطول غير منطقي.");
    setErr("");
    await saveSettings(d);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const toggleDay = (day: number) => {
    const has = p.trainingDays.includes(day);
    if (has) setP({ trainingDays: p.trainingDays.filter((x) => x !== day) });
    else if (p.trainingDays.length < 3) setP({ trainingDays: [...p.trainingDays, day] });
  };

  const setEq = (id: EquipmentId, v: Availability) => setD({ ...d, equipment: { ...d.equipment, [id]: v } });

  return (
    <div>
      <PageHeader title="الإعدادات" />

      <div className="mb-5 grid grid-cols-2 gap-2">
        <Link href="/program/" className="btn-secondary">
          البرنامج الكامل
        </Link>
        <Link href="/safety/" className="btn-secondary">
          السلامة والتنبيهات
        </Link>
      </div>

      <Section title="بيانات المستخدم">
        <div className="card space-y-3">
          <div>
            <label className="label" htmlFor="name">الاسم (اختياري)</label>
            <input id="name" className="input" value={p.name} onChange={(e) => setP({ name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <NumberField label="الوزن الابتدائي (كجم)" value={p.startWeightKg} step={0.1} onChange={(v) => setP({ startWeightKg: v ?? 0 })} testId="start-weight" />
            <NumberField label="الطول (سم)" value={p.heightCm} step={1} onChange={(v) => setP({ heightCm: v ?? 0 })} />
          </div>
          <p className="text-xs text-muted">الوزن الابتدائي ثابت كمرجع. لتسجيل وزن جديد استخدم &quot;تسجيل القياسات&quot; في صفحة التقدم.</p>
          <div>
            <label className="label" htmlFor="level">المستوى</label>
            <select id="level" className="input" value={p.level} onChange={(e) => setP({ level: e.target.value as Level })}>
              {Object.entries(LEVELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="goal">الهدف</label>
            <textarea id="goal" className="input min-h-16" value={p.goal} onChange={(e) => setP({ goal: e.target.value })} />
          </div>
        </div>
      </Section>

      <Section title="الحالة الصحية المسجلة">
        <div className="card space-y-3">
          <p className="text-xs text-muted">تُستخدم هذه البيانات فقط لعرض تنبيهات وترتيب البدائل. التطبيق لا يغيرها من تلقاء نفسه ولا يشخص أي حالة.</p>
          {(
            [
              ["kneeOA", "kneeNote", "خشونة الركبة"],
              ["backPain", "backNote", "ألم الظهر"],
              ["bpMeds", "bpNote", "تناول دواء الضغط"],
            ] as const
          ).map(([flag, note, label]) => (
            <div key={flag}>
              <label className="flex items-center gap-2 font-medium">
                <input type="checkbox" className="h-5 w-5" checked={p.conditions[flag]} onChange={(e) => setC({ [flag]: e.target.checked })} />
                {label}
              </label>
              <input className="input mt-1" value={p.conditions[note]} onChange={(e) => setC({ [note]: e.target.value })} aria-label={`ملاحظة ${label}`} />
            </div>
          ))}
          <div>
            <label className="label" htmlFor="other">ملاحظات صحية أخرى</label>
            <input id="other" className="input" value={p.conditions.other} onChange={(e) => setC({ other: e.target.value })} />
          </div>
        </div>
      </Section>

      <Section title="الجدول">
        <div className="card space-y-3">
          <div>
            <label className="label" htmlFor="start">تاريخ بداية البرنامج</label>
            <input id="start" type="date" className="input ltr" value={p.startDate} onChange={(e) => setP({ startDate: e.target.value })} />
            {isValidISODate(p.startDate) && <p className="mt-1 text-xs text-muted">النهاية: {formatDateLong(programEndDate(p.startDate))} (26 أسبوعًا)</p>}
          </div>
          <fieldset>
            <legend className="label">أيام التدريب (3 أيام)</legend>
            <div className="flex flex-wrap gap-1.5">
              {DAY_ORDER.map((day) => (
                <button key={day} type="button" aria-pressed={p.trainingDays.includes(day)} className={`chip ${p.trainingDays.includes(day) ? "chip-active" : ""}`} onClick={() => toggleDay(day)}>
                  {WEEKDAYS_AR[day]}
                </button>
              ))}
            </div>
          </fieldset>
          <p className="text-xs text-muted">تغيير الجدول يغير مواعيد الحصص غير المكتملة فقط. الحصص المسجلة تبقى بتواريخها الفعلية.</p>
        </div>
      </Section>

      <Section title="المظهر والمؤقت">
        <div className="card space-y-3">
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="الوضع">
            {(
              [
                ["system", "تلقائي"],
                ["light", "فاتح"],
                ["dark", "داكن"],
              ] as const
            ).map(([k, l]) => (
              <button key={k} role="radio" aria-checked={d.theme === k} className={`chip justify-center py-2 ${d.theme === k ? "chip-active" : ""}`} onClick={() => setD({ ...d, theme: k })} data-testid={`theme-${k}`}>
                {l}
              </button>
            ))}
          </div>
          <NumberField label="الراحة الافتراضية (ثانية)" value={d.defaultRestSec} step={15} min={15} max={600} onChange={(v) => setD({ ...d, defaultRestSec: v ?? 90 })} />
          <label className="flex items-center gap-2">
            <input type="checkbox" className="h-5 w-5" checked={d.sound} onChange={(e) => setD({ ...d, sound: e.target.checked })} />
            صوت عند انتهاء الراحة
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="h-5 w-5" checked={d.vibrate} onChange={(e) => setD({ ...d, vibrate: e.target.checked })} />
            اهتزاز عند انتهاء الراحة
          </label>
        </div>
      </Section>

      <Section title="المعدات المتوفرة في صالتي">
        <div className="card">
          <p className="mb-2 text-xs text-muted">الافتراضي &quot;غير محدد&quot;. حدّد ما هو متوفر لتحسين ترتيب البدائل.</p>
          <ul>
            {(Object.keys(EQUIPMENT) as EquipmentId[])
              .filter((x) => x !== "none")
              .map((id) => (
                <li key={id} className="flex items-center justify-between gap-2 border-b border-base py-2 last:border-0">
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{EQUIPMENT[id].ar}</div>
                    <div className="ltr text-start text-xs text-muted">{EQUIPMENT[id].en}</div>
                  </div>
                  <select className="input w-32 shrink-0 py-1 text-sm" value={d.equipment[id] ?? "unknown"} onChange={(e) => setEq(id, e.target.value as Availability)} aria-label={`توفر ${EQUIPMENT[id].ar}`}>
                    <option value="unknown">غير محدد</option>
                    <option value="available">متوفر</option>
                    <option value="unavailable">غير متوفر</option>
                  </select>
                </li>
              ))}
          </ul>
        </div>
      </Section>

      <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-10 mb-5">
        {err && <div className="mb-2"><Alert tone="red">{err}</Alert></div>}
        <button className="btn-primary w-full shadow-lg" disabled={!dirty} onClick={save} data-testid="save-settings">
          {saved ? "✓ تم الحفظ" : dirty ? "حفظ الإعدادات" : "لا توجد تغييرات"}
        </button>
      </div>

      <Section title="النسخ الاحتياطي والتقارير">
        <BackupSection />
      </Section>

      <p className="text-center text-xs text-muted">
        الإصدار 1.0 · البيانات محلية فقط
      </p>
    </div>
  );
}
