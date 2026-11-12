"use client";

import { createContext, useContext, type ReactNode } from "react";

export type Lang = "ar" | "en";

import type { Bi, Text } from "./types";
export type { Bi };

export interface I18n {
  lang: Lang;
  dir: "rtl" | "ltr";
  /** نص باللغتين: يرجع النسخة المناسبة للغة الحالية */
  L: (ar: string, en: string) => string;
  /** قيمة ثنائية اللغة من البيانات */
  pick: (v: Text | undefined | null) => string;
  /** قائمة ثنائية اللغة */
  pickList: (v: { ar: string[]; en: string[] } | undefined | null) => string[];
  locale: string;
}

export function makeI18n(lang: Lang): I18n {
  return {
    lang,
    dir: lang === "en" ? "ltr" : "rtl",
    L: (ar, en) => (lang === "en" ? en : ar),
    pick: (v) => (!v ? "" : typeof v === "string" ? v : lang === "en" ? v.en || v.ar : v.ar || v.en),
    pickList: (v) => (v ? (lang === "en" ? (v.en.length ? v.en : v.ar) : v.ar) : []),
    locale: lang === "en" ? "en-GB" : "ar-EG-u-nu-latn",
  };
}

const Ctx = createContext<I18n>(makeI18n("ar"));

export function I18nProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <Ctx.Provider value={makeI18n(lang)}>{children}</Ctx.Provider>;
}

export function useI18n(): I18n {
  return useContext(Ctx);
}
