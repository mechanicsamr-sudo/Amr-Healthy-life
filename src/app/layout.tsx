import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "برنامجي الرياضي",
  description: "تطبيق شخصي لإدارة برنامج الجيم لمدة 6 شهور - يعمل دون اتصال ويحفظ البيانات على جهازك",
  manifest: "/manifest.webmanifest",
  applicationName: "برنامجي الرياضي",
  appleWebApp: { capable: true, title: "برنامجي", statusBarStyle: "default" },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#059674" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1117" },
  ],
};

// يطبق الوضع الداكن قبل الرسم لتجنب الوميض. القيمة نسخة من الإعدادات المحفوظة.
const themeScript = `(function(){try{var t=localStorage.getItem('theme')||'system';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
