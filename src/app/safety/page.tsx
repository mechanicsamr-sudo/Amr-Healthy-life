"use client";

import { RedFlagList } from "@/components/Safety";
import { Alert, PageHeader, Section } from "@/components/ui";
import { CONDITION_GUIDANCE, DISCLAIMER, RPE_SCALE } from "@/lib/health";
import { useSettings } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";

export default function SafetyPage() {
  const { settings } = useSettings();
  const { L, pick } = useI18n();
  const c = settings.profile.conditions;
  const blocks = [c.kneeOA && CONDITION_GUIDANCE.kneeOA, c.backPain && CONDITION_GUIDANCE.backPain, c.bpMeds && CONDITION_GUIDANCE.bp, settings.profile.level === "beginner" && CONDITION_GUIDANCE.beginner].filter(Boolean) as (typeof CONDITION_GUIDANCE)["kneeOA"][];

  return (
    <div>
      <PageHeader display title={L("السلامة", "Safety")} back="/settings/" />
      <div className="mb-4">
        <Alert tone="blue">{pick(DISCLAIMER)}</Alert>
      </div>
      <Section title={L("أعراض تستدعي التوقف فورًا", "Stop immediately if")}>
        <RedFlagList />
        <a href="tel:123" className="btn-danger mt-3 w-full">
          {L("اتصال بالإسعاف (123 - مصر)", "Call an ambulance (123 – Egypt)")}
        </a>
      </Section>
      <Section title={L("تذكيرات حسب حالتك المسجلة", "Reminders for your recorded conditions")}>
        {blocks.length === 0 && <p className="text-sm text-muted">{L("لا توجد حالات مسجلة في الإعدادات.", "No conditions recorded in Settings.")}</p>}
        <div className="space-y-3">
          {blocks.map((b) => (
            <div key={b.title.en} className="card p-3">
              <div className="mb-1 font-bold">{pick(b.title)}</div>
              <ul className="list-disc space-y-1 ps-5 text-sm leading-relaxed">
                {b.points.map((p, i) => (
                  <li key={i}>{pick(p)}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>
      <Section title={L("مقياس الجهد (RPE)", "Effort scale (RPE)")}>
        <div className="card p-3">
          <ul className="space-y-1 text-sm">
            {RPE_SCALE.map((r) => (
              <li key={r.value}>{pick(r.label)}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted">{L("سهل ≈ 5 · مناسب ≈ 7 · صعب ≈ 9", "Easy ≈ 5 · Just right ≈ 7 · Difficult ≈ 9")}</p>
        </div>
      </Section>
      <Section title={L("إزاي التطبيق بيتعامل مع الألم", "How the app handles pain")}>
        <div className="card p-3 text-sm leading-relaxed">
          {L(
            "تسجيل الألم بيستخدم لتذكيرك توقف الحركة اللي بتزود الألم، أو تعدلها بعد التحقق، أو تطلب تقييم متخصص. لو سجلت «ألم شديد»، التطبيق بيطلب منك توقف الحركة ومش بيقترح بديل بيحمّل نفس المنطقة في الحصة دي. التطبيق مش بيغيّر البرنامج تلقائيًا ولا بياخد قرارات علاجية.",
            "Pain logging is used to remind you to stop a movement that increases pain, adjust it after checking, or get a specialist assessment. If you log “severe pain”, the app asks you to stop that movement and won't suggest an alternative that loads the same area this session. It never changes your program automatically or makes treatment decisions.",
          )}
        </div>
      </Section>
    </div>
  );
}
