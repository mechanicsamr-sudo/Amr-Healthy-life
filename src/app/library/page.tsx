"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { IconPlus, IconSearch } from "@/components/icons";
import { Badge, Loading, PageHeader } from "@/components/ui";
import { useExercises, useSettings } from "@/lib/hooks";
import { EQUIPMENT, MUSCLE_ORDER, MUSCLES } from "@/lib/labels";
import { matchesQuery } from "@/lib/search";
import { equipmentAvailability } from "@/lib/substitution";
import type { EquipmentId, MuscleGroup } from "@/lib/types";

const FILTER_KEY = "libraryFilters";

export default function LibraryPage() {
  const { list, loaded } = useExercises();
  const { settings } = useSettings();
  const [q, setQ] = useState("");
  const [muscle, setMuscle] = useState<MuscleGroup | "all">("all");
  const [equip, setEquip] = useState<EquipmentId | "all">("all");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [kind, setKind] = useState<"all" | "strength" | "cardio">("all");

  // تذكر الفلاتر لراحة المستخدم فقط
  useEffect(() => {
    try {
      const f = JSON.parse(localStorage.getItem(FILTER_KEY) || "{}");
      if (f.muscle) setMuscle(f.muscle);
      if (f.equip) setEquip(f.equip);
      if (f.kind) setKind(f.kind);
      if (f.availableOnly) setAvailableOnly(true);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(FILTER_KEY, JSON.stringify({ muscle, equip, kind, availableOnly }));
    } catch {}
  }, [muscle, equip, kind, availableOnly]);

  const usedEquipment = useMemo(() => {
    const s = new Set<EquipmentId>();
    list.forEach((e) => e.equipment.forEach((x) => x !== "none" && s.add(x)));
    return [...s];
  }, [list]);

  const filtered = useMemo(
    () =>
      list.filter(
        (e) =>
          matchesQuery(e, q) &&
          (muscle === "all" || e.primaryMuscles.includes(muscle) || e.secondaryMuscles.includes(muscle)) &&
          (equip === "all" || e.equipment.includes(equip)) &&
          (kind === "all" || e.kind === kind) &&
          (!availableOnly || equipmentAvailability(e, settings.equipment) === "available"),
      ),
    [list, q, muscle, equip, kind, availableOnly, settings.equipment],
  );

  if (!loaded) return <Loading />;

  return (
    <div>
      <PageHeader
        title="دليل العضلات والأجهزة"
        subtitle={`${list.length} تمرين/جهاز`}
        actions={
          <Link href="/library/custom/" className="btn-secondary px-3" aria-label="إضافة تمرين مخصص">
            <IconPlus size={20} />
          </Link>
        }
      />

      <div className="relative mb-3">
        <IconSearch className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={20} />
        <input
          type="search"
          className="input ps-10"
          placeholder="ابحث بالعربي أو الإنجليزي (مثال: leg press، سحب عالي)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="بحث"
          data-testid="library-search"
        />
      </div>

      <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label="تصفية حسب العضلة">
        <button className={`chip shrink-0 ${muscle === "all" ? "chip-active" : ""}`} onClick={() => setMuscle("all")}>
          الكل
        </button>
        {MUSCLE_ORDER.map((m) => (
          <button key={m} className={`chip shrink-0 ${muscle === m ? "chip-active" : ""}`} onClick={() => setMuscle(m)} aria-pressed={muscle === m}>
            {MUSCLES[m].ar}
          </button>
        ))}
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <select className="input" value={equip} onChange={(e) => setEquip(e.target.value as EquipmentId | "all")} aria-label="تصفية حسب المعدة">
          <option value="all">كل المعدات</option>
          {usedEquipment.map((x) => (
            <option key={x} value={x}>
              {EQUIPMENT[x].ar}
            </option>
          ))}
        </select>
        <select className="input" value={kind} onChange={(e) => setKind(e.target.value as typeof kind)} aria-label="النوع">
          <option value="all">مقاومة وكارديو</option>
          <option value="strength">مقاومة</option>
          <option value="cardio">كارديو</option>
        </select>
      </div>
      <label className="mb-4 flex items-center gap-2 text-sm">
        <input type="checkbox" className="h-5 w-5" checked={availableOnly} onChange={(e) => setAvailableOnly(e.target.checked)} />
        المعدات المتوفرة في صالتي فقط (حسب الإعدادات)
      </label>

      <ul className="space-y-2" data-testid="library-list">
        {filtered.map((e) => {
          const av = equipmentAvailability(e, settings.equipment);
          return (
            <li key={e.id}>
              <Link href={`/library/exercise/?id=${encodeURIComponent(e.id)}`} className="card block p-3 active:opacity-80">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-bold">{e.nameAr}</div>
                    <div className="ltr text-start text-sm text-muted">{e.nameEn}</div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {e.reviewRequired && <Badge tone="red">يحتاج مراجعة</Badge>}
                    {e.custom && <Badge tone="blue">مخصص</Badge>}
                    {av === "unavailable" && <Badge tone="amber">غير متوفر</Badge>}
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {e.primaryMuscles.map((m) => (
                    <Badge key={m} tone="green">
                      {MUSCLES[m].ar}
                    </Badge>
                  ))}
                  <span className="text-xs text-muted">· {e.equipment.map((x) => EQUIPMENT[x].ar).join("، ")}</span>
                </div>
              </Link>
            </li>
          );
        })}
        {filtered.length === 0 && <li className="py-8 text-center text-muted">لا توجد نتائج مطابقة.</li>}
      </ul>
    </div>
  );
}
