"use client";

import Link from "next/link";
import { useState } from "react";
import { RED_FLAGS, RED_FLAG_ACTION } from "@/lib/health";
import { IconAlert } from "./icons";
import { Alert, Modal } from "./ui";

export function RedFlagList() {
  return (
    <Alert tone="red" title="أوقف التمرين واطلب المساعدة الطبية فورًا عند:" icon={<IconAlert size={18} />}>
      <ul className="list-disc space-y-1 ps-4">
        {RED_FLAGS.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>
      <p className="mt-2 font-bold">{RED_FLAG_ACTION}</p>
    </Alert>
  );
}

export function RedFlagButton({ onReport, className = "" }: { onReport?: () => void; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className={`btn border border-red-300 text-red-700 dark:border-red-800 dark:text-red-300 ${className}`} onClick={() => setOpen(true)}>
        <IconAlert size={18} /> أعراض خطيرة؟
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="أعراض تستدعي التوقف"
        footer={
          <div className="grid gap-2">
            <a href="tel:123" className="btn-danger w-full">
              اتصال بالإسعاف (123 - مصر)
            </a>
            {onReport && (
              <button
                className="btn-secondary w-full"
                onClick={() => {
                  onReport();
                  setOpen(false);
                }}
              >
                سجّل أنني أوقفت الحصة بسبب أعراض
              </button>
            )}
          </div>
        }
      >
        <RedFlagList />
        <p className="mt-3 text-sm text-muted">
          التطبيق لا يقيّم الأعراض ولا يشخّصها. لمزيد من المعلومات راجع <Link href="/safety/" className="underline">صفحة السلامة</Link>.
        </p>
      </Modal>
    </>
  );
}
