"use client";

import { EQUIPMENT, LEVELS, LOADS, MUSCLES, PATTERNS } from "@/lib/labels";
import { healthAssessment } from "@/lib/substitution";
import { searchLinks } from "@/lib/search";
import type { Exercise, Settings } from "@/lib/types";
import ExerciseImage from "./ExerciseImage";
import { IconAlert, IconExternal } from "./icons";
import { Alert, Badge } from "./ui";

function List({ title, items, ordered = false }: { title: string; items: string[]; ordered?: boolean }) {
  if (!items.length) return null;
  const Tag = ordered ? "ol" : "ul";
  return (
    <div className="mb-4">
      <h3 className="mb-1 font-bold">{title}</h3>
      <Tag className={`${ordered ? "list-decimal" : "list-disc"} space-y-1 ps-5 text-[15px] leading-relaxed`}>
        {items.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </Tag>
    </div>
  );
}

export function MuscleChips({ e }: { e: Exercise }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {e.primaryMuscles.map((m) => (
        <Badge key={m} tone="green">
          {MUSCLES[m].ar}
        </Badge>
      ))}
      {e.secondaryMuscles.map((m) => (
        <Badge key={m}>{MUSCLES[m].ar} (ثانوية)</Badge>
      ))}
    </div>
  );
}

export function SearchLinks({ e }: { e: Exercise }) {
  const l = searchLinks(e);
  return (
    <div className="flex flex-wrap gap-2">
      <a className="btn-secondary text-sm" href={l.images} target="_blank" rel="noopener noreferrer">
        صور الجهاز <IconExternal size={16} />
      </a>
      <a className="btn-secondary text-sm" href={l.web} target="_blank" rel="noopener noreferrer">
        بحث Google <IconExternal size={16} />
      </a>
      <a className="btn-secondary text-sm" href={l.video} target="_blank" rel="noopener noreferrer">
        فيديو الأداء <IconExternal size={16} />
      </a>
    </div>
  );
}

export default function ExerciseDetails({ e, settings, showImage = true }: { e: Exercise; settings: Settings; showImage?: boolean }) {
  const health = healthAssessment(e, settings.profile.conditions);
  return (
    <div>
      {showImage && (
        <div className="mb-4">
          <ExerciseImage exercise={e} />
        </div>
      )}
      <div className="mb-3">
        <div className="text-xl font-bold">{e.nameAr}</div>
        <div className="ltr text-start text-muted">{e.nameEn}</div>
        {e.aliases.length > 0 && <div className="mt-1 text-xs text-muted">أسماء أخرى: {e.aliases.join("، ")}</div>}
      </div>

      {e.reviewRequired && (
        <div className="mb-3">
          <Alert tone="red" title="يحتاج مراجعة متخصص" icon={<IconAlert size={18} />}>
            {e.reviewRequired}
          </Alert>
        </div>
      )}
      {e.custom && (
        <div className="mb-3">
          <Alert tone="blue" title="تمرين مخصص">
            أضفت هذا التمرين بنفسك. المعلومات التي فيه من إدخالك ولم يتحقق منها التطبيق.
          </Alert>
        </div>
      )}

      <div className="mb-4">
        <MuscleChips e={e} />
      </div>

      <dl className="mb-4 grid grid-cols-2 gap-2 text-sm">
        <div className="card p-2">
          <dt className="text-muted">نمط الحركة</dt>
          <dd className="font-medium">{PATTERNS[e.pattern]}</dd>
        </div>
        <div className="card p-2">
          <dt className="text-muted">المستوى</dt>
          <dd className="font-medium">{LEVELS[e.level]}</dd>
        </div>
        <div className="card p-2">
          <dt className="text-muted">حمل الركبة</dt>
          <dd className="font-medium">{LOADS[e.kneeLoad]}</dd>
        </div>
        <div className="card p-2">
          <dt className="text-muted">حمل الظهر</dt>
          <dd className="font-medium">{LOADS[e.backLoad]}</dd>
        </div>
        <div className="card col-span-2 p-2">
          <dt className="text-muted">المعدات</dt>
          <dd className="font-medium">{e.equipment.map((x) => `${EQUIPMENT[x].ar} (${EQUIPMENT[x].en})`).join("، ")}</dd>
        </div>
        <div className="card col-span-2 p-2">
          <dt className="text-muted">المجموعات والتكرارات (إرشاد عام)</dt>
          <dd className="font-medium">{e.guideline}</dd>
        </div>
      </dl>

      {health.warnings.length > 0 && (
        <div className="mb-4">
          <Alert tone="amber" title="تنبيهات حسب القيود الصحية المسجلة" icon={<IconAlert size={18} />}>
            <ul className="list-disc space-y-1 ps-4">
              {health.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </Alert>
        </div>
      )}

      <List title="ضبط الجهاز" items={e.setup} ordered />
      <List title="خطوات الأداء الصحيح" items={e.steps} ordered />
      <List title="الأخطاء الشائعة" items={e.mistakes} />
      <div className="mb-4">
        <h3 className="mb-1 font-bold">التنفس</h3>
        <p className="text-[15px] leading-relaxed">{e.breathing}</p>
      </div>
      <List title="الاحتياطات" items={e.precautions} />

      <div className="mb-2">
        <h3 className="mb-2 font-bold">بحث مباشر باسم الجهاز بالإنجليزية</h3>
        <SearchLinks e={e} />
      </div>
    </div>
  );
}
