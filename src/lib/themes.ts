// الثيمات الستة. كل ثيم له لوحة ألوان كاملة للوضع الداكن والفاتح.
// القيم RGB بدون فواصل لاستخدامها مع rgb(var(--x) / alpha).

export type ThemeId = "sport" | "premium" | "midnight" | "clean" | "graphite" | "ocean";
export type Mode = "light" | "dark";
export type ModePref = Mode | "system";

export interface Palette {
  bg: string;
  surface: string;
  surface2: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  accentStrong: string;
  onAccent: string;
  go: string;
  onGo: string;
  hero: string;
  heroText: string;
  series1: string;
  series2: string;
  grid: string;
  meta: string;
}

export interface Theme {
  id: ThemeId;
  name: { ar: string; en: string };
  dark: Palette;
  light: Palette;
}

const SERIES_DARK = { series1: "#3987e5", series2: "#d95926", grid: "#30363d" };
const SERIES_LIGHT = { series1: "#2a78d6", series2: "#eb6834", grid: "#e5e7eb" };

export const THEMES: Theme[] = [
  {
    id: "sport",
    name: { ar: "سبورت ديناميك", en: "Sport Dynamic" },
    dark: {
      bg: "11 10 30", surface: "21 23 42", surface2: "31 34 56", text: "255 255 255", muted: "169 174 196", border: "44 47 72",
      accent: "166 255 61", accentStrong: "198 255 120", onAccent: "14 22 4", go: "91 227 107", onGo: "8 36 12",
      hero: "radial-gradient(circle at 15% 8%, #3BC9FF 0, transparent 42%), radial-gradient(circle at 95% 35%, #9B5CFF 0, transparent 48%), radial-gradient(circle at 55% 105%, #FF7A3D 0, transparent 50%), #17123A",
      heroText: "255 255 255", ...SERIES_DARK, meta: "#0B0A1E",
    },
    light: {
      bg: "243 244 248", surface: "255 255 255", surface2: "238 240 247", text: "11 16 32", muted: "94 103 130", border: "225 228 238",
      accent: "90 45 224", accentStrong: "70 30 190", onAccent: "255 255 255", go: "22 163 74", onGo: "255 255 255",
      hero: "radial-gradient(circle at 15% 8%, #3BC9FF 0, transparent 45%), radial-gradient(circle at 95% 35%, #9B5CFF 0, transparent 50%), radial-gradient(circle at 55% 105%, #FF7A3D 0, transparent 52%), #2a2160",
      heroText: "255 255 255", ...SERIES_LIGHT, meta: "#5A2DE0",
    },
  },
  {
    id: "premium",
    name: { ar: "بريميوم داكن", en: "Premium Dark" },
    dark: {
      bg: "5 5 5", surface: "17 18 20", surface2: "27 28 32", text: "255 255 255", muted: "142 146 156", border: "38 40 46",
      accent: "61 139 255", accentStrong: "120 170 255", onAccent: "255 255 255", go: "61 139 255", onGo: "255 255 255",
      hero: "radial-gradient(circle at 20% 10%, #1F5BFF 0, transparent 45%), radial-gradient(circle at 90% 80%, #00B3FF 0, transparent 45%), #07090f",
      heroText: "255 255 255", ...SERIES_DARK, meta: "#050505",
    },
    light: {
      bg: "242 244 248", surface: "255 255 255", surface2: "233 237 245", text: "10 10 11", muted: "93 99 114", border: "221 226 236",
      accent: "31 91 255", accentStrong: "24 70 210", onAccent: "255 255 255", go: "31 91 255", onGo: "255 255 255",
      hero: "radial-gradient(circle at 20% 10%, #1F5BFF 0, transparent 50%), radial-gradient(circle at 90% 80%, #00B3FF 0, transparent 50%), #0c1530",
      heroText: "255 255 255", ...SERIES_LIGHT, meta: "#1F5BFF",
    },
  },
  {
    id: "midnight",
    name: { ar: "ميدنايت بلو", en: "Midnight Blue" },
    dark: {
      bg: "8 17 48", surface: "18 32 73", surface2: "26 43 92", text: "234 246 255", muted: "147 167 209", border: "34 55 104",
      accent: "34 211 238", accentStrong: "103 232 249", onAccent: "4 18 31", go: "34 211 238", onGo: "4 18 31",
      hero: "radial-gradient(circle at 15% 10%, #22D3EE 0, transparent 42%), radial-gradient(circle at 90% 70%, #1E3A8A 0, transparent 50%), #0A1640",
      heroText: "255 255 255", ...SERIES_DARK, meta: "#081130",
    },
    light: {
      bg: "238 244 255", surface: "255 255 255", surface2: "227 236 251", text: "10 20 48", muted: "79 97 137", border: "214 225 245",
      accent: "3 105 161", accentStrong: "8 80 130", onAccent: "255 255 255", go: "8 145 178", onGo: "255 255 255",
      hero: "radial-gradient(circle at 15% 10%, #22D3EE 0, transparent 45%), radial-gradient(circle at 90% 70%, #1E3A8A 0, transparent 50%), #0f2257",
      heroText: "255 255 255", ...SERIES_LIGHT, meta: "#0369A1",
    },
  },
  {
    id: "clean",
    name: { ar: "فاتح نظيف", en: "Clean Light" },
    dark: {
      bg: "18 19 22", surface: "27 29 33", surface2: "37 40 45", text: "243 244 246", muted: "156 163 175", border: "46 49 55",
      accent: "229 231 235", accentStrong: "255 255 255", onAccent: "17 24 39", go: "52 211 153", onGo: "6 40 28",
      hero: "radial-gradient(circle at 20% 10%, #3a3d44 0, transparent 45%), radial-gradient(circle at 90% 80%, #26292e 0, transparent 50%), #1b1d21",
      heroText: "255 255 255", ...SERIES_DARK, meta: "#121316",
    },
    light: {
      bg: "246 247 249", surface: "255 255 255", surface2: "240 242 245", text: "17 24 39", muted: "107 114 128", border: "229 231 235",
      accent: "17 24 39", accentStrong: "17 24 39", onAccent: "255 255 255", go: "15 159 122", onGo: "255 255 255",
      hero: "radial-gradient(circle at 20% 10%, #ffffff 0, transparent 45%), radial-gradient(circle at 90% 80%, #D7DCE3 0, transparent 50%), #ECEEF2",
      heroText: "17 24 39", ...SERIES_LIGHT, meta: "#F6F7F9",
    },
  },
  {
    id: "graphite",
    name: { ar: "جرافيت برو", en: "Graphite Pro" },
    dark: {
      bg: "23 24 27", surface: "34 36 40", surface2: "44 47 52", text: "244 244 245", muted: "161 161 170", border: "52 55 61",
      accent: "255 122 26", accentStrong: "255 159 80", onAccent: "26 13 0", go: "255 138 42", onGo: "26 13 0",
      hero: "radial-gradient(circle at 18% 10%, #FF7A1A 0, transparent 42%), radial-gradient(circle at 90% 75%, #FFB020 0, transparent 40%), #24262b",
      heroText: "255 255 255", ...SERIES_DARK, meta: "#17181B",
    },
    light: {
      bg: "244 244 245", surface: "255 255 255", surface2: "236 236 238", text: "24 24 27", muted: "95 95 102", border: "226 226 229",
      accent: "226 95 0", accentStrong: "190 75 0", onAccent: "255 255 255", go: "226 95 0", onGo: "255 255 255",
      hero: "radial-gradient(circle at 18% 10%, #FF7A1A 0, transparent 45%), radial-gradient(circle at 90% 75%, #FFB020 0, transparent 45%), #3a3d44",
      heroText: "255 255 255", ...SERIES_LIGHT, meta: "#E25F00",
    },
  },
  {
    id: "ocean",
    name: { ar: "أوشن بلو", en: "Ocean Blue" },
    dark: {
      bg: "4 32 46", surface: "10 48 66", surface2: "15 62 85", text: "230 251 255", muted: "143 187 201", border: "20 75 99",
      accent: "45 212 191", accentStrong: "94 234 212", onAccent: "3 30 27", go: "45 212 191", onGo: "3 30 27",
      hero: "radial-gradient(circle at 18% 10%, #38BDF8 0, transparent 45%), radial-gradient(circle at 90% 75%, #14B8A6 0, transparent 48%), #0B4F75",
      heroText: "255 255 255", ...SERIES_DARK, meta: "#04202E",
    },
    light: {
      bg: "234 246 250", surface: "255 255 255", surface2: "221 240 246", text: "6 42 58", muted: "76 115 131", border: "207 231 239",
      accent: "2 132 199", accentStrong: "3 105 161", onAccent: "255 255 255", go: "13 148 136", onGo: "255 255 255",
      hero: "radial-gradient(circle at 18% 10%, #38BDF8 0, transparent 48%), radial-gradient(circle at 90% 75%, #14B8A6 0, transparent 50%), #0B4F75",
      heroText: "255 255 255", ...SERIES_LIGHT, meta: "#0284C7",
    },
  },
];

export const THEME_MAP = Object.fromEntries(THEMES.map((t) => [t.id, t])) as Record<ThemeId, Theme>;
export const DEFAULT_THEME: ThemeId = "sport";

const VAR_NAMES: Record<keyof Palette, string> = {
  bg: "--bg", surface: "--surface", surface2: "--surface-2", text: "--text", muted: "--muted", border: "--border",
  accent: "--accent", accentStrong: "--accent-strong", onAccent: "--on-accent", go: "--go", onGo: "--on-go",
  hero: "--hero", heroText: "--hero-text", series1: "--series-1", series2: "--series-2", grid: "--grid", meta: "--meta",
};

export function paletteVars(p: Palette): Record<string, string> {
  return Object.fromEntries(Object.entries(p).map(([k, v]) => [VAR_NAMES[k as keyof Palette], v]));
}

export function resolveMode(pref: ModePref, systemDark: boolean): Mode {
  return pref === "system" ? (systemDark ? "dark" : "light") : pref;
}

/** يطبق الثيم فورًا على الصفحة بدون إعادة تحميل */
export function applyTheme(themeId: ThemeId, mode: Mode) {
  const theme = THEME_MAP[themeId] ?? THEME_MAP[DEFAULT_THEME];
  const root = document.documentElement;
  const vars = paletteVars(theme[mode]);
  for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
  root.classList.toggle("dark", mode === "dark");
  root.dataset.theme = theme.id;
  root.style.colorScheme = mode;
  document.querySelector('meta[name="theme-color"]:not([media])')?.setAttribute("content", theme[mode].meta);
}

/** نسخة مصغرة تُحقن في <head> قبل الرسم لتجنب الوميض */
export function themeBootScript(): string {
  const table = Object.fromEntries(THEMES.map((t) => [t.id, { dark: paletteVars(t.dark), light: paletteVars(t.light) }]));
  return `(function(){try{var T=${JSON.stringify(table)};var s=JSON.parse(localStorage.getItem('appearance')||'{}');var id=T[s.theme]?s.theme:'${DEFAULT_THEME}';var m=s.mode||'dark';if(m==='system')m=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';var v=T[id][m],r=document.documentElement;for(var k in v)r.style.setProperty(k,v[k]);if(m==='dark')r.classList.add('dark');r.dataset.theme=id;r.style.colorScheme=m;var l=s.lang==='en'?'en':'ar';r.lang=l;r.dir=l==='en'?'ltr':'rtl';}catch(e){}})();`;
}
