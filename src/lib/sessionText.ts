import { getSession } from "@/data/program";
import type { PlannedSession, Text } from "./types";

function pickText(v: Text | undefined, lang: "ar" | "en") {
  if (!v) return "";
  return typeof v === "string" ? v : v[lang] || v.ar;
}

/** عنوان الحصة المختصر (الجزء بعد ":") باللغة المختارة. يستخدم نص البرنامج الحالي حتى للسجلات القديمة. */
export function sessionTitle(s: Pick<PlannedSession, "id" | "name">, lang: "ar" | "en"): string {
  const current = getSession(s.id);
  const full = pickText(current?.name ?? s.name, lang);
  const i = full.indexOf(":");
  return i >= 0 ? full.slice(i + 1).trim() : full;
}

export function sessionName(s: Pick<PlannedSession, "id" | "name">, lang: "ar" | "en"): string {
  return pickText(getSession(s.id)?.name ?? s.name, lang);
}
