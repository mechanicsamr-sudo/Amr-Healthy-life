"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AlternativesPanel from "@/components/AlternativesPanel";
import { ExerciseThumb } from "@/components/ExerciseMedia";
import { IconSwap } from "@/components/icons";
import { Alert, Badge, Loading, Modal, PageHeader } from "@/components/ui";
import { db } from "@/lib/db";
import { exerciseText } from "@/lib/exerciseText";
import { prescriptionText } from "@/lib/format";
import { useExercises, useSchedule, useSearchParam } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { pickCurrentSession } from "@/lib/schedule";
import { sessionName } from "@/lib/sessionText";
import type { WorkoutLog } from "@/lib/types";
import { saveWorkout, startOrResumeWorkout, substituteInWorkout } from "@/lib/workout";

export default function AlternativesPage() {
  const sessionParam = useSearchParam("session");
  const { schedule, loaded, today, settings } = useSchedule();
  const { map } = useExercises();
  const { L, lang } = useI18n();
  const target = useMemo(() => (!loaded ? undefined : sessionParam ? schedule.find((s) => s.session.id === sessionParam) : pickCurrentSession(schedule, today)), [loaded, schedule, sessionParam, today]);
  const [w, setW] = useState<WorkoutLog | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (!target) return;
    db.workouts
      .where("sessionId")
      .equals(target.session.id)
      .toArray()
      .then((ws) => setW(ws.find((x) => x.status === "in_progress") ?? null));
  }, [target]);

  if (!loaded) return <Loading />;
  if (!target) return <PageHeader title={L("البدائل", "Alternatives")} back="/" subtitle={L("لا توجد حصة حالية.", "No current session.")} />;

  const exercises = target.session.exercises;
  return (
    <div>
      <PageHeader display title={L("البدائل", "Alternatives")} back="/" subtitle={`${sessionName(target.session, lang)}`} />
      <div className="mb-3">
        <Alert tone="blue">{L("اختار التمرين اللي جهازه مش موجود. البديل بيتغير في حصة النهارده بس، والبرنامج الأصلي مش بيتغير.", "Pick the exercise whose machine isn't available. The alternative applies to today's session only; your program stays the same.")}</Alert>
      </div>
      <ul className="space-y-2">
        {exercises.map((pe, i) => {
          const actual = w?.entries[i]?.exerciseId ?? pe.exerciseId;
          const e = map[actual];
          if (!e) return null;
          const t = exerciseText(e, lang);
          return (
            <li key={i} className="card flex items-center gap-3 p-2.5">
              <ExerciseThumb exercise={e} className="h-16 w-16 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-bold">{t.name}</div>
                <div className={`truncate text-xs text-muted ${lang === "ar" ? "ltr text-start" : ""}`}>{t.otherName}</div>
                <div className="text-xs">{prescriptionText(pe, lang)}</div>
                {actual !== pe.exerciseId && <Badge tone="accent">{L("بديل مختار", "Alternative chosen")}</Badge>}
              </div>
              <button className="btn-secondary min-h-10 shrink-0 px-3 text-sm" onClick={() => setOpen(i)} data-testid={`alts-${i}`}>
                <IconSwap size={16} /> {L("البدائل", "Options")}
              </button>
            </li>
          );
        })}
      </ul>
      <Link href={`/workout/?session=${target.session.id}`} className="btn-go mt-4 w-full">
        {L("روح للحصة", "Go to the session")}
      </Link>
      <Modal open={open !== null} onClose={() => setOpen(null)} title={L("مش لاقي الجهاز؟ شوف البدائل", "Machine not available? See alternatives")}>
        {open !== null && map[exercises[open].exerciseId] && (
          <AlternativesPanel
            base={map[exercises[open].exerciseId]}
            currentId={w?.entries[open]?.exerciseId ?? exercises[open].exerciseId}
            settings={settings}
            all={map}
            prescription={exercises[open]}
            severePain={w?.severePain}
            onSelect={async (id, reason) => {
              const cur = w ?? (await startOrResumeWorkout(target.session, target.date));
              const next = await saveWorkout(substituteInWorkout(cur, open, id, reason));
              setW(next);
              setOpen(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}
