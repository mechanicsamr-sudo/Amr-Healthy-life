"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert, Loading, PageHeader } from "@/components/ui";
import { EXERCISE_MAP } from "@/data/exercises";
import { db, uid } from "@/lib/db";
import { useSearchParam } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { EQUIPMENT, LEVELS, LOADS, MUSCLE_ORDER, MUSCLES, PATTERNS } from "@/lib/labels";
import type { EquipmentId, Exercise, Level, Load, MovementPattern, MuscleGroup } from "@/lib/types";

const lines = (s: string) =>
  s
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

const empty = {
  nameAr: "",
  nameEn: "",
  aliases: "",
  kind: "strength" as Exercise["kind"],
  primary: [] as MuscleGroup[],
  secondary: [] as MuscleGroup[],
  pattern: "horizontal_push" as MovementPattern,
  equipment: [] as EquipmentId[],
  level: "beginner" as Level,
  kneeLoad: "low" as Load,
  backLoad: "low" as Load,
  bpCaution: false,
  setup: "",
  steps: "",
  mistakes: "",
  breathing: "ازفر أثناء المجهود واستنشق أثناء الرجوع. لا تحبس النفس.",
  precautions: "",
  guideline: "2-3 مجموعات × 10-12 تكرار",
};

function MultiChips<T extends string>({ options, value, onChange, label }: { options: { id: T; label: string }[]; value: T[]; onChange: (v: T[]) => void; label: string }) {
  return (
    <fieldset>
      <legend className="label">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = value.includes(o.id);
          return (
            <button type="button" key={o.id} aria-pressed={on} className={`chip ${on ? "chip-active" : ""}`} onClick={() => onChange(on ? value.filter((x) => x !== o.id) : [...value, o.id])}>
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function CustomExercisePage() {
  const id = useSearchParam("id");
  const router = useRouter();
  const { L, pick } = useI18n();
  const [f, setF] = useState(empty);
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    // useSearchParam يعيد null حتى يُقرأ الرابط؛ ننتظر دورة واحدة
    const t = setTimeout(async () => {
      const editId = new URLSearchParams(location.search).get("id");
      if (editId) {
        const e = await db.customExercises.get(editId);
        if (e)
          setF({
            nameAr: e.nameAr,
            nameEn: e.nameEn,
            aliases: e.aliases.join("، "),
            kind: e.kind,
            primary: e.primaryMuscles,
            secondary: e.secondaryMuscles,
            pattern: e.pattern,
            equipment: e.equipment,
            level: e.level,
            kneeLoad: e.kneeLoad,
            backLoad: e.backLoad,
            bpCaution: e.bpCaution,
            setup: e.setup.join("\n"),
            steps: e.steps.join("\n"),
            mistakes: e.mistakes.join("\n"),
            breathing: e.breathing,
            precautions: e.precautions.join("\n"),
            guideline: e.guideline,
          });
      }
      setReady(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  if (!ready) return <Loading />;
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));

  const save = async () => {
    if (!f.nameAr.trim() || !f.nameEn.trim()) return setErr(L("الاسم العربي والإنجليزي مطلوبان.", "Arabic and English names are required."));
    if (!f.primary.length) return setErr(L("اختر عضلة رئيسية واحدة على الأقل.", "Choose at least one primary muscle."));
    if (!f.equipment.length) return setErr(L("اختر المعدات المطلوبة (أو بدون معدات).", "Choose the required equipment (or none)."));
    const exId = id && !EXERCISE_MAP[id] ? id : uid("custom_");
    const e: Exercise = {
      id: exId,
      nameAr: f.nameAr.trim(),
      nameEn: f.nameEn.trim(),
      aliases: f.aliases
        .split(/[،,]/)
        .map((x) => x.trim())
        .filter(Boolean),
      kind: f.kind,
      primaryMuscles: f.primary,
      secondaryMuscles: f.secondary.filter((m) => !f.primary.includes(m)),
      pattern: f.kind === "cardio" ? "cardio" : f.pattern,
      equipment: f.equipment,
      level: f.level,
      kneeLoad: f.kneeLoad,
      backLoad: f.backLoad,
      bpCaution: f.bpCaution,
      setup: lines(f.setup),
      steps: lines(f.steps),
      mistakes: lines(f.mistakes),
      breathing: f.breathing.trim(),
      precautions: lines(f.precautions),
      guideline: f.guideline.trim(),
      image: { url: null, source: null, deviceName: f.nameEn.trim(), verification: "missing" },
      alternatives: [],
      custom: true,
    };
    await db.customExercises.put(e);
    router.push(`/library/exercise/?id=${encodeURIComponent(exId)}`);
  };

  const muscleOpts = MUSCLE_ORDER.map((m) => ({ id: m, label: pick(MUSCLES[m]) }));

  return (
    <div>
      <PageHeader title={id ? L("تعديل تمرين مخصص", "Edit custom exercise") : L("إضافة تمرين مخصص", "Add custom exercise")} back="/library/" />
      <div className="mb-3">
        <Alert tone="blue">{L("أضف جهازًا موجودًا في صالتك وغير موجود في المكتبة. المعلومات التي تدخلها لا يتحقق منها التطبيق.", "Add a machine from your gym that isn't in the library. The app doesn't verify the information you enter.")}</Alert>
      </div>
      <div className="space-y-4">
        <div>
          <label className="label" htmlFor="nameAr">{L("الاسم العربي *", "Arabic name *")}</label>
          <input id="nameAr" className="input" value={f.nameAr} onChange={(e) => set("nameAr", e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="nameEn">{L("الاسم الإنجليزي الشائع *", "Common English name *")}</label>
          <input id="nameEn" className="input ltr" value={f.nameEn} onChange={(e) => set("nameEn", e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="aliases">{L("أسماء بديلة للبحث (افصل بفاصلة)", "Other search names (comma-separated)")}</label>
          <input id="aliases" className="input" value={f.aliases} onChange={(e) => set("aliases", e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label" htmlFor="kind">{L("النوع", "Type")}</label>
            <select id="kind" className="input" value={f.kind} onChange={(e) => set("kind", e.target.value as Exercise["kind"])}>
              <option value="strength">{L("مقاومة", "Strength")}</option>
              <option value="cardio">{L("كارديو", "Cardio")}</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="pattern">{L("نمط الحركة", "Movement pattern")}</label>
            <select id="pattern" className="input" value={f.pattern} disabled={f.kind === "cardio"} onChange={(e) => set("pattern", e.target.value as MovementPattern)}>
              {Object.entries(PATTERNS)
                .filter(([k]) => k !== "cardio")
                .map(([k, v]) => (
                  <option key={k} value={k}>
                    {pick(v)}
                  </option>
                ))}
            </select>
          </div>
        </div>
        <MultiChips label={L("العضلات الرئيسية *", "Primary muscles *")} options={muscleOpts} value={f.primary} onChange={(v) => set("primary", v)} />
        <MultiChips label={L("العضلات الثانوية", "Secondary muscles")} options={muscleOpts} value={f.secondary} onChange={(v) => set("secondary", v)} />
        <MultiChips
          label={L("المعدات المطلوبة *", "Required equipment *")}
          options={(Object.keys(EQUIPMENT) as EquipmentId[]).map((x) => ({ id: x, label: pick(EQUIPMENT[x]) }))}
          value={f.equipment}
          onChange={(v) => set("equipment", v)}
        />
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="label" htmlFor="level">{L("المستوى", "Level")}</label>
            <select id="level" className="input" value={f.level} onChange={(e) => set("level", e.target.value as Level)}>
              {Object.entries(LEVELS).map(([k, v]) => (
                <option key={k} value={k}>{pick(v)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="knee">{L("حمل الركبة", "Knee load")}</label>
            <select id="knee" className="input" value={f.kneeLoad} onChange={(e) => set("kneeLoad", e.target.value as Load)}>
              {Object.entries(LOADS).map(([k, v]) => (
                <option key={k} value={k}>{pick(v)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="back">{L("حمل الظهر", "Back load")}</label>
            <select id="back" className="input" value={f.backLoad} onChange={(e) => set("backLoad", e.target.value as Load)}>
              {Object.entries(LOADS).map(([k, v]) => (
                <option key={k} value={k}>{pick(v)}</option>
              ))}
            </select>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="h-5 w-5" checked={f.bpCaution} onChange={(e) => set("bpCaution", e.target.checked)} />
          {L("قد يشجع على حبس النفس أو يتطلب النهوض من الاستلقاء", "May encourage breath-holding or requires getting up from lying down")}
        </label>
        {(
          [
            ["setup", L("طريقة ضبط الجهاز (سطر لكل خطوة)", "Machine setup (one step per line)")],
            ["steps", L("خطوات الأداء (سطر لكل خطوة)", "How to perform (one step per line)")],
            ["mistakes", L("الأخطاء الشائعة (سطر لكل خطأ)", "Common mistakes (one per line)")],
            ["precautions", L("الاحتياطات (سطر لكل نقطة)", "Precautions (one per line)")],
          ] as const
        ).map(([k, l]) => (
          <div key={k}>
            <label className="label" htmlFor={k}>{l}</label>
            <textarea id={k} className="input min-h-24" value={f[k]} onChange={(e) => set(k, e.target.value)} />
          </div>
        ))}
        <div>
          <label className="label" htmlFor="breathing">{L("التنفس", "Breathing")}</label>
          <input id="breathing" className="input" value={f.breathing} onChange={(e) => set("breathing", e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="guideline">{L("المجموعات والتكرارات", "Sets & reps")}</label>
          <input id="guideline" className="input" value={f.guideline} onChange={(e) => set("guideline", e.target.value)} />
        </div>
        {err && <Alert tone="red">{err}</Alert>}
        <button className="btn-primary w-full" onClick={save} data-testid="save-custom">
          {L("حفظ", "Save")}
        </button>
      </div>
    </div>
  );
}
