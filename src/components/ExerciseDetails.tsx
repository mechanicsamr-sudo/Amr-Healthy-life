"use client";

import { useState } from "react";
import { exerciseText } from "@/lib/exerciseText";
import { useI18n } from "@/lib/i18n";
import { EQUIPMENT, LEVELS, LOADS, MUSCLES, PATTERNS } from "@/lib/labels";
import { mediaFor } from "@/lib/media";
import { searchLinks } from "@/lib/search";
import { healthAssessment } from "@/lib/substitution";
import type { Exercise, MistakeCategory, Settings } from "@/lib/types";
import ExerciseMedia from "./ExerciseMedia";
import { RigSvg } from "./rig/Rig";
import { comparisonsFor } from "@/lib/rigMap";
import { IconAlert, IconCheck, IconExternal, IconSwap } from "./icons";
import { Alert, Badge } from "./ui";

const CAT_LABEL: Record<MistakeCategory, { ar: string; en: string }> = {
  posture: { ar: "وضع الجسم", en: "Posture" },
  range: { ar: "المدى الحركي", en: "Range of motion" },
  breathing: { ar: "التنفس", en: "Breathing" },
  setup: { ar: "ضبط الجهاز", en: "Equipment setup" },
  tempo: { ar: "السرعة والتحكم", en: "Tempo & control" },
  safety: { ar: "السلامة", en: "Safety" },
};

export function MuscleChips({ e }: { e: Exercise }) {
  const { pick, L } = useI18n();
  return (
    <div className="flex flex-wrap gap-1.5">
      {e.primaryMuscles.map((m) => (
        <Badge key={m} tone="accent">
          {pick(MUSCLES[m])}
        </Badge>
      ))}
      {e.secondaryMuscles.map((m) => (
        <Badge key={m}>
          {pick(MUSCLES[m])} {L("(ثانوية)", "(secondary)")}
        </Badge>
      ))}
    </div>
  );
}

export function SearchLinks({ e }: { e: Exercise }) {
  const { L } = useI18n();
  const l = searchLinks(e);
  return (
    <div className="flex flex-wrap gap-2">
      <a className="btn-secondary text-sm" href={l.images} target="_blank" rel="noopener noreferrer">
        {L("صور الجهاز", "Equipment images")} <IconExternal size={16} />
      </a>
      <a className="btn-secondary text-sm" href={l.web} target="_blank" rel="noopener noreferrer">
        Google <IconExternal size={16} />
      </a>
      <a className="btn-secondary text-sm" href={l.video} target="_blank" rel="noopener noreferrer">
        {L("فيديو الأداء", "Form video")} <IconExternal size={16} />
      </a>
    </div>
  );
}

/** قسم الأخطاء الشائعة: ✕ الخطأ ولماذا هو خطأ ← ✓ التصحيح */
export function MistakesList({ e }: { e: Exercise }) {
  const { lang, pick, L } = useI18n();
  const t = exerciseText(e, lang);
  const drawings = mediaFor(e.id).drawings;
  const comps = comparisonsFor(e.id, e.pattern, t.mistakes);
  return (
    <div data-testid="mistakes-list">
      {comps.length > 0 && <p className="mb-2 text-sm text-muted">{L("الصور: ✕ الغلط مقابل ✓ الصح بنفس الزاوية، والدايرة على مكان المشكلة.", "Pictures: ✕ wrong vs ✓ correct from the same angle; the circle marks the problem area.")}</p>}
      {(t.posture || t.range) && (
        <div className="mb-3 grid gap-2 sm:grid-cols-2">
          {drawings && (
            <div className="relative col-span-full overflow-hidden rounded-2xl border-2 border-green-500 bg-gradient-to-br from-orange-100 to-violet-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={drawings[1].src} alt="" className="mx-auto h-44 object-contain mix-blend-multiply" />
              <span className="absolute start-2 top-2 rounded-full bg-green-600 px-2.5 py-0.5 text-xs font-bold text-white">✓ {L("الأداء الصحيح", "Correct form")}</span>
            </div>
          )}
          {t.posture && (
            <div className="card border-green-500/50 p-3 text-sm">
              <div className="mb-1 font-bold text-green-600 dark:text-green-400">✓ {L("وضع الجسم الصحيح", "Correct posture")}</div>
              {t.posture}
            </div>
          )}
          {t.range && (
            <div className="card border-green-500/50 p-3 text-sm">
              <div className="mb-1 font-bold text-green-600 dark:text-green-400">✓ {L("المدى الحركي الصحيح", "Correct range")}</div>
              {t.range}
            </div>
          )}
        </div>
      )}
      <ol className="space-y-2">
        {t.mistakes.map((m, i) => (
          <li key={i} className="card p-3" data-testid="mistake">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <b>{pick(m.title)}</b>
                  <Badge tone={m.cat === "safety" ? "red" : m.cat === "breathing" ? "blue" : "neutral"}>{pick(CAT_LABEL[m.cat])}</Badge>
                </div>
                {(() => {
                  const c = comps.find((x) => x.mistakeIndex === i);
                  if (!c) return null;
                  return (
                    <div className="mt-2 grid grid-cols-2 gap-2" data-testid="mistake-compare">
                      <div className="relative overflow-hidden rounded-2xl border-2 border-red-500">
                        <RigSvg tpl={c.wrong} k={c.wrongK} tint="wrong" mark={c.mark} label={`${L("غلط", "Wrong")}: ${pick(m.title)}`} />
                        <span className="absolute start-2 top-2 rounded-full bg-red-600 px-2 py-0.5 text-xs font-black text-white">✕ {L("غلط", "Wrong")}</span>
                      </div>
                      <div className="relative overflow-hidden rounded-2xl border-2 border-green-500">
                        <RigSvg tpl={c.right} k={c.rightK} tint="right" mark={c.mark} label={`${L("صح", "Correct")}: ${pick(m.fix)}`} />
                        <span className="absolute start-2 top-2 rounded-full bg-green-600 px-2 py-0.5 text-xs font-black text-white">✓ {L("صح", "Correct")}</span>
                      </div>
                    </div>
                  );
                })()}
                {m.cat === "breathing" && (
                  <div className="mt-2 grid grid-cols-2 gap-2 text-center text-sm font-bold">
                    <div className="rounded-2xl border-2 border-red-500 bg-red-500/10 p-2.5"><span className="text-2xl">😤</span><br />{L("كاتم نفسك", "Holding breath")}</div>
                    <div className="rounded-2xl border-2 border-green-500 bg-green-500/10 p-2.5"><span className="text-2xl">💨</span><br />{L("طلّع النفس مع المجهود", "Exhale on the effort")}</div>
                  </div>
                )}
                {pick(m.why) && (
                  <div className="mt-2 grid gap-1.5 text-sm">
                    <div className="rounded-xl bg-red-500/10 px-3 py-2">
                      <span className="font-bold text-red-700 dark:text-red-300">✕ {L("ليه غلط؟", "Why it's wrong")} </span>
                      {pick(m.why)}
                    </div>
                    <div className="rounded-xl bg-green-500/10 px-3 py-2">
                      <span className="font-bold text-green-700 dark:text-green-300">✓ {L("التصحيح", "How to fix it")} </span>
                      {pick(m.fix)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

type Tab = "how" | "mistakes" | "breathing" | "safety";

export default function ExerciseDetails({ e, settings, showMedia = true, onAlternatives, initialTab = "how" }: { e: Exercise; settings: Settings; showMedia?: boolean; onAlternatives?: () => void; initialTab?: Tab }) {
  const { lang, pick, L } = useI18n();
  const [tab, setTab] = useState<Tab>(initialTab);
  const t = exerciseText(e, lang);
  const health = healthAssessment(e, settings.profile.conditions);
  const drawings = mediaFor(e.id).drawings;
  const breathMistakes = t.mistakes.filter((m) => m.cat === "breathing");

  const tabs: { id: Tab; label: string }[] = [
    { id: "how", label: L("الأداء", "How to") },
    { id: "mistakes", label: L("الأخطاء الشائعة", "Common mistakes") },
    { id: "breathing", label: L("التنفس", "Breathing") },
    { id: "safety", label: L("السلامة", "Safety") },
  ];

  return (
    <div>
      {showMedia && (
        <div className="mb-4">
          <ExerciseMedia exercise={e} />
        </div>
      )}
      <div className="mb-3">
        {showMedia ? <h1 className="display text-3xl">{t.name}</h1> : <div className="display text-3xl">{t.name}</div>}
        <div className={`mt-1 font-bold text-muted ${lang === "ar" ? "ltr text-start" : ""}`}>{t.otherName}</div>
        {e.aliases.length > 0 && <div className="mt-1 text-xs text-muted">{L("أسماء أخرى للبحث:", "Also known as:")} {e.aliases.join(" · ")}</div>}
      </div>

      {t.reviewRequired && (
        <div className="mb-3">
          <Alert tone="red" title={L("يحتاج مراجعة متخصص", "Needs a specialist's review")} icon={<IconAlert size={18} />}>
            {t.reviewRequired}
          </Alert>
        </div>
      )}
      {e.custom && (
        <div className="mb-3">
          <Alert tone="blue" title={L("تمرين مخصص", "Custom exercise")}>
            {L("أضفت هذا التمرين بنفسك. المعلومات من إدخالك ولم يتحقق منها التطبيق.", "You added this exercise. Its content is your own and hasn't been verified by the app.")}
          </Alert>
        </div>
      )}

      <div className="mb-3">
        <MuscleChips e={e} />
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2 text-center">
        <div className="card p-2">
          <div className="text-[11px] text-muted">{L("المستوى", "Level")}</div>
          <b className="text-sm">{pick(LEVELS[e.level])}</b>
        </div>
        <div className="card p-2">
          <div className="text-[11px] text-muted">{L("حمل الركبة", "Knee load")}</div>
          <b className="text-sm">{pick(LOADS[e.kneeLoad])}</b>
        </div>
        <div className="card p-2">
          <div className="text-[11px] text-muted">{L("حمل الظهر", "Back load")}</div>
          <b className="text-sm">{pick(LOADS[e.backLoad])}</b>
        </div>
      </div>
      <div className="card mb-3 p-3 text-sm">
        <div>
          <span className="text-muted">{L("المعدات:", "Equipment:")} </span>
          {e.equipment.map((x) => pick(EQUIPMENT[x])).join(" · ")}
        </div>
        <div className="mt-1">
          <span className="text-muted">{L("المجموعات والتكرارات:", "Sets & reps:")} </span>
          {t.guideline}
        </div>
        <div className="mt-1">
          <span className="text-muted">{L("نمط الحركة:", "Pattern:")} </span>
          {pick(PATTERNS[e.pattern])}
        </div>
      </div>

      {onAlternatives && (
        <button className="btn-go mb-4 w-full text-base" onClick={onAlternatives} data-testid="open-alternatives">
          <IconSwap size={18} /> {L("مش لاقي الجهاز؟ شوف البدائل", "Machine not available? See alternatives")}
        </button>
      )}

      <div className="-mx-4 mb-3 flex gap-1.5 overflow-x-auto px-4 pb-1" role="tablist">
        {tabs.map((x) => (
          <button key={x.id} role="tab" aria-selected={tab === x.id} className={`chip shrink-0 py-2 ${tab === x.id ? "chip-active" : ""}`} onClick={() => setTab(x.id)} data-testid={`tab-${x.id}`}>
            {x.label}
          </button>
        ))}
      </div>

      {tab === "how" && (
        <div className="space-y-3">
          {drawings && (
            <div className="grid grid-cols-2 gap-2">
              {drawings.map((d, i) => (
                <figure key={i} className="overflow-hidden rounded-2xl border border-base">
                  <div className="bg-gradient-to-br from-orange-100 to-violet-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={d.src} alt="" className="mx-auto h-32 object-contain mix-blend-multiply" />
                  </div>
                  <figcaption className="px-2 py-1 text-xs font-bold">
                    {i + 1} · {i === 0 ? L("وضع البداية", "Start") : L("نهاية الحركة", "End")}
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
          {t.start && (
            <div className="card p-3">
              <div className="mb-1 font-bold">{L("وضع البداية الصحيح", "Correct starting position")}</div>
              <p className="text-[15px] leading-relaxed">{t.start}</p>
            </div>
          )}
          <Steps title={L("ضبط الجهاز", "Equipment setup")} items={t.setup} />
          <Steps title={L("خطوات الأداء الصحيح", "Correct execution")} items={t.steps} />
        </div>
      )}
      {tab === "mistakes" && <MistakesList e={e} />}
      {tab === "breathing" && (
        <div className="space-y-3">
          <div className="card p-3">
            <div className="mb-1 font-bold">{L("طريقة التنفس", "How to breathe")}</div>
            <p className="text-[15px] leading-relaxed">{t.breathing}</p>
          </div>
          {breathMistakes.map((m, i) => (
            <Alert key={i} tone="blue" title={`✕ ${pick(m.title)}`}>
              {pick(m.why)} <b>{pick(m.fix)}</b>
            </Alert>
          ))}
        </div>
      )}
      {tab === "safety" && (
        <div className="space-y-3">
          {health.warnings.length > 0 && (
            <Alert tone="amber" title={L("حسب القيود الصحية المسجلة", "Based on your recorded health limits")} icon={<IconAlert size={18} />}>
              <ul className="list-disc space-y-1 ps-4">
                {health.warnings.map((w, i) => (
                  <li key={i}>{pick(w)}</li>
                ))}
              </ul>
            </Alert>
          )}
          {t.precautions.length > 0 && <Steps title={L("الاحتياطات", "Precautions")} items={t.precautions} bullet />}
          {health.warnings.length === 0 && t.precautions.length === 0 && (
            <Alert tone="green" icon={<IconCheck size={18} />}>
              {L("لا توجد تنبيهات خاصة لهذا التمرين حسب بياناتك. أوقف أي حركة تزيد الألم.", "No specific warnings for this exercise based on your data. Stop any movement that increases pain.")}
            </Alert>
          )}
          <div>
            <h3 className="mb-2 font-bold">{L("بحث مباشر باسم الجهاز بالإنجليزية", "Direct search by English name")}</h3>
            <SearchLinks e={e} />
          </div>
        </div>
      )}
    </div>
  );
}

function Steps({ title, items, bullet = false }: { title: string; items: string[]; bullet?: boolean }) {
  if (!items.length) return null;
  return (
    <div className="card p-3">
      <div className="mb-2 font-bold">{title}</div>
      <ol className="space-y-2">
        {items.map((s, i) => (
          <li key={i} className="flex gap-2 text-[15px] leading-relaxed">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ background: "rgb(var(--accent))", color: "rgb(var(--on-accent))" }}>
              {bullet ? "•" : i + 1}
            </span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
