"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useSettings } from "@/lib/hooks";
import { IconBook, IconChart, IconDumbbell, IconGear, IconHome } from "./icons";

const NAV = [
  { href: "/", label: "الرئيسية", icon: IconHome, match: (p: string) => p === "/" },
  { href: "/workout/", label: "تمرين اليوم", icon: IconDumbbell, match: (p: string) => p.startsWith("/workout") },
  { href: "/library/", label: "دليل الأجهزة", icon: IconBook, match: (p: string) => p.startsWith("/library") },
  { href: "/progress/", label: "التقدم", icon: IconChart, match: (p: string) => p.startsWith("/progress") || p.startsWith("/reports") },
  { href: "/settings/", label: "الإعدادات", icon: IconGear, match: (p: string) => p.startsWith("/settings") || p.startsWith("/program") || p.startsWith("/safety") },
];

function useThemeSync() {
  const { settings, loaded } = useSettings();
  useEffect(() => {
    if (!loaded) return;
    const apply = () => {
      const dark = settings.theme === "dark" || (settings.theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList.toggle("dark", dark);
    };
    try {
      localStorage.setItem("theme", settings.theme);
    } catch {}
    apply();
    const mq = matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [settings.theme, loaded]);
}

function useServiceWorker() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  useEffect(() => {
    if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") return;
    let reloading = false;
    // إعادة التحميل فقط عند تحديث نسخة موجودة، وليس عند التثبيت الأول
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloading || !hadController) return;
      reloading = true;
      location.reload();
    });
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        if (reg.waiting && navigator.serviceWorker.controller) setWaiting(reg.waiting);
        reg.addEventListener("updatefound", () => {
          const sw = reg.installing;
          sw?.addEventListener("statechange", () => {
            if (sw.state === "installed" && navigator.serviceWorker.controller) setWaiting(sw);
          });
        });
      })
      .catch(() => {});
  }, []);
  return waiting;
}

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

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  useThemeSync();
  const waitingSw = useServiceWorker();
  const online = useOnline();

  return (
    <div className="mx-auto min-h-dvh max-w-xl">
      {!online && (
        <div className="no-print sticky top-0 z-30 bg-gray-800 px-4 py-1.5 text-center text-xs text-white" role="status">
          أنت غير متصل بالإنترنت. البيانات تُحفظ على جهازك، وروابط البحث والصور الخارجية لن تعمل حتى يعود الاتصال.
        </div>
      )}
      {waitingSw && (
        <div className="no-print sticky top-0 z-30 flex items-center justify-between gap-2 bg-brand-700 px-4 py-2 text-sm text-white">
          <span>يتوفر إصدار أحدث من التطبيق.</span>
          <button className="rounded-lg bg-white/20 px-3 py-1" onClick={() => waitingSw.postMessage("SKIP_WAITING")}>
            تحديث
          </button>
        </div>
      )}
      <main className="px-4 pb-28 pt-[max(1rem,env(safe-area-inset-top))]">{children}</main>
      <nav
        aria-label="التنقل الرئيسي"
        className="no-print fixed inset-x-0 bottom-0 z-20 border-t border-base pb-[env(safe-area-inset-bottom)]"
        style={{ background: "rgb(var(--surface))" }}
      >
        <ul className="mx-auto grid max-w-xl grid-cols-5">
          {NAV.map(({ href, label, icon: Icon, match }) => {
            const active = match(pathname);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium ${active ? "text-brand-600 dark:text-brand-400" : "text-muted"}`}
                >
                  <Icon size={24} />
                  <span className="whitespace-nowrap">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
