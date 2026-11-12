"use client";

import { useMemo, useState } from "react";
import { updateSettings } from "@/lib/db";
import { exerciseText } from "@/lib/exerciseText";
import { prescriptionText } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { EQUIPMENT, LEVELS, MUSCLES } from "@/lib/labels";
import { primaryAlternatives, rankAlternatives, type Candidate, type SubstitutionContext } from "@/lib/substitution";
import type { Exercise, PlannedExercise, Settings } from "@/lib/types";
import { ExerciseThumb } from "./ExerciseMedia";
import { IconAlert, IconCheck } from "./icons";
import { Alert, Badge } from "./ui";

function CandidateCard({ title, c, onChoose, current, prescription }: { title?: string; c: Candidate; onChoose?: (c: Candidate) => void; current: boolean; prescription?: PlannedExercise }) {
  const { lang, pick, L } = useI18n();
  const e = c.exercise;
  const t = exerciseText(e, lang);
  const avail = {
    available: { label: L("متاح", "Available"), tone: "green" as const },
    unknown: { label: L("مش عارف", "Not sure"), tone: "amber" as const },
    unavailable: { label: L("غير متاح", "Not available"), tone: "red" as const },
  }[c.availability];
  const suit = c.healthScore >= 2 ? { label: L("مناسب لحالتك", "Suits your condition"), tone: "green" as const } : c.healthScore === 1 ? { label: L("بحذر", "Use caution"), tone: "amber" as const } : { label: L("غير مقترح", "Not suggested"), tone: "red" as const };
  const levelCls = e.level === "beginner" ? "level-easy" : e.level === "intermediate" ? "level-med" : "level-hard";
  const topMistake = t.mistakes[0];
  return (
    <div className={`card mb-3 p-3 ${current ? "border-[rgb(var(--accent))]" : ""}`} data-testid="alt-card" data-exercise-id={e.id}>
      {title && <div className="mb-2 text-xs font-bold text-accent">{title}</div>}
      <div className="flex gap-3">
        <div className="relative h-28 w-28 shrink-0">
          <ExerciseThumb exercise={e} className="h-full w-full" />
          <span className={`absolute start-1.5 top-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${levelCls}`}>{pick(LEVELS[e.level])}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="font-bold leading-tight" data-testid="alt-name">
                {t.name}
              </div>
              <div className={`text-xs text-muted ${lang === "ar" ? "ltr text-start" : ""}`}>{t.otherName}</div>
            </div>
            <div className="shrink-0 text-center">
              <div className="ltr text-lg font-bold text-accent">{c.similarity}%</div>
              <div className="text-[10px] text-muted">{pick(c.similarityLabel)}</div>
            </div>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {e.primaryMuscles.map((m) => (
              <Badge key={m} tone="accent">
                {pick(MUSCLES[m])}
              </Badge>
            ))}
            <Badge tone={avail.tone}>{avail.label}</Badge>
            <Badge tone={suit.tone}>{suit.label}</Badge>
          </div>
          <div className="mt-1.5 text-xs text-muted">
            {e.equipment.map((x) => pick(EQUIPMENT[x])).join(" · ")}
            {prescription && <> · {prescriptionText(prescription, lang)}</>}
          </div>
        </div>
      </div>
      {topMistake && (
        <div className="mt-2 rounded-xl bg-red-500/10 px-3 py-1.5 text-xs">
          <b className="text-red-700 dark:text-red-300">✕ {L("خطأ شائع:", "Common mistake:")}</b> {pick(topMistake.title)}
          {pick(topMistake.fix) && <span className="text-muted"> — {pick(topMistake.fix)}</span>}
        </div>
      )}
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer font-medium">{L("الاختلافات الفنية والاحتياطات", "Technical differences & precautions")}</summary>
        <ul className="mt-1 list-disc space-y-1 ps-5">
          {c.differences.map((d, i) => (
            <li key={i}>{pick(d)}</li>
          ))}
          {c.healthWarnings.map((d, i) => (
            <li key={`h${i}`} className="text-amber-700 dark:text-amber-300">
              {pick(d)}
            </li>
          ))}
        </ul>
      </details>
      {!c.clearFit && <div className="mt-2 text-xs text-amber-700 dark:text-amber-300">{L("الملاءمة غير واضحة:", "Fit is unclear:")} {c.unclearReasons.map((r) => pick(r)).join(" ")}</div>}
      {onChoose && (
        <button className={`${current ? "btn-secondary" : "btn-go"} mt-3 w-full`} disabled={current} onClick={() => onChoose(c)} data-testid="choose-alt">
          {current ? (
            <>
              <IconCheck size={18} /> {L("التمرين الحالي", "Current exercise")}
            </>
          ) : (
            L("اختار ده للحصة دي بس", "Use this for this session only")
          )}
        </button>
      )}
    </div>
  );
}

export default function AlternativesPanel({
  base,
  currentId,
  settings,
  all,
  onSelect,
  prescription,
  severePain,
}: {
  base: Exercise;
  currentId?: string;
  settings: Settings;
  all: Record<string, Exercise>;
  onSelect?: (exerciseId: string, reason: string) => void;
  prescription?: PlannedExercise;
  severePain?: SubstitutionContext["severePain"];
}) {
  const { lang, pick, L } = useI18n();
  const [missingMode, setMissingMode] = useState(false);
  const [pending, setPending] = useState<Candidate | null>(null);
  const [markUnavailable, setMarkUnavailable] = useState(false);
  const ctx: SubstitutionContext = useMemo(
    () => ({ equipment: settings.equipment, level: settings.profile.level, conditions: settings.profile.conditions, severePain }),
    [settings, severePain],
  );
  const firstTwo = useMemo(() => primaryAlternatives(base, all, ctx), [base, all, ctx]);
  const ranked = useMemo(() => rankAlternatives(base, Object.values(all), ctx), [base, all, ctx]);
  const reason = missingMode ? "الجهاز غير موجود / Machine not available" : "اختيار بديل / Alternative chosen";
  const baseEquipment = base.equipment.filter((e) => e !== "none" && !["adjustable_bench", "mat"].includes(e));
  const bt = exerciseText(base, lang);

  const choose = (c: Candidate) => {
    if (!onSelect) return;
    if (!c.clearFit) setPending(c);
    else onSelect(c.exercise.id, reason);
  };

  const showMissing = async () => {
    setMissingMode(true);
    if (markUnavailable && baseEquipment.length) {
      await updateSettings((s) => ({ ...s, equipment: { ...s.equipment, ...Object.fromEntries(baseEquipment.map((e) => [e, "unavailable" as const])) } }));
    }
  };

  if (pending) {
    const pt = exerciseText(pending.exercise, lang);
    return (
      <div>
        <Alert tone="amber" title={L("الملاءمة غير واضحة", "The fit is unclear")} icon={<IconAlert size={18} />}>
          <p className="mb-2">
            <b>{pt.name}</b> {L("مش مطابق بوضوح للتمرين الأصلي:", "isn't a clear match for the original:")}
          </p>
          <ul className="list-disc space-y-1 ps-4">
            {pending.unclearReasons.map((r, i) => (
              <li key={i}>{pick(r)}</li>
            ))}
            {pending.healthWarnings.map((r, i) => (
              <li key={`h${i}`}>{pick(r)}</li>
            ))}
          </ul>
          <p className="mt-2">{L("مش هنستبدل تلقائيًا. اختار بس لو اتأكدت إنه مناسب ليك (مثلًا مع مدرب الجيم).", "We won't swap automatically. Only choose it if you've confirmed it suits you (e.g. with a gym coach).")}</p>
        </Alert>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button className="btn-secondary" onClick={() => setPending(null)}>
            {L("رجوع", "Back")}
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              onSelect?.(pending.exercise.id, `${reason} (confirmed)`);
              setPending(null);
            }}
          >
            {L("أؤكد الاختيار", "Confirm choice")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="card mb-3 border-[rgb(var(--accent))] p-3">
        <div className="mb-2 text-xs font-bold text-muted">{L("الجهاز الأساسي في البرنامج", "Original exercise in your program")}</div>
        <div className="flex gap-3">
          <ExerciseThumb exercise={base} className="h-20 w-20 shrink-0" />
          <div className="min-w-0">
            <div className="font-bold">{bt.name}</div>
            <div className={`text-xs text-muted ${lang === "ar" ? "ltr text-start" : ""}`}>{bt.otherName}</div>
            <div className="mt-1 flex flex-wrap gap-1">
              {base.primaryMuscles.map((m) => (
                <Badge key={m} tone="accent">
                  {pick(MUSCLES[m])}
                </Badge>
              ))}
            </div>
            <div className="mt-1 text-xs text-muted">{base.equipment.map((x) => pick(EQUIPMENT[x])).join(" · ")}</div>
          </div>
        </div>
        {onSelect && currentId && currentId !== base.id && (
          <button className="btn-secondary mt-3 w-full" onClick={() => onSelect(base.id, "رجوع للتمرين الأصلي / Back to original")}>
            {L("الرجوع للتمرين الأصلي", "Back to the original exercise")}
          </button>
        )}
      </div>

      {severePain && severePain.length > 0 && (
        <div className="mb-3">
          <Alert tone="red" title={L("سجّلت ألم شديد في الحصة دي", "You reported severe pain this session")} icon={<IconAlert size={18} />}>
            {L("مخفي من البدائل أي تمرين بيحمّل نفس المنطقة. لو الألم مستمر، اطلب تقييم متخصص.", "Alternatives that load the same area are hidden. If the pain persists, get a specialist assessment.")}
          </Alert>
        </div>
      )}

      {!missingMode && (
        <>
          {firstTwo.map((c, i) => (
            <CandidateCard key={c.exercise.id} title={i === 0 ? L("البديل الأول", "Alternative 1") : L("البديل الثاني", "Alternative 2")} c={c} current={c.exercise.id === currentId} onChoose={onSelect ? choose : undefined} prescription={prescription} />
          ))}
          {firstTwo.length === 0 && <Alert tone="blue">{L("مفيش بديل آمن واضح دلوقتي. تخطّى التمرين النهارده.", "No clearly safe alternative right now. Skip this exercise today.")}</Alert>}
          <div className="card mt-4 p-3">
            {baseEquipment.length > 0 && (
              <label className="mb-3 flex items-start gap-2 text-sm">
                <input type="checkbox" className="mt-1 h-5 w-5" checked={markUnavailable} onChange={(e) => setMarkUnavailable(e.target.checked)} />
                <span>
                  {L("سجّل", "Mark")} ({baseEquipment.map((x) => pick(EQUIPMENT[x])).join(" · ")}) {L("كغير متاح في جيمي", "as not available in my gym")}
                </span>
              </label>
            )}
            <button className="btn-danger w-full" onClick={showMissing} data-testid="missing-device">
              {L("الجهاز غير موجود – شوف كل البدائل", "Machine not available – show all options")}
            </button>
          </div>
        </>
      )}

      {missingMode && (
        <div>
          <Alert tone="blue" title={L("مرتبة حسب", "Ranked by")}>
            <ol className="list-decimal ps-4">
              <li>{L("تشابه العضلات والحركة المستهدفة", "Similarity of target muscles and movement")}</li>
              <li>{L("توفر المعدات", "Equipment availability")}</li>
              <li>{L("ملاءمة التمرين لمستواك", "Fit for your level")}</li>
              <li>{L("التوافق مع القيود الصحية المسجلة", "Compatibility with your recorded health limits")}</li>
            </ol>
          </Alert>
          <div className="mt-3" data-testid="ranked-list">
            {ranked.suggested.length === 0 && <p className="text-muted">{L("لا توجد بدائل مناسبة في المكتبة.", "No suitable alternatives in the library.")}</p>}
            {ranked.suggested.map((c, i) => (
              <CandidateCard key={c.exercise.id} title={`#${i + 1}`} c={c} current={c.exercise.id === currentId} onChoose={onSelect ? choose : undefined} prescription={prescription} />
            ))}
          </div>
          {ranked.blockedByPain.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-sm font-medium">{L("مخفية بسبب الألم الشديد", "Hidden because of severe pain")} ({ranked.blockedByPain.length})</summary>
              <ul className="mt-2 list-disc ps-5 text-sm">
                {ranked.blockedByPain.map((c) => (
                  <li key={c.exercise.id}>{exerciseText(c.exercise, lang).name}</li>
                ))}
              </ul>
            </details>
          )}
          {ranked.needsReview.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-sm font-medium">{L("تمارين مشابهة تحتاج مراجعة متخصص (غير مقترحة)", "Similar exercises that need a specialist's review (not suggested)")}</summary>
              <ul className="mt-2 list-disc ps-5 text-sm">
                {ranked.needsReview.map((c) => (
                  <li key={c.exercise.id}>
                    {exerciseText(c.exercise, lang).name} — {exerciseText(c.exercise, lang).reviewRequired}
                  </li>
                ))}
              </ul>
            </details>
          )}
          <button className="btn-secondary mt-3 w-full" onClick={() => setMissingMode(false)}>
            {L("رجوع للبدائل الأساسية", "Back to the main alternatives")}
          </button>
        </div>
      )}
    </div>
  );
}
