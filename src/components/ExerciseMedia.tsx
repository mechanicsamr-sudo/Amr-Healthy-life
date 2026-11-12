"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import { useI18n } from "@/lib/i18n";
import { mediaFor, ytEmbed, ytThumb, ytWatch } from "@/lib/media";
import { searchLinks } from "@/lib/search";
import type { Exercise } from "@/lib/types";
import { IconExternal, IconImage } from "./icons";

function useOnline() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
}

export function PlayIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5v14l11-7z" fill="currentColor" />
    </svg>
  );
}

/** أفضل صورة متاحة: صورة المستخدم ← صورة حقيقية ← رسم واقعي ← غلاف الفيديو (أونلاين) */
export function useExercisePicture(e: Exercise) {
  const media = useLiveQuery(() => db.media.get(e.id), [e.id]);
  const m = mediaFor(e.id);
  const online = useOnline();
  const user = media?.imageDataUrl || media?.imageUrl || null;
  if (user) return { src: user, kind: "user" as const, credit: media?.source ?? null, contain: false };
  if (m.photo) return { src: m.photo.src, kind: "photo" as const, credit: `${m.photo.credit.author} · ${m.photo.credit.license}`, contain: false };
  if (m.drawings) return { src: m.drawings[0].src, kind: "drawing" as const, credit: `${m.drawings[0].credit.author} · ${m.drawings[0].credit.license}`, contain: true };
  if (m.video && online) return { src: ytThumb(m.video.id), kind: "video" as const, credit: m.video.channel, contain: false };
  return { src: null, kind: "none" as const, credit: null, contain: false };
}

/** صورة مصغرة للكروت */
export function ExerciseThumb({ exercise, className = "", rounded = "rounded-2xl" }: { exercise: Exercise; className?: string; rounded?: string }) {
  const pic = useExercisePicture(exercise);
  const [broken, setBroken] = useState(false);
  const hasVideo = !!mediaFor(exercise.id).video;
  return (
    <div className={`relative overflow-hidden ${rounded} ${pic.kind === "drawing" ? "bg-gradient-to-br from-orange-100 to-violet-200" : "hero"} ${className}`}>
      {pic.src && !broken ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={pic.src}
          alt={exercise.nameEn}
          loading="lazy"
          onError={() => setBroken(true)}
          className={`h-full w-full ${pic.contain ? "object-contain mix-blend-multiply" : "object-cover"}`}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-white/80">
          <IconImage size={28} />
        </div>
      )}
      {hasVideo && (
        <span className="absolute bottom-1.5 end-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-black shadow">
          <PlayIcon size={13} />
        </span>
      )}
    </div>
  );
}

/** الصورة الكبيرة + مشغل الفيديو عند الضغط */
export default function ExerciseMedia({ exercise, height = 240 }: { exercise: Exercise; height?: number }) {
  const { L } = useI18n();
  const pic = useExercisePicture(exercise);
  const m = mediaFor(exercise.id);
  const online = useOnline();
  const [playing, setPlaying] = useState(false);
  const [broken, setBroken] = useState(false);
  const links = searchLinks(exercise);
  const kindLabel = {
    user: L("صورة أضفتها أنت", "Your photo"),
    photo: L("صورة حقيقية", "Real photo"),
    drawing: L("رسم واقعي", "Realistic drawing"),
    video: L("غلاف الفيديو", "Video cover"),
    none: L("لا توجد صورة موثقة بعد", "No verified image yet"),
  }[pic.kind];

  return (
    <figure className="overflow-hidden rounded-[22px] border border-base" data-testid="exercise-media">
      <div className={`relative ${pic.kind === "drawing" ? "bg-gradient-to-br from-orange-100 to-violet-200" : "hero"}`} style={{ height }}>
        {playing && m.video ? (
          online ? (
            <iframe
              title={`${exercise.nameEn} – ${m.video.channel}`}
              src={ytEmbed(m.video.id)}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              data-testid="video-iframe"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80 p-4 text-center text-white">
              <b>{L("الفيديو محتاج إنترنت", "The video needs internet")}</b>
              <span className="text-xs opacity-80">{L("تابع بالصور والخطوات لحد ما النت يرجع. الفيديوهات مش بتتخزن على الموبايل.", "Follow the images and steps until you're back online. Videos aren't stored on the phone.")}</span>
              <button className="btn-secondary mt-1 min-h-10 px-3 text-sm" onClick={() => setPlaying(false)}>
                {L("رجوع للصورة", "Back to image")}
              </button>
            </div>
          )
        ) : (
          <>
            {pic.src && !broken ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pic.src}
                alt={`${exercise.nameAr} – ${exercise.nameEn}`}
                onError={() => setBroken(true)}
                className={`absolute inset-0 h-full w-full ${pic.contain ? "object-contain mix-blend-multiply" : "object-cover"}`}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-white/85" data-testid="image-placeholder">
                <IconImage size={36} />
                <span className="text-sm font-bold">{L("لا توجد صورة موثقة بعد", "No verified image yet")}</span>
                <span className="ltr text-xs opacity-80">{exercise.image.deviceName}</span>
              </div>
            )}
            {m.video && (
              <button
                className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-black shadow-xl transition active:scale-95"
                onClick={() => setPlaying(true)}
                aria-label={L("تشغيل فيديو المدرب", "Play coach video")}
                data-testid="play-video"
              >
                <PlayIcon size={28} />
              </button>
            )}
            {m.video && (
              <span className="absolute start-2 top-2 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-bold text-white">
                ▶ {L("فيديو مدرب", "Coach video")} · <span className="ltr">{m.video.length}</span>
              </span>
            )}
          </>
        )}
      </div>
      <figcaption className="flex flex-wrap items-center gap-x-2 gap-y-1 px-3 py-2 text-xs" style={{ background: "rgb(var(--surface))" }}>
        <span className="font-bold">{kindLabel}</span>
        {pic.credit && <span className="ltr text-muted">{pic.credit}</span>}
        {m.video && (
          <span className="text-muted">
            · ▶ <span className="ltr">{m.video.channel}</span>
          </span>
        )}
        <span className="ms-auto flex gap-3">
          {m.video && (
            <a href={ytWatch(m.video.id)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold text-accent underline">
              YouTube <IconExternal size={13} />
            </a>
          )}
          <a href={links.images} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold text-accent underline">
            {L("بحث صور", "Image search")} <IconExternal size={13} />
          </a>
        </span>
      </figcaption>
    </figure>
  );
}
