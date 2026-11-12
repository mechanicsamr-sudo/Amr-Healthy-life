"use client";

import Link from "next/link";
import { useState } from "react";
import { RED_FLAGS, RED_FLAG_ACTION } from "@/lib/health";
import { useI18n } from "@/lib/i18n";
import { IconAlert } from "./icons";
import { Alert, Modal } from "./ui";

export function RedFlagList() {
  const { L, pick } = useI18n();
  return (
    <Alert tone="red" title={L("أوقف التمرين واطلب المساعدة الطبية فورًا عند:", "Stop and get medical help immediately if you have:")} icon={<IconAlert size={18} />}>
      <ul className="list-disc space-y-1 ps-4">
        {RED_FLAGS.map((r, i) => (
          <li key={i}>{pick(r)}</li>
        ))}
      </ul>
      <p className="mt-2 font-bold">{pick(RED_FLAG_ACTION)}</p>
    </Alert>
  );
}

export function RedFlagButton({ onReport, className = "" }: { onReport?: () => void; className?: string }) {
  const [open, setOpen] = useState(false);
  const { L } = useI18n();
  return (
    <>
      <button className={`btn border border-red-400/60 text-red-600 dark:text-red-300 ${className}`} onClick={() => setOpen(true)}>
        <IconAlert size={18} /> {L("أعراض خطيرة؟", "Warning signs?")}
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={L("أعراض تستدعي التوقف", "Symptoms that mean stop")}
        footer={
          <div className="grid gap-2">
            <a href="tel:123" className="btn-danger w-full">
              {L("اتصال بالإسعاف (123 - مصر)", "Call an ambulance (123 – Egypt)")}
            </a>
            {onReport && (
              <button
                className="btn-secondary w-full"
                onClick={() => {
                  onReport();
                  setOpen(false);
                }}
              >
                {L("سجّل إني وقفت الحصة بسبب أعراض", "Log that I stopped because of symptoms")}
              </button>
            )}
          </div>
        }
      >
        <RedFlagList />
        <p className="mt-3 text-sm text-muted">
          {L("التطبيق لا يقيّم الأعراض ولا يشخّصها. لمعلومات أكثر راجع", "The app doesn't assess or diagnose symptoms. For more, see the")}{" "}
          <Link href="/safety/" className="underline">
            {L("صفحة السلامة", "safety page")}
          </Link>
          .
        </p>
      </Modal>
    </>
  );
}
