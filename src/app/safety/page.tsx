"use client";

import { RedFlagList } from "@/components/Safety";
import { Alert, PageHeader, Section } from "@/components/ui";
import { CONDITION_GUIDANCE, DISCLAIMER, RPE_SCALE } from "@/lib/health";
import { useSettings } from "@/lib/hooks";

export default function SafetyPage() {
  const { settings } = useSettings();
  const c = settings.profile.conditions;
  const blocks = [
    c.kneeOA && CONDITION_GUIDANCE.kneeOA,
    c.backPain && CONDITION_GUIDANCE.backPain,
    c.bpMeds && CONDITION_GUIDANCE.bp,
    settings.profile.level === "beginner" && CONDITION_GUIDANCE.beginner,
  ].filter(Boolean) as { title: string; points: string[] }[];

  return (
    <div>
      <PageHeader title="السلامة والتنبيهات" back="/settings/" />
      <div className="mb-4">
        <Alert tone="blue">{DISCLAIMER}</Alert>
      </div>
      <Section title="أعراض تستدعي التوقف فورًا">
        <RedFlagList />
        <a href="tel:123" className="btn-danger mt-3 w-full">
          اتصال بالإسعاف (123 - مصر)
        </a>
      </Section>
      <Section title="تذكيرات حسب حالتك المسجلة">
        {blocks.length === 0 && <p className="text-sm text-muted">لا توجد حالات مسجلة في الإعدادات.</p>}
        <div className="space-y-3">
          {blocks.map((b) => (
            <div key={b.title} className="card">
              <div className="mb-1 font-bold">{b.title}</div>
              <ul className="list-disc space-y-1 ps-5 text-sm leading-relaxed">
                {b.points.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>
      <Section title="مقياس الجهد (RPE)">
        <div className="card">
          <ul className="space-y-1 text-sm">
            {RPE_SCALE.map((r) => (
              <li key={r.value}>{r.label}</li>
            ))}
          </ul>
        </div>
      </Section>
      <Section title="كيف يتعامل التطبيق مع الألم">
        <div className="card text-sm leading-relaxed">
          تسجيل الألم يُستخدم لتذكيرك بإيقاف الحركة التي تزيد الألم، أو تعديلها بعد التحقق، أو طلب تقييم متخصص. التطبيق لا يغيّر البرنامج تلقائيًا ولا يتخذ قرارات علاجية بناءً على الأعراض.
        </div>
      </Section>
    </div>
  );
}
