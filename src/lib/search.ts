import type { Exercise } from "./types";

/** روابط بحث مباشرة باسم الجهاز بالإنجليزية. تعمل دائمًا حتى بدون صورة. */
export function searchLinks(e: Pick<Exercise, "nameEn" | "image">) {
  const q = encodeURIComponent(e.image.deviceName || e.nameEn);
  const tutorial = encodeURIComponent(`${e.nameEn} proper form`);
  return {
    images: `https://www.google.com/search?tbm=isch&q=${q}`,
    web: `https://www.google.com/search?q=${q}`,
    video: `https://www.youtube.com/results?search_query=${tutorial}`,
  };
}

/** توحيد النص العربي للبحث (الهمزات والتاء المربوطة والتشكيل) */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[ً-ْـ]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[-_]/g, " ")
    .trim();
}

export function matchesQuery(e: Exercise, q: string): boolean {
  const nq = normalize(q);
  if (!nq) return true;
  const hay = normalize([e.nameAr, e.nameEn, e.image.deviceName, ...e.aliases].join(" "));
  return nq.split(/\s+/).every((t) => hay.includes(t));
}
