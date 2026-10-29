"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { searchLinks } from "@/lib/search";
import type { Exercise } from "@/lib/types";
import { IconExternal, IconImage } from "./icons";
import { Badge } from "./ui";

const STATUS: Record<string, { label: string; tone: "green" | "amber" | "neutral" | "blue" }> = {
  verified: { label: "صورة موثقة", tone: "green" },
  unverified: { label: "صورة غير متحقق منها", tone: "amber" },
  user_provided: { label: "صورة أضفتها أنت", tone: "blue" },
  missing: { label: "لا توجد صورة موثقة", tone: "neutral" },
};

/**
 * يعرض صورة الجهاز فقط إذا كانت مرتبطة بهذا التمرين تحديدًا (موثقة أو أضافها المستخدم).
 * في غير ذلك يعرض مكانًا مخصصًا واضحًا، ولا يعرض صورة جهاز آخر.
 */
export default function ExerciseImage({ exercise, compact = false }: { exercise: Exercise; compact?: boolean }) {
  const media = useLiveQuery(() => db.media.get(exercise.id), [exercise.id]);
  const userSrc = media?.imageDataUrl || media?.imageUrl || null;
  const builtIn = exercise.image.url && exercise.image.verification === "verified" ? exercise.image.url : null;
  const src = userSrc || builtIn;
  const status = userSrc ? "user_provided" : builtIn ? "verified" : exercise.image.url ? "unverified" : "missing";
  const links = searchLinks(exercise);
  const h = compact ? "h-36" : "h-52";

  return (
    <figure className="overflow-hidden rounded-2xl border border-base surface-2">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={`${exercise.nameAr} - ${exercise.image.deviceName}`} className={`${h} w-full object-contain`} loading="lazy" />
      ) : (
        <div className={`${h} flex flex-col items-center justify-center gap-2 p-3 text-center`} data-testid="image-placeholder">
          <IconImage size={36} className="text-muted" />
          <div className="text-sm font-medium">مكان مخصص لصورة الجهاز</div>
          <div className="ltr text-xs text-muted">{exercise.image.deviceName}</div>
          {!compact && <div className="text-xs text-muted">لم تُرفق صورة موثقة لهذا الجهاز. استخدم روابط البحث أو أضف صورة الجهاز من صالتك.</div>}
        </div>
      )}
      <figcaption className="flex flex-wrap items-center gap-2 border-t border-base p-2 text-xs">
        <Badge tone={STATUS[status].tone}>{STATUS[status].label}</Badge>
        {userSrc && media?.source && <span className="text-muted">المصدر: {media.source}</span>}
        {!userSrc && exercise.image.source && <span className="text-muted">المصدر: {exercise.image.source}</span>}
        <a href={links.images} target="_blank" rel="noopener noreferrer" className="ms-auto inline-flex items-center gap-1 font-medium text-brand-700 underline dark:text-brand-400">
          بحث صور <IconExternal size={14} />
        </a>
      </figcaption>
    </figure>
  );
}
