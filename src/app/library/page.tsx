"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ExerciseThumb } from "@/components/ExerciseMedia";
import { IconPlus, IconSearch } from "@/components/icons";
import { Badge, Loading, PageHeader } from "@/components/ui";
import { mediaFor } from "@/lib/media";
import { CATEGORIES, EQUIPMENT_INFO, illustrationExercise, relatedExercises, type EquipmentCategory } from "@/data/equipment";
import { exerciseText } from "@/lib/exerciseText";
import { useExercises, useSettings } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { EQUIPMENT, LEVELS, MUSCLE_ORDER, MUSCLES } from "@/lib/labels";
import { matchesQuery, normalize } from "@/lib/search";
import { equipmentAvailability } from "@/lib/substitution";
import type { EquipmentId, MuscleGroup } from "@/lib/types";

const FILTER_KEY = "libraryFilters2";

export default function LibraryPage() {
  const { list, map, loaded } = useExercises();
  const { settings } = useSettings();
  const { L, lang, pick } = useI18n();
  const [tab, setTab] = useState<"exercises" | "equipment">("exercises");
  const [q, setQ] = useState("");
  const [muscle, setMuscle] = useState<MuscleGroup | "all">("all");
  const [cat, setCat] = useState<EquipmentCategory | "all">("all");
  const [availableOnly, setAvailableOnly] = useState(false);

  // تذكر الفلاتر لراحة المستخدم فقط
  useEffect(() => {
    try {
      const f = JSON.parse(localStorage.getItem(FILTER_KEY) || "{}");
      if (f.tab) setTab(f.tab);
      if (f.muscle) setMuscle(f.muscle);
      if (f.cat) setCat(f.cat);
      if (f.availableOnly) setAvailableOnly(true);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(FILTER_KEY, JSON.stringify({ tab, muscle, cat, availableOnly }));
    } catch {}
  }, [tab, muscle, cat, availableOnly]);

  const exercises = useMemo(
    () =>
      list.filter(
        (e) =>
          matchesQuery(e, q) &&
          (muscle === "all" || e.primaryMuscles.includes(muscle) || e.secondaryMuscles.includes(muscle)) &&
          (!availableOnly || equipmentAvailability(e, settings.equipment) === "available"),
      ),
    [list, q, muscle, availableOnly, settings.equipment],
  );
  const equipment = useMemo(() => {
    const nq = normalize(q);
    return EQUIPMENT_INFO.filter((e) => {
      const name = normalize(`${EQUIPMENT[e.id].ar} ${EQUIPMENT[e.id].en} ${e.id}`);
      return (
        (!nq || nq.split(/\s+/).every((t) => name.includes(t))) &&
        (cat === "all" || e.category === cat) &&
        (muscle === "all" || e.muscles.includes(muscle)) &&
        (!availableOnly || (settings.equipment[e.id as EquipmentId] ?? "unknown") === "available")
      );
    });
  }, [q, cat, muscle, availableOnly, settings.equipment]);

  if (!loaded) return <Loading />;
  const availBadge = (v: string) =>
    v === "available" ? <Badge tone="green">{L("متاح", "Available")}</Badge> : v === "unavailable" ? <Badge tone="red">{L("غير متاح", "Not available")}</Badge> : <Badge>{L("مش عارف", "Not sure")}</Badge>;

  return (
    <div>
      <PageHeader
        display
        title={L("مكتبة الأجهزة", "Equipment library")}
        subtitle={L(`${list.length} تمرين · ${EQUIPMENT_INFO.length} جهاز وأداة · عربي وإنجليزي`, `${list.length} exercises · ${EQUIPMENT_INFO.length} equipment items`)}
        actions={
          <Link href="/library/custom/" className="btn-secondary px-3" aria-label={L("إضافة تمرين مخصص", "Add custom exercise")}>
            <IconPlus size={20} />
          </Link>
        }
      />

      <div className="mb-3 grid grid-cols-2 gap-2" role="tablist">
        <button role="tab" aria-selected={tab === "exercises"} className={`choice ${tab === "exercises" ? "" : ""}`} aria-pressed={tab === "exercises"} onClick={() => setTab("exercises")} data-testid="tab-exercises">
          {L("التمارين", "Exercises")}
        </button>
        <button role="tab" aria-selected={tab === "equipment"} className="choice" aria-pressed={tab === "equipment"} onClick={() => setTab("equipment")} data-testid="tab-equipment">
          {L("الأجهزة والأدوات", "Equipment")}
        </button>
      </div>

      <div className="relative mb-3">
        <IconSearch className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={20} />
        <input
          type="search"
          className="input ps-10"
          placeholder={L("ابحث بالعربي أو الإنجليزي (leg press، سحب عالي، دمبل…)", "Search in English or Arabic (leg press, سحب…)")}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label={L("بحث", "Search")}
          data-testid="library-search"
        />
      </div>

      {tab === "equipment" && (
        <div className="-mx-4 mb-2 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label={L("التصنيف", "Category")}>
          <button className={`chip shrink-0 ${cat === "all" ? "chip-active" : ""}`} onClick={() => setCat("all")}>
            {L("الكل", "All")}
          </button>
          {(Object.keys(CATEGORIES) as EquipmentCategory[]).map((c) => (
            <button key={c} className={`chip shrink-0 ${cat === c ? "chip-active" : ""}`} onClick={() => setCat(c)} aria-pressed={cat === c}>
              {pick(CATEGORIES[c])}
            </button>
          ))}
        </div>
      )}

      <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label={L("العضلة", "Muscle")}>
        <button className={`chip shrink-0 ${muscle === "all" ? "chip-active" : ""}`} onClick={() => setMuscle("all")}>
          {L("كل العضلات", "All muscles")}
        </button>
        {MUSCLE_ORDER.map((m) => (
          <button key={m} className={`chip shrink-0 ${muscle === m ? "chip-active" : ""}`} onClick={() => setMuscle(m)} aria-pressed={muscle === m}>
            {pick(MUSCLES[m])}
          </button>
        ))}
      </div>
      <label className="mb-4 flex items-center gap-2 text-sm">
        <input type="checkbox" className="h-5 w-5" checked={availableOnly} onChange={(e) => setAvailableOnly(e.target.checked)} />
        {L("المتاح في جيمي فقط (حسب الإعدادات)", "Only what's available in my gym (from Settings)")}
      </label>

      {tab === "exercises" ? (
        <ul className="grid grid-cols-2 gap-2" data-testid="library-list">
          {exercises.map((e) => {
            const t = exerciseText(e, lang);
            const av = equipmentAvailability(e, settings.equipment);
            return (
              <li key={e.id}>
                <Link href={`/library/exercise/?id=${encodeURIComponent(e.id)}`} className="card block overflow-hidden p-0 active:opacity-80">
                  <div className="relative">
                    <ExerciseThumb exercise={e} className="h-28 w-full" rounded="rounded-none" />
                    <span className={`absolute start-1.5 top-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${e.level === "beginner" ? "level-easy" : e.level === "intermediate" ? "level-med" : "level-hard"}`}>{pick(LEVELS[e.level])}</span>
                    {e.reviewRequired && <span className="absolute end-1.5 top-1.5 rounded-md bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">{L("مراجعة", "Review")}</span>}
                  </div>
                  <div className="p-2">
                    <div className="line-clamp-2 text-sm font-bold leading-tight" data-testid="lib-name">
                      {t.name}
                    </div>
                    <div className={`truncate text-[11px] text-muted ${lang === "ar" ? "ltr text-start" : ""}`}>{t.otherName}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-1">
                      <Badge tone="accent">{pick(MUSCLES[e.primaryMuscles[0]])}</Badge>
                      {av === "unavailable" && <Badge tone="red">{L("غير متاح", "N/A")}</Badge>}
                      {e.custom && <Badge tone="blue">{L("مخصص", "Custom")}</Badge>}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
          {exercises.length === 0 && <li className="col-span-2 py-8 text-center text-muted">{L("لا توجد نتائج مطابقة.", "No matching results.")}</li>}
        </ul>
      ) : (
        <ul className="grid grid-cols-2 gap-2" data-testid="equipment-list">
          {equipment.map((info) => {
            const rel = relatedExercises(info.id);
            const picId = illustrationExercise(info.id, (x) => !!mediaFor(x).drawings && !!map[x]);
            const picEx = (picId && map[picId]) || rel.map((id) => map[id]).find(Boolean);
            return (
              <li key={info.id}>
                <Link href={`/equipment/?id=${info.id}`} className="card block overflow-hidden p-0 active:opacity-80" data-testid="equipment-card">
                  <div className="relative">
                    {picEx ? <ExerciseThumb exercise={picEx} className="h-28 w-full" rounded="rounded-none" /> : <div className="flex h-28 flex-col items-center justify-center bg-[rgb(var(--surface-2))] text-[11px] text-muted"><span className="text-2xl">🏋️</span>{L("لا توجد صورة بعد", "No image yet")}</div>}
                    <span className="absolute end-1.5 top-1.5">{availBadge(settings.equipment[info.id] ?? "unknown")}</span>
                  </div>
                  <div className="p-2">
                    <div className="text-sm font-bold leading-tight">{pick(EQUIPMENT[info.id])}</div>
                    <div className={`truncate text-[11px] text-muted ${lang === "ar" ? "ltr text-start" : ""}`}>{lang === "ar" ? EQUIPMENT[info.id].en : EQUIPMENT[info.id].ar}</div>
                    <div className="mt-1 text-[11px] text-accent">
                      {pick(CATEGORIES[info.category])} · {rel.length} {L("تمارين", "exercises")}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
          {equipment.length === 0 && <li className="col-span-2 py-8 text-center text-muted">{L("لا توجد نتائج مطابقة.", "No matching results.")}</li>}
        </ul>
      )}
    </div>
  );
}
