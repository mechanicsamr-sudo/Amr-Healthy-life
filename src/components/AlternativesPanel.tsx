"use client";

import { useMemo, useState } from "react";
import { updateSettings } from "@/lib/db";
import { EQUIPMENT, MUSCLES } from "@/lib/labels";
import { primaryAlternatives, rankAlternatives, type Candidate, type SubstitutionContext } from "@/lib/substitution";
import type { Exercise, Settings } from "@/lib/types";
import { IconAlert, IconCheck } from "./icons";
import { Alert, Badge } from "./ui";

const AVAIL: Record<string, { label: string; tone: "green" | "amber" | "red" }> = {
  available: { label: "متوفر", tone: "green" },
  unknown: { label: "التوفر غير محدد", tone: "amber" },
  unavailable: { label: "غير متوفر", tone: "red" },
};

function CandidateCard({
  title,
  c,
  onChoose,
  current,
}: {
  title?: string;
  c: Candidate;
  onChoose?: (c: Candidate) => void;
  current: boolean;
}) {
  const e = c.exercise;
  return (
    <div className="card mb-3" data-testid="alt-card" data-exercise-id={e.id}>
      {title && <div className="mb-1 text-xs font-bold text-brand-700 dark:text-brand-400">{title}</div>}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-bold">{e.nameAr}</div>
          <div className="ltr text-start text-sm text-muted">{e.nameEn}</div>
        </div>
        <div className="shrink-0 text-center">
          <div className="ltr text-lg font-bold">{c.similarity}%</div>
          <div className="text-[11px] text-muted">{c.similarityLabel}</div>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {e.primaryMuscles.map((m) => (
          <Badge key={m} tone="green">
            {MUSCLES[m].ar}
          </Badge>
        ))}
        {e.secondaryMuscles.map((m) => (
          <Badge key={m}>{MUSCLES[m].ar}</Badge>
        ))}
        <Badge tone={AVAIL[c.availability].tone}>{AVAIL[c.availability].label}</Badge>
      </div>
      <div className="mt-2 text-xs text-muted">
        تشابه العضلات {c.muscleSimilarity}% · تشابه الحركة {c.patternSimilarity}%
      </div>
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer font-medium">الاختلافات الفنية والاحتياطات</summary>
        <ul className="mt-1 list-disc space-y-1 ps-5">
          {c.differences.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
          {c.healthWarnings.map((d, i) => (
            <li key={`h${i}`} className="text-amber-700 dark:text-amber-300">
              {d}
            </li>
          ))}
        </ul>
      </details>
      {!c.clearFit && (
        <div className="mt-2 text-xs text-amber-700 dark:text-amber-300">الملاءمة غير واضحة: {c.unclearReasons.join(" ")}</div>
      )}
      {onChoose && (
        <button className={`${current ? "btn-secondary" : "btn-primary"} mt-3 w-full`} disabled={current} onClick={() => onChoose(c)}>
          {current ? (
            <>
              <IconCheck size={18} /> التمرين الحالي
            </>
          ) : (
            "اختر هذا البديل لهذه الحصة"
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
}: {
  base: Exercise;
  currentId?: string;
  settings: Settings;
  all: Record<string, Exercise>;
  onSelect?: (exerciseId: string, reason: string) => void;
}) {
  const [missingMode, setMissingMode] = useState(false);
  const [pending, setPending] = useState<Candidate | null>(null);
  const [markUnavailable, setMarkUnavailable] = useState(false);
  const ctx: SubstitutionContext = useMemo(
    () => ({ equipment: settings.equipment, level: settings.profile.level, conditions: settings.profile.conditions }),
    [settings],
  );
  const firstTwo = useMemo(() => primaryAlternatives(base, all, ctx), [base, all, ctx]);
  const ranked = useMemo(() => rankAlternatives(base, Object.values(all), ctx), [base, all, ctx]);
  const reason = missingMode ? "الجهاز غير موجود" : "اختيار بديل";
  const baseEquipment = base.equipment.filter((e) => e !== "none" && !["adjustable_bench", "mat"].includes(e));

  const choose = (c: Candidate) => {
    if (!onSelect) return;
    if (!c.clearFit) setPending(c);
    else onSelect(c.exercise.id, reason);
  };

  const showMissing = async () => {
    setMissingMode(true);
    if (markUnavailable && baseEquipment.length) {
      await updateSettings((s) => ({
        ...s,
        equipment: { ...s.equipment, ...Object.fromEntries(baseEquipment.map((e) => [e, "unavailable" as const])) },
      }));
    }
  };

  if (pending) {
    return (
      <div>
        <Alert tone="amber" title="الملاءمة غير واضحة" icon={<IconAlert size={18} />}>
          <p className="mb-2">
            البديل <b>{pending.exercise.nameAr}</b> ليس مطابقًا بوضوح للتمرين الأصلي:
          </p>
          <ul className="list-disc space-y-1 ps-4">
            {pending.unclearReasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
            {pending.healthWarnings.map((r, i) => (
              <li key={`h${i}`}>{r}</li>
            ))}
          </ul>
          <p className="mt-2">لن يتم الاستبدال تلقائيًا. اختر فقط إذا تحققت من مناسبته لك (مثلًا مع مدرب الصالة).</p>
        </Alert>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button className="btn-secondary" onClick={() => setPending(null)}>
            رجوع
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              onSelect?.(pending.exercise.id, `${reason} (تم التأكيد رغم عدم وضوح الملاءمة)`);
              setPending(null);
            }}
          >
            أؤكد الاختيار
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="card mb-3 border-brand-500">
        <div className="mb-1 text-xs font-bold text-muted">الجهاز الأساسي في البرنامج</div>
        <div className="font-bold">{base.nameAr}</div>
        <div className="ltr text-start text-sm text-muted">{base.nameEn}</div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {base.primaryMuscles.map((m) => (
            <Badge key={m} tone="green">
              {MUSCLES[m].ar}
            </Badge>
          ))}
          {base.secondaryMuscles.map((m) => (
            <Badge key={m}>{MUSCLES[m].ar}</Badge>
          ))}
        </div>
        <div className="mt-1 text-xs text-muted">المعدات: {base.equipment.map((x) => EQUIPMENT[x].ar).join("، ")}</div>
        {onSelect && currentId && currentId !== base.id && (
          <button className="btn-secondary mt-3 w-full" onClick={() => onSelect(base.id, "رجوع للتمرين الأصلي")}>
            الرجوع للتمرين الأصلي
          </button>
        )}
      </div>

      {!missingMode && (
        <>
          {firstTwo.map((c, i) => (
            <CandidateCard key={c.exercise.id} title={i === 0 ? "البديل الأول" : "البديل الثاني"} c={c} current={c.exercise.id === currentId} onChoose={onSelect ? choose : undefined} />
          ))}
          <div className="card mt-4">
            {baseEquipment.length > 0 && (
              <label className="mb-3 flex items-start gap-2 text-sm">
                <input type="checkbox" className="mt-1 h-5 w-5" checked={markUnavailable} onChange={(e) => setMarkUnavailable(e.target.checked)} />
                <span>سجّل ({baseEquipment.map((x) => EQUIPMENT[x].ar).join("، ")}) كغير متوفر في صالتي (يمكن تغييره من الإعدادات)</span>
              </label>
            )}
            <button className="btn-danger w-full" onClick={showMissing} data-testid="missing-device">
              الجهاز غير موجود
            </button>
          </div>
        </>
      )}

      {missingMode && (
        <div>
          <Alert tone="blue" title="البدائل مرتبة حسب">
            <ol className="list-decimal ps-4">
              <li>تشابه العضلات والحركة المستهدفة</li>
              <li>توفر المعدات</li>
              <li>ملاءمة التمرين لمستواك</li>
              <li>التوافق مع القيود الصحية المسجلة</li>
            </ol>
          </Alert>
          <div className="mt-3" data-testid="ranked-list">
            {ranked.suggested.length === 0 && <p className="text-muted">لا توجد بدائل مناسبة في المكتبة.</p>}
            {ranked.suggested.map((c, i) => (
              <CandidateCard key={c.exercise.id} title={`#${i + 1}`} c={c} current={c.exercise.id === currentId} onChoose={onSelect ? choose : undefined} />
            ))}
          </div>
          {ranked.needsReview.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-sm font-medium">تمارين مشابهة تحتاج مراجعة متخصص (غير مقترحة)</summary>
              <ul className="mt-2 list-disc ps-5 text-sm">
                {ranked.needsReview.map((c) => (
                  <li key={c.exercise.id}>
                    {c.exercise.nameAr} — {c.exercise.reviewRequired}
                  </li>
                ))}
              </ul>
            </details>
          )}
          <button className="btn-secondary mt-3 w-full" onClick={() => setMissingMode(false)}>
            رجوع للبدائل الأساسية
          </button>
        </div>
      )}
    </div>
  );
}
