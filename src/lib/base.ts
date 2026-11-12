/** المسار الأساسي للموقع (فارغ محليًا، و/Amr-Healthy-life على GitHub Pages) */
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const asset = (p: string) => (p.startsWith("/") ? BASE + p : p);
