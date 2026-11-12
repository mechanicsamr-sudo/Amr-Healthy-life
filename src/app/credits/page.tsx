"use client";

import { PageHeader, Section } from "@/components/ui";
import { DRAWINGS, PHOTOS } from "@/data/photos";
import { VIDEO_VERIFIED_ON, VIDEOS } from "@/data/videos";
import { WARMUP_MAP } from "@/data/warmup";
import { useExercises } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { ytWatch } from "@/lib/media";

export default function CreditsPage() {
  const { map } = useExercises();
  const { L, lang, pick } = useI18n();
  const name = (id: string) => (map[id] ? (lang === "en" ? map[id].nameEn : map[id].nameAr) : WARMUP_MAP[id] ? pick(WARMUP_MAP[id].name) : id);
  const photos = Object.entries(PHOTOS).flatMap(([id, list]) => list.map((p) => ({ id, ...p })));
  const drawings = Object.entries(DRAWINGS).flatMap(([id, pair]) => pair.map((p, i) => ({ id, i, ...p })));
  return (
    <div>
      <PageHeader display title={L("المصادر", "Credits")} back="/settings/" subtitle={L("كل الصور والفيديوهات لرجال، ومراجعة يدويًا.", "All images and videos show men and were reviewed manually.")} />
      <Section title={L(`فيديوهات المدربين (${Object.keys(VIDEOS).length})`, `Coach videos (${Object.keys(VIDEOS).length})`)}>
        <p className="mb-2 text-xs text-muted">
          {L(
            `اتأكدنا يوم ${VIDEO_VERIFIED_ON} إن كل رابط شغال واسم القناة مطابق وصورة الغلاف لمدرب رجل. الفيديوهات بتشتغل من YouTube ومش بتتخزن على الموبايل. القنوات مختارة لأن المقدم فيها رجل، لكن الفيديو نفسه ما اتشافش كامل.`,
            `Checked on ${VIDEO_VERIFIED_ON}: each link works, the channel name matches, and the cover shows a male coach. Videos stream from YouTube and aren't stored on the phone. Channels were chosen for male presenters, but each video wasn't watched in full.`,
          )}
        </p>
        <ul className="card divide-y divide-[rgb(var(--border))] p-0 text-sm">
          {Object.entries(VIDEOS).map(([id, v]) => (
            <li key={id} className="flex items-center justify-between gap-2 px-3 py-2">
              <span className="min-w-0 truncate">{name(id)}</span>
              <a className="ltr shrink-0 text-accent underline" href={ytWatch(v.id)} target="_blank" rel="noopener noreferrer">
                {v.channel}
              </a>
            </li>
          ))}
        </ul>
      </Section>
      <Section title={L("صور حقيقية (Wikimedia Commons)", "Real photos (Wikimedia Commons)")}>
        <ul className="card divide-y divide-[rgb(var(--border))] p-0 text-sm">
          {photos.map((p) => (
            <li key={p.src} className="flex items-center gap-2 px-3 py-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt="" className="h-10 w-10 rounded-lg object-cover" />
              <span className="min-w-0 flex-1 truncate">{name(p.id)}</span>
              <a className="ltr shrink-0 text-accent underline" href={p.credit.source} target="_blank" rel="noopener noreferrer">
                {p.credit.author} · {p.credit.license}
              </a>
            </li>
          ))}
        </ul>
      </Section>
      {drawings.length > 0 && (
        <Section title={L("رسوم واقعية (Everkinetic عبر Wikimedia Commons)", "Realistic drawings (Everkinetic via Wikimedia Commons)")}>
          <ul className="card divide-y divide-[rgb(var(--border))] p-0 text-sm">
            {drawings.map((p) => (
              <li key={p.src} className="flex items-center gap-2 px-3 py-2">
                <span className="min-w-0 flex-1 truncate">
                  {name(p.id)} · {p.i === 0 ? L("البداية", "start") : L("النهاية", "end")}
                </span>
                <a className="ltr shrink-0 text-accent underline" href={p.credit.source} target="_blank" rel="noopener noreferrer">
                  {p.credit.author} · {p.credit.license}
                </a>
              </li>
            ))}
          </ul>
        </Section>
      )}
      <p className="text-xs text-muted">{L("الرسوم والصور معروضة كما هي مع ذكر المصدر حسب الترخيص.", "Images are shown unmodified with attribution as required by their licences.")}</p>
    </div>
  );
}
