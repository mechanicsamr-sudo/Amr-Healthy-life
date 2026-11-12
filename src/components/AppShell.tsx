"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useSettings } from "@/lib/hooks";
import { I18nProvider, makeI18n } from "@/lib/i18n";
import { applyTheme, resolveMode } from "@/lib/themes";
import { IconBook, IconChart, IconDumbbell, IconGear, IconHome } from "./icons";

const NAV = [
  { href: "/", ar: "الرئيسية", en: "Home", icon: IconHome, match: (p: string) => p === "/" },
  { href: "/workout/", ar: "تمرين اليوم", en: "Workout", icon: IconDumbbell, match: (p: string) => p.startsWith("/workout") || p.startsWith("/warmup") || p.startsWith("/program") },
  { href: "/library/", ar: "دليل الأجهزة", en: "Equipment", icon: IconBook, match: (p: string) => p.startsWith("/library") || p.startsWith("/equipment") },
  { href: "/progress/", ar: "التقدم", en: "Progress", icon: IconChart, match: (p: string) => p.startsWith("/progress") || p.startsWith("/reports") },
  { href: "/settings/", ar: "الإعدادات", en: "Settings", icon: IconGear, match: (p: string) => p.startsWith("/settings") || p.startsWith("/safety") || p.startsWith("/credits") },
];

/** يطبق الثيم والوضع واللغة فورًا ويحفظ نسخة لسكريبت ما قبل الرسم */
function useAppearance() {
  const { settings, loaded } = useSettings();
  const { themeId, theme: modePref, language } = settings;
  useEffect(() => {
    if (!loaded) return;
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const apply = () => applyTheme(themeId, resolveMode(modePref, mq.matches));
    apply();
    document.documentElement.lang = language;
    document.documentElement.dir = language === "en" ? "ltr" : "rtl";
    try {
      localStorage.setItem("appearance", JSON.stringify({ theme: themeId, mode: modePref, lang: language }));
    } catch {}
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [themeId, modePref, language, loaded]);
  return language;
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
  const lang = useAppearance();
  const waitingSw = useServiceWorker();
  const online = useOnline();
  const { L } = makeI18n(lang);

  return (
    <I18nProvider lang={lang}>
      <div className="mx-auto min-h-dvh max-w-xl">
        {!online && (
          <div className="no-print sticky top-0 z-30 bg-gray-800 px-4 py-1.5 text-center text-xs text-white" role="status">
            {L(
              "أنت غير متصل بالإنترنت. بياناتك محفوظة على جهازك، والفيديوهات وروابط البحث هترجع لما النت يرجع.",
              "You're offline. Your data is saved on this device; videos and search links return when you're back online.",
            )}
          </div>
        )}
        {waitingSw && (
          <div className="no-print sticky top-0 z-30 flex items-center justify-between gap-2 bg-gray-900 px-4 py-2 text-sm text-white">
            <span>{L("يتوفر إصدار أحدث من التطبيق.", "A newer version is available.")}</span>
            <button className="rounded-lg bg-white/20 px-3 py-1" onClick={() => waitingSw.postMessage("SKIP_WAITING")}>
              {L("تحديث", "Update")}
            </button>
          </div>
        )}
        <main className="px-4 pb-28 pt-[max(1rem,env(safe-area-inset-top))]">{children}</main>
        <nav
          aria-label={L("التنقل الرئيسي", "Main navigation")}
          className="no-print fixed inset-x-0 bottom-0 z-20 border-t border-base pb-[env(safe-area-inset-bottom)] backdrop-blur"
          style={{ background: "rgb(var(--surface) / 0.92)" }}
        >
          <ul className="mx-auto grid max-w-xl grid-cols-5">
            {NAV.map(({ href, ar, en, icon: Icon, match }) => {
              const active = match(pathname);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium ${active ? "text-accent font-bold" : "text-muted"}`}
                  >
                    <Icon size={24} />
                    <span className="whitespace-nowrap">{L(ar, en)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </I18nProvider>
  );
}
