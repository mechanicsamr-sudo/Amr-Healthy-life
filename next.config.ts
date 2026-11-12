import type { NextConfig } from "next";

// تصدير ثابت بالكامل: التطبيق لا يحتاج خادمًا، وكل البيانات تُحفظ محليًا في IndexedDB.
// BASE_PATH (مثل /Amr-Healthy-life) للنشر تحت مسار فرعي على GitHub Pages؛ فارغ محليًا.
const basePath = process.env.BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
