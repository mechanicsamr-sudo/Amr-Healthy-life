"use client";

import Link from "next/link";
import { ExerciseThumb } from "@/components/ExerciseMedia";
import { IconAlert } from "@/components/icons";
import { Alert, Badge, Choice, Loading, PageHeader, Section } from "@/components/ui";
import { CATEGORIES, EQUIPMENT_INFO_MAP, relatedExercises } from "@/data/equipment";
import { updateSettings } from "@/lib/db";
import { exerciseText } from "@/lib/exerciseText";
import { useExercises, useSearchParam, useSettings } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { EQUIPMENT, MUSCLES } from "@/lib/labels";
import type { Availability, EquipmentId } from "@/lib/types";

export default function EquipmentPage() {
  const id = useSearchParam("id");
  const { map, loaded } = useExercises();
  const { settings } = useSettings();
  const { L, lang, pick } = useI18n();
  if (!loaded || id === null) return <Loading />;
  const info = EQUIPMENT_INFO_MAP[id];
  if (!info) return <PageHeader title={L("غير موجود", "Not found")} back="/library/" />;
  const rel = relatedExercises(info.id).map((x) => map[x]).filter(Boolean);
  const pic = rel[0];
  const name = EQUIPMENT[info.id];

  return (
    <div>
      <div className="relative -mx-4 -mt-4 mb-4 h-56 overflow-hidden hero">
        {pic && <ExerciseThumb exercise={pic} className="absolute inset-0 h-full w-full" rounded="rounded-none" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
        <Link href="/library/" className="absolute start-3 top-3 rounded-full bg-black/45 px-3 py-1.5 text-sm font-bold text-white" aria-label={L("رجوع", "Back")}>
          {lang === "ar" ? "→" : "←"} {L("المكتبة", "Library")}
        </Link>
        <div className="absolute inset-x-4 bottom-3 text-white">
          <Badge tone="accent">{pick(CATEGORIES[info.category])}</Badge>
          <h1 className="display mt-1 text-3xl" data-testid="equipment-name">
            {pick(name)}
          </h1>
          <div className="text-sm font-bold opacity-85">{lang === "ar" ? name.en : name.ar}</div>
        </div>
      </div>

      <div className="card mb-4 p-3">
        <Choice
          label={L("الجهاز ده موجود في جيمك؟", "Is this in your gym?")}
          options={[
            { id: "available" as Availability, label: L("متاح", "Available"), sub: L("Available", "متاح") },
            { id: "unavailable" as Availability, label: L("غير متاح", "Not available"), sub: L("Not Available", "غير متاح") },
            { id: "unknown" as Availability, label: L("مش عارف", "Not sure"), sub: L("Not Sure", "مش عارف") },
          ]}
          value={settings.equipment[info.id as EquipmentId] ?? "unknown"}
          onChange={(v) => updateSettings((s) => ({ ...s, equipment: { ...s.equipment, [info.id]: v ?? "unknown" } }))}
          allowClear={false}
          testId="equipment-availability"
        />
      </div>

      <Section title={L("العضلات المستهدفة", "Target muscles")}>
        <div className="flex flex-wrap gap-1.5">
          {info.muscles.map((m) => (
            <Badge key={m} tone="accent">
              {pick(MUSCLES[m])}
            </Badge>
          ))}
        </div>
      </Section>

      <Section title={L("طريقة الاستخدام", "How to use it")}>
        <ol className="card space-y-2 p-3">
          {(lang === "en" ? info.howTo.en : info.howTo.ar).map((s, i) => (
            <li key={i} className="flex gap-2 text-[15px]">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ background: "rgb(var(--accent))", color: "rgb(var(--on-accent))" }}>
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
      </Section>

      <Section title={L("تمارين على الجهاز ده", "Related exercises")}>
        <ul className="space-y-2">
          {rel.map((e) => {
            const t = exerciseText(e, lang);
            return (
              <li key={e.id}>
                <Link href={`/library/exercise/?id=${e.id}`} className="card flex items-center gap-3 p-2.5">
                  <ExerciseThumb exercise={e} className="h-14 w-14 shrink-0" />
                  <div className="min-w-0">
                    <div className="truncate font-bold">{t.name}</div>
                    <div className={`truncate text-xs text-muted ${lang === "ar" ? "ltr text-start" : ""}`}>{t.otherName}</div>
                    {e.reviewRequired && <Badge tone="red">{L("يحتاج مراجعة", "Needs review")}</Badge>}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section title={L("الأخطاء الشائعة", "Common mistakes")}>
        <ol className="space-y-2">
          {info.mistakes.map((m, i) => (
            <li key={i} className="card p-3">
              <b>
                {i + 1}. {pick(m.title)}
              </b>
              <div className="mt-1.5 rounded-xl bg-red-500/10 px-3 py-1.5 text-sm">
                <span className="font-bold text-red-700 dark:text-red-300">✕ {L("ليه غلط؟", "Why it's wrong")} </span>
                {pick(m.why)}
              </div>
              <div className="mt-1 rounded-xl bg-green-500/10 px-3 py-1.5 text-sm">
                <span className="font-bold text-green-700 dark:text-green-300">✓ {L("التصحيح", "Fix")} </span>
                {pick(m.fix)}
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section title={L("بدائل الجهاز", "Equipment alternatives")}>
        <div className="flex flex-wrap gap-2">
          {info.alternatives.map((a) => (
            <Link key={a} href={`/equipment/?id=${a}`} className="chip py-2">
              {pick(EQUIPMENT[a])}
            </Link>
          ))}
        </div>
      </Section>

      {info.safety.length > 0 && (
        <Section title={L("ملاحظات السلامة", "Safety notes")}>
          <Alert tone="amber" icon={<IconAlert size={18} />}>
            <ul className="list-disc space-y-1 ps-4">
              {info.safety.map((s, i) => (
                <li key={i}>{pick(s)}</li>
              ))}
            </ul>
          </Alert>
        </Section>
      )}
    </div>
  );
}
