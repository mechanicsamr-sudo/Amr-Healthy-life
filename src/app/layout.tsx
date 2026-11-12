import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";
import { themeBootScript } from "@/lib/themes";

export const metadata: Metadata = {
  title: "برنامجي الرياضي",
  description: "تطبيق شخصي لإدارة برنامج الجيم لمدة 6 شهور · Personal 6-month gym program app – works offline, data stays on your device",
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
};

// يطبق الثيم واللغة المحفوظين قبل الرسم لتجنب الوميض.
const bootScript = themeBootScript();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0B0A1E" />
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="font-sans antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
