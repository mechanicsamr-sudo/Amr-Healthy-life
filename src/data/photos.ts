// صور حقيقية ورسوم واقعية مرخصة، مضمنة في التطبيق (تعمل بدون إنترنت).
// كل صورة لرجل وتمت مراجعتها يدويًا. المصدر والترخيص يظهران على الصورة وفي صفحة المصادر.

export interface MediaCredit {
  author: string;
  license: string;
  source: string; // رابط صفحة الملف
}

export interface PhotoRef {
  src: string;
  credit: MediaCredit;
}

const ABOOYEAH = (file: string): MediaCredit => ({ author: "Abooyeah", license: "CC BY-SA 4.0", source: `https://commons.wikimedia.org/wiki/File:${file}` });

/** صور حقيقية (Wikimedia Commons) */
export const PHOTOS: Record<string, PhotoRef[]> = {
  lat_pulldown: [
    { src: "/media/photos/lat_pulldown-amer.jpg", credit: ABOOYEAH("Amer-Lat-Pulldown.jpg") },
    { src: "/media/photos/lat_pulldown-marian.jpg", credit: ABOOYEAH("Marian-Lats-Pull-Down.jpg") },
  ],
  leg_press: [{ src: "/media/photos/leg_press-marian.jpg", credit: ABOOYEAH("Marian-Leg-Press.jpg") }],
};

/** رسوم Everkinetic الواقعية: [البداية، النهاية] */
export const DRAWINGS: Record<string, [PhotoRef, PhotoRef]> = {};
