import type { NextConfig } from "next";

// تصدير ثابت بالكامل: التطبيق لا يحتاج خادمًا، وكل البيانات تُحفظ محليًا في IndexedDB.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
