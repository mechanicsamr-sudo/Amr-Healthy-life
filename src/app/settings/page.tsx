"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Alert, Choice, Loading, Modal, NumberField, PageHeader, Section } from "@/components/ui";
import { CATEGORIES, EQUIPMENT_INFO, type EquipmentCategory } from "@/data/equipment";
import { BackupError, downloadText, exportBackup, importBackup, measurementsToCSV, validateBackup, workoutsToCSV, type BackupFile } from "@/lib/backup";
import { db, saveSettings, updateSettings } from "@/lib/db";
import { formatDateLong, isValidISODate, todayISO } from "@/lib/dates";
import { useExercises, useSettings } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { EQUIPMENT, LEVELS, WEEKDAYS_AR, WEEKDAYS_EN } from "@/lib/labels";
import { programEndDate } from "@/lib/schedule";
import { THEMES, resolveMode, type Mode } from "@/lib/themes";
import type { Availability, EquipmentId, Level, Settings } from "@/lib/types";

const DAY_ORDER = [6, 0, 1, 2, 3, 4, 5];

/** المظهر واللغة: تُطبق فورًا وتُحفظ مباشرة */
function AppearanceSection({ settings }: { settings: Settings }) {
  const { L, lang, pick } = useI18n();
  const [systemDark, setSystemDark] = useState(true);
  useEffect(() => setSystemDark(matchMedia("(prefers-color-scheme: dark)").matches), []);
  const mode: Mode = resolveMode(settings.theme, systemDark);
  return (
    <>
      <Section title={L("اللغة · Language", "Language · اللغة")}>
        <div className="card p-3">
          <Choice
            cols={2}
            options={[
              { id: "ar" as const, label: "العربية", sub: "Arabic · RTL" },
              { id: "en" as const, label: "English", sub: "الإنجليزية · LTR" },
            ]}
            value={settings.language}
            onChange={(v) => v && updateSettings((s) => ({ ...s, language: v }))}
            allowClear={false}
            testId="language-choice"
          />
          <p className="mt-2 text-xs text-muted">{L("تغيير اللغة مش بيغير أي بيانات أو سجلات.", "Changing the language never changes your data or history.")}</p>
        </div>
      </Section>
      <Section title={L("المظهر والثيمات", "Appearance & themes")}>
        <div className="card space-y-3 p-3" id="appearance">
          <Choice
            label={L("وضع العرض", "Display mode")}
            options={[
              { id: "dark" as const, label: L("🌙 داكن", "🌙 Dark"), sub: "Dark" },
              { id: "light" as const, label: L("☀️ فاتح", "☀️ Light"), sub: "Light" },
              { id: "system" as const, label: L("📱 حسب الموبايل", "📱 System"), sub: "System" },
            ]}
            value={settings.theme}
            onChange={(v) => v && updateSettings((s) => ({ ...s, theme: v }))}
            allowClear={false}
            testId="mode-choice"
          />
          <div>
            <div className="label">{L("الثيم", "Theme")}</div>
            <div className="grid grid-cols-2 gap-2" data-testid="theme-grid">
              {THEMES.map((t) => {
                const p = t[mode];
                const on = settings.themeId === t.id;
                return (
                  <button
                    key={t.id}
                    aria-pressed={on}
                    className="relative rounded-2xl border-2 p-1.5 text-start transition"
                    style={{ borderColor: on ? "rgb(var(--accent))" : "rgb(var(--border))", background: `rgb(${p.surface})` }}
                    onClick={() => updateSettings((s) => ({ ...s, themeId: t.id }))}
                    data-testid={`theme-${t.id}`}
                  >
                    <div className="relative h-24 overflow-hidden rounded-xl" style={{ background: `rgb(${p.bg})` }}>
                      <div className="absolute inset-0" style={{ background: p.hero, opacity: mode === "dark" ? 1 : 0.5 }} />
                      <div className="absolute start-2 top-2 font-display text-sm font-black leading-none" style={{ color: `rgb(${p.heroText})` }}>
                        {lang === "en" ? "DAILY" : "تمرين"}
                        <br />
                        {lang === "en" ? "WORKOUT" : "اليوم"}
                      </div>
                      <div className="absolute bottom-2 start-2 h-3.5 w-12 rounded-full" style={{ background: `rgb(${p.go})` }} />
                      <div className="absolute bottom-2 end-2 h-8 w-8 rounded-full border-4" style={{ borderColor: `rgb(${p.accent})` }} />
                    </div>
                    <div className="mt-1.5 flex gap-1">
                      {[p.bg, p.surface, p.accent, p.go, p.text].map((c, i) => (
                        <i key={i} className="h-3.5 w-3.5 rounded-full border" style={{ background: `rgb(${c})`, borderColor: `rgb(${p.border})` }} />
                      ))}
                    </div>
                    <div className="mt-1 text-xs font-bold" style={{ color: `rgb(${p.text})` }}>
                      {pick(t.name)}
                    </div>
                    <div className="ltr text-start text-[10px]" style={{ color: `rgb(${p.muted})` }}>
                      {t.name.en}
                    </div>
                    {on && (
                      <span className="absolute -end-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold" style={{ background: "rgb(var(--accent))", color: "rgb(var(--on-accent))" }}>
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted">{L("التغيير فوري ومحفوظ تلقائيًا.", "Applies instantly and is saved automatically.")}</p>
          </div>
        </div>
      </Section>
    </>
  );
}

function BackupSection() {
  const { map } = useExercises();
  const { L, lang } = useI18n();
  const [pending, setPending] = useState<BackupFile | null>(null);
  const [mode, setMode] = useState<"merge" | "replace">("merge");
  const [msg, setMsg] = useState<{ tone: "green" | "red"; text: string } | null>(null);
  const stamp = todayISO();

  return (
    <div className="card space-y-2 p-3">
      <Alert tone="blue">
        {L(
          "بياناتك محفوظة على الجهاز ده والمتصفح ده بس. مفيش مزامنة بين الأجهزة ولا حفظ سحابي. صدّر نسخة احتياطية بانتظام.",
          "Your data is stored only on this device and browser. There's no sync between devices and no cloud backup. Export a backup regularly.",
        )}
      </Alert>
      <button className="btn-primary w-full" data-testid="export-json" onClick={async () => downloadText(`gym-backup-${stamp}.json`, JSON.stringify(await exportBackup(), null, 2), "application/json")}>
        {L("تصدير نسخة احتياطية كاملة (JSON)", "Export full backup (JSON)")}
      </button>
      <div className="grid grid-cols-2 gap-2">
        <button
          className="btn-secondary text-sm"
          data-testid="export-csv"
          onClick={async () => downloadText(`gym-workouts-${stamp}.csv`, workoutsToCSV(await db.workouts.toArray(), (id) => ({ ar: map[id]?.nameAr ?? id, en: map[id]?.nameEn ?? id })), "text/csv;charset=utf-8")}
        >
          {L("سجل التمارين CSV", "Workout log CSV")}
        </button>
        <button className="btn-secondary text-sm" onClick={async () => downloadText(`gym-measurements-${stamp}.csv`, measurementsToCSV(await db.measurements.toArray()), "text/csv;charset=utf-8")}>
          {L("القياسات CSV", "Measurements CSV")}
        </button>
      </div>
      <label className="btn-secondary w-full cursor-pointer">
        {L("استيراد نسخة احتياطية", "Import a backup")}
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
              setMsg({ tone: "red", text: err instanceof BackupError ? err.message : L("تعذر قراءة الملف. تأكد إنه ملف JSON صحيح.", "Couldn't read the file. Make sure it's a valid JSON backup.") });
            }
          }}
        />
      </label>
      <Link href="/reports/" className="btn-secondary w-full">
        {L("طباعة ملخص التمارين (التقارير)", "Print workout summary (Reports)")}
      </Link>
      {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
      <Modal
        open={!!pending}
        onClose={() => setPending(null)}
        title={L("استيراد نسخة احتياطية", "Import backup")}
        footer={
          <div className="grid grid-cols-2 gap-2">
            <button className="btn-secondary" onClick={() => setPending(null)}>
              {L("إلغاء", "Cancel")}
            </button>
            <button
              className={mode === "replace" ? "btn-danger" : "btn-primary"}
              data-testid="confirm-import"
              onClick={async () => {
                if (!pending) return;
                const r = await importBackup(pending, mode);
                setPending(null);
                setMsg({ tone: "green", text: L(`تم الاستيراد: ${r.workouts} حصة، ${r.measurements} قياس، ${r.wellness} سجل تعافٍ.`, `Imported: ${r.workouts} sessions, ${r.measurements} measurements, ${r.wellness} recovery logs.`) });
              }}
            >
              {L("استيراد", "Import")}
            </button>
          </div>
        }
      >
        {pending && (
          <div className="space-y-3 text-sm">
            <p>
              {L("تاريخ النسخة:", "Backup date:")} {pending.exportedAt ? new Date(pending.exportedAt).toLocaleString(lang === "en" ? "en-GB" : "ar-EG-u-nu-latn") : "—"} · {pending.data.workouts.length} {L("حصة", "sessions")} · {pending.data.measurements.length} {L("قياس", "measurements")}
            </p>
            <Choice
              cols={1}
              options={[
                { id: "merge" as const, label: L("دمج (موصى به)", "Merge (recommended)"), sub: L("إضافة وتحديث بدون حذف أي بيانات موجودة", "Add and update without deleting anything") },
                { id: "replace" as const, label: L("استبدال", "Replace"), sub: L("حذف كل البيانات الحالية واستبدالها بالنسخة", "Delete all current data and replace it"), danger: true },
              ]}
              value={mode}
              onChange={(v) => v && setMode(v)}
              allowClear={false}
            />
            {mode === "replace" && <Alert tone="red">{L("هيتم حذف البيانات الحالية. صدّر نسخة الأول لو مش متأكد.", "Current data will be deleted. Export a backup first if unsure.")}</Alert>}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function SettingsPage() {
  const { settings, loaded } = useSettings();
  const { L, lang, pick } = useI18n();
  const [d, setD] = useState<Settings | null>(null);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");
  const [eqCat, setEqCat] = useState<EquipmentCategory>("machines");

  const strip = (x: Settings) => JSON.stringify({ ...x, theme: 0, themeId: 0, language: 0, equipment: 0, safetyAcknowledgedAt: 0 });
  const base = useRef<string | null>(null);
  // مزامنة المسودة مع الإعدادات المحفوظة إذا تغيرت من مكان آخر ولم يعدلها المستخدم بعد
  useEffect(() => {
    if (!loaded) return;
    if (!d || strip(d) === base.current) setD(settings);
    base.current = strip(settings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, settings]);

  if (!d) return <Loading />;
  const p = d.profile;
  const setP = (patch: Partial<Settings["profile"]>) => setD({ ...d, profile: { ...p, ...patch } });
  const setC = (patch: Partial<Settings["profile"]["conditions"]>) => setP({ conditions: { ...p.conditions, ...patch } });
  const dirty = strip(d) !== strip(settings);
  const weekdays = lang === "en" ? WEEKDAYS_EN : WEEKDAYS_AR;

  const save = async () => {
    if (!isValidISODate(p.startDate)) return setErr(L("تاريخ البداية غير صحيح.", "Invalid start date."));
    if (p.trainingDays.length !== 3) return setErr(L("اختار 3 أيام تدريب بالظبط.", "Choose exactly 3 training days."));
    if (!(p.startWeightKg > 30 && p.startWeightKg < 400)) return setErr(L("الوزن الابتدائي غير منطقي.", "The starting weight looks wrong."));
    if (!(p.heightCm > 100 && p.heightCm < 250)) return setErr(L("الطول غير منطقي.", "The height looks wrong."));
    setErr("");
    // المظهر والمعدات تُحفظ فورًا من أماكنها؛ نأخذ أحدث قيمها
    await saveSettings({ ...d, theme: settings.theme, themeId: settings.themeId, language: settings.language, equipment: settings.equipment, safetyAcknowledgedAt: settings.safetyAcknowledgedAt });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const toggleDay = (day: number) => {
    const has = p.trainingDays.includes(day);
    if (has) setP({ trainingDays: p.trainingDays.filter((x) => x !== day) });
    else if (p.trainingDays.length < 3) setP({ trainingDays: [...p.trainingDays, day] });
  };

  return (
    <div>
      <PageHeader display title={L("الإعدادات", "Settings")} />

      <div className="mb-5 grid grid-cols-3 gap-2">
        <Link href="/program/" className="btn-secondary text-sm">
          {L("البرنامج", "Program")}
        </Link>
        <Link href="/safety/" className="btn-secondary text-sm">
          {L("السلامة", "Safety")}
        </Link>
        <Link href="/credits/" className="btn-secondary text-sm">
          {L("المصادر", "Credits")}
        </Link>
      </div>

      <AppearanceSection settings={settings} />

      <Section title={L("بيانات المستخدم", "Profile")}>
        <div className="card space-y-3 p-3">
          <div>
            <label className="label" htmlFor="name">
              {L("الاسم (اختياري)", "Name (optional)")}
            </label>
            <input id="name" className="input" value={p.name} onChange={(e) => setP({ name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <NumberField label={L("الوزن الابتدائي (كجم)", "Starting weight (kg)")} value={p.startWeightKg} step={0.1} onChange={(v) => setP({ startWeightKg: v ?? 0 })} testId="start-weight" />
            <NumberField label={L("الطول (سم)", "Height (cm)")} value={p.heightCm} step={1} onChange={(v) => setP({ heightCm: v ?? 0 })} />
          </div>
          <p className="text-xs text-muted">{L("الوزن الابتدائي ثابت كمرجع. سجّل الوزن الجديد من صفحة التقدم.", "The starting weight is a fixed reference. Log new weights on the Progress page.")}</p>
          <Choice label={L("المستوى", "Level")} options={(Object.keys(LEVELS) as Level[]).map((k) => ({ id: k, label: pick(LEVELS[k]) }))} value={p.level} onChange={(v) => v && setP({ level: v })} allowClear={false} />
          <div>
            <label className="label" htmlFor="goal">
              {L("الهدف", "Goal")}
            </label>
            <textarea id="goal" className="input min-h-16" value={p.goal} onChange={(e) => setP({ goal: e.target.value })} />
          </div>
        </div>
      </Section>

      <Section title={L("الحالة الصحية المسجلة", "Recorded health conditions")}>
        <div className="card space-y-3 p-3">
          <p className="text-xs text-muted">{L("بتُستخدم بس للتنبيهات وترتيب البدائل. التطبيق مش بيغيرها لوحده ولا بيشخّص أي حالة ولا بيقترح تغيير دواء.", "Used only for warnings and ranking alternatives. The app never changes these on its own, never diagnoses, and never suggests medication changes.")}</p>
          {(
            [
              ["kneeOA", "kneeNote", L("خشونة الركبة", "Knee osteoarthritis")],
              ["backPain", "backNote", L("ألم الظهر", "Back pain")],
              ["bpMeds", "bpNote", L("دواء الضغط", "Blood-pressure medication")],
            ] as const
          ).map(([flag, note, label]) => (
            <div key={flag}>
              <label className="flex items-center gap-2 font-medium">
                <input type="checkbox" className="h-5 w-5" checked={p.conditions[flag]} onChange={(e) => setC({ [flag]: e.target.checked })} />
                {label}
              </label>
              <input className="input mt-1" value={p.conditions[note]} onChange={(e) => setC({ [note]: e.target.value })} aria-label={`${label} – ${L("ملاحظة", "note")}`} />
            </div>
          ))}
          <div>
            <label className="label" htmlFor="other">
              {L("ملاحظات صحية أخرى", "Other health notes")}
            </label>
            <input id="other" className="input" value={p.conditions.other} onChange={(e) => setC({ other: e.target.value })} />
          </div>
        </div>
      </Section>

      <Section title={L("الجدول", "Schedule")}>
        <div className="card space-y-3 p-3">
          <div>
            <label className="label" htmlFor="start">
              {L("تاريخ بداية البرنامج", "Program start date")}
            </label>
            <input id="start" type="date" className="input ltr" value={p.startDate} onChange={(e) => setP({ startDate: e.target.value })} />
            {isValidISODate(p.startDate) && (
              <p className="mt-1 text-xs text-muted">
                {L("النهاية:", "Ends:")} {formatDateLong(programEndDate(p.startDate), lang)} ({L("26 أسبوع", "26 weeks")})
              </p>
            )}
          </div>
          <fieldset>
            <legend className="label">{L("أيام التدريب (3 أيام)", "Training days (3 days)")}</legend>
            <div className="flex flex-wrap gap-1.5">
              {DAY_ORDER.map((day) => (
                <button key={day} type="button" aria-pressed={p.trainingDays.includes(day)} className={`chip ${p.trainingDays.includes(day) ? "chip-active" : ""}`} onClick={() => toggleDay(day)}>
                  {weekdays[day]}
                </button>
              ))}
            </div>
          </fieldset>
          <p className="text-xs text-muted">{L("تغيير الجدول بيغير مواعيد الحصص غير المكتملة بس.", "Changing the schedule only moves sessions that aren't completed.")}</p>
        </div>
      </Section>

      <Section title={L("المؤقت", "Timer")}>
        <div className="card space-y-3 p-3">
          <NumberField label={L("الراحة الافتراضية (ثانية)", "Default rest (seconds)")} value={d.defaultRestSec} step={15} min={15} max={600} onChange={(v) => setD({ ...d, defaultRestSec: v ?? 90 })} />
          <label className="flex items-center gap-2">
            <input type="checkbox" className="h-5 w-5" checked={d.sound} onChange={(e) => setD({ ...d, sound: e.target.checked })} />
            {L("صوت عند انتهاء الراحة", "Sound when rest ends")}
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="h-5 w-5" checked={d.vibrate} onChange={(e) => setD({ ...d, vibrate: e.target.checked })} />
            {L("اهتزاز عند انتهاء الراحة", "Vibrate when rest ends")}
          </label>
        </div>
      </Section>

      <div className={`${dirty || saved ? "sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-10" : ""} mb-5`}>
        {err && (
          <div className="mb-2">
            <Alert tone="red">{err}</Alert>
          </div>
        )}
        <button className="btn-primary w-full shadow-lg" disabled={!dirty} onClick={save} data-testid="save-settings">
          {saved ? L("✓ تم الحفظ", "✓ Saved") : dirty ? L("حفظ الإعدادات", "Save settings") : L("لا توجد تغييرات", "No changes")}
        </button>
      </div>

      <Section title={L("المعدات المتاحة في جيمي", "Equipment in my gym")}>
        <div className="card p-3">
          <p className="mb-2 text-xs text-muted">{L("الافتراضي «مش عارف». اختيارك بيتحفظ فورًا وبيحسّن ترتيب البدائل.", "Default is “Not sure”. Your choice saves instantly and improves alternative ranking.")}</p>
          <div className="-mx-3 mb-2 flex gap-1.5 overflow-x-auto px-3 pb-1">
            {(Object.keys(CATEGORIES) as EquipmentCategory[]).map((c) => (
              <button key={c} className={`chip shrink-0 ${eqCat === c ? "chip-active" : ""}`} onClick={() => setEqCat(c)}>
                {pick(CATEGORIES[c])}
              </button>
            ))}
          </div>
          <ul data-testid="equipment-settings">
            {EQUIPMENT_INFO.filter((e) => e.category === eqCat).map(({ id }) => (
              <li key={id} className="border-b border-base py-2.5 last:border-0">
                <div className="mb-1.5 flex items-baseline justify-between gap-2">
                  <span className="text-sm font-bold">{pick(EQUIPMENT[id])}</span>
                  <span className="ltr truncate text-xs text-muted">{lang === "ar" ? EQUIPMENT[id].en : EQUIPMENT[id].ar}</span>
                </div>
                <Choice
                  options={[
                    { id: "available" as Availability, label: L("متاح", "Available") },
                    { id: "unavailable" as Availability, label: L("غير متاح", "Not available") },
                    { id: "unknown" as Availability, label: L("مش عارف", "Not sure") },
                  ]}
                  value={settings.equipment[id as EquipmentId] ?? "unknown"}
                  onChange={(v) => updateSettings((s) => ({ ...s, equipment: { ...s.equipment, [id]: v ?? "unknown" } }))}
                  allowClear={false}
                />
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section title={L("النسخ الاحتياطي والتقارير", "Backup & reports")}>
        <BackupSection />
      </Section>

      <p className="text-center text-xs text-muted">{L("الإصدار 2.0 · البيانات محلية فقط", "Version 2.0 · data stays on this device")}</p>
    </div>
  );
}
