"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PlayIcon } from "@/components/ExerciseMedia";
import { IconAlert } from "@/components/icons";
import { Alert, Badge, Loading, PageHeader, ProgressBar, Ring } from "@/components/ui";
import { WARMUP_BY_SLOT, WARMUP_MAP, type WarmupMove } from "@/data/warmup";
import { db } from "@/lib/db";
import { useSchedule, useSearchParam } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { mediaFor, ytEmbed } from "@/lib/media";
import { RigSvg } from "@/components/rig/Rig";
import { TEMPLATES } from "@/lib/rigMap";
import { pickCurrentSession } from "@/lib/schedule";
import { saveWorkout, startOrResumeWorkout } from "@/lib/workout";

/** صورة الحركة: رسم متحرك لشخصية راجل (يعمل بدون إنترنت)، والفيديو اختياري لو موجود */
function MoveMedia({ move, big = false }: { move: WarmupMove; big?: boolean }) {
  const { L, pick } = useI18n();
  const v = mediaFor(move.id).video;
  const tpl = TEMPLATES[move.id];
  const [play, setPlay] = useState(false);
  const h = big ? 230 : 110;
  if (v && play && big)
    return (
      <div className="relative overflow-hidden rounded-[22px] bg-black" style={{ height: h }}>
        <iframe title={pick(move.name)} src={ytEmbed(v.id)} className="absolute inset-0 h-full w-full" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
      </div>
    );
  return (
    <div className="relative overflow-hidden rounded-[22px] bg-[#11161d]" style={{ height: h }} data-testid="warmup-animation">
      {tpl ? <RigSvg tpl={tpl} k={big ? undefined : 0.3} label={pick(move.name)} className="h-full" /> : <div className="hero absolute inset-0" />}
      {big && <span className="absolute start-2 top-2 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white">🎬 {L("رسم متحرك", "Animated")}</span>}
      {v && big && (
        <button
          className="absolute bottom-2 end-2 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-black shadow-lg"
          onClick={() => setPlay(true)}
          aria-label={L("تشغيل فيديو المدرب", "Play coach video")}
        >
          <PlayIcon size={14} /> {L("فيديو", "Video")}
        </button>
      )}
    </div>
  );
}

export default function WarmupPage() {
  const router = useRouter();
  const sessionParam = useSearchParam("session");
  const { schedule, loaded, today } = useSchedule();
  const { L, lang, pick, dir } = useI18n();
  const target = useMemo(() => (!loaded ? undefined : sessionParam ? schedule.find((s) => s.session.id === sessionParam) : pickCurrentSession(schedule, today)), [loaded, schedule, sessionParam, today]);
  const moves = useMemo(() => {
    const ids = target?.session.warmup.moves ?? WARMUP_BY_SLOT[target?.session.slot ?? "A"];
    return ids.map((id) => WARMUP_MAP[id]).filter(Boolean);
  }, [target]);
  const [idx, setIdx] = useState<number | null>(null);
  const [left, setLeft] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setLeft((s) => (s == null ? s : Math.max(0, s - 1))), 1000);
    return () => clearInterval(id);
  }, [running]);
  useEffect(() => {
    if (left === 0 && running) {
      setRunning(false);
      if ("vibrate" in navigator) navigator.vibrate(200);
    }
  }, [left, running]);

  if (!loaded) return <Loading />;

  const completeWarmup = async () => {
    if (target) {
      const w = await startOrResumeWorkout(target.session, target.date);
      await saveWorkout({ ...w, warmupDone: true, currentIndex: Math.max(1, w.currentIndex) });
      router.push(`/workout/?session=${target.session.id}`);
    } else router.push("/");
  };

  const openMove = (i: number) => {
    setIdx(i);
    setLeft(moves[i].seconds);
    setRunning(false);
    window.scrollTo({ top: 0 });
  };

  if (idx !== null) {
    const m = moves[idx];
    const isLast = idx === moves.length - 1;
    return (
      <div data-testid="warmup-step">
        <div className="mb-2 flex items-center justify-between text-sm text-muted">
          <span>
            {L("الإحماء", "Warm-up")} · {idx + 1} {L("من", "of")} {moves.length}
          </span>
          <button className="btn-ghost min-h-9 px-2" onClick={() => setIdx(null)} aria-label={L("كل الحركات", "All moves")}>
            ✕
          </button>
        </div>
        <div className="mb-3 flex gap-1">
          {moves.map((_, i) => (
            <span key={i} className="h-1.5 flex-1 rounded-full" style={{ background: i <= idx ? "rgb(var(--accent))" : "rgb(var(--border))" }} />
          ))}
        </div>
        <MoveMedia move={m} big />
        <h1 className="display mt-3 text-3xl" data-testid="warmup-move-name">
          {pick(m.name)}
        </h1>
        <div className={`font-bold text-muted ${lang === "ar" ? "ltr text-start" : ""}`}>{lang === "ar" ? m.name.en : m.name.ar}</div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge tone="accent">{pick(m.area)}</Badge>
          <Badge>{pick(m.dose)}</Badge>
        </div>
        <div className="mt-3 flex items-start gap-3">
          <div className="card flex-1 p-3">
            <div className="mb-1 font-bold">{L("الطريقة", "How")}</div>
            <ol className="list-decimal space-y-1 ps-5 text-sm">
              {(lang === "en" ? m.steps.en : m.steps.ar).map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>
          <button
            className="flex flex-col items-center gap-1"
            onClick={() => {
              if (left === 0) setLeft(m.seconds);
              setRunning((r) => !r);
            }}
            aria-label={running ? L("إيقاف التايمر", "Pause timer") : L("ابدأ التايمر", "Start timer")}
            data-testid="warmup-timer"
          >
            <Ring pct={left == null ? 0 : ((m.seconds - left) / m.seconds) * 100} size={84} stroke={8} label={`${left ?? m.seconds}s`} />
            <span className="text-xs font-bold text-accent">{running ? L("إيقاف", "Pause") : L("ابدأ", "Start")}</span>
          </button>
        </div>
        <div className="mt-3 space-y-2">
          {m.mistakes.map((x, i) => (
            <div key={i} className="rounded-2xl bg-red-500/10 px-3 py-2 text-sm">
              <b className="text-red-700 dark:text-red-300">✕ {pick(x.title)}</b> — {pick(x.why)} <b className="text-green-700 dark:text-green-300">✓ {pick(x.fix)}</b>
            </div>
          ))}
          {m.safety && (
            <Alert tone="amber" icon={<IconAlert size={16} />}>
              {pick(m.safety)}
            </Alert>
          )}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button className="btn-secondary min-h-14" disabled={idx === 0} onClick={() => openMove(idx - 1)}>
            {dir === "rtl" ? "→" : "←"} {L("السابق", "Previous")}
          </button>
          {isLast ? (
            <button className="btn-go min-h-14" onClick={completeWarmup} data-testid="complete-warmup">
              ✓ {L("تم الإحماء", "Complete Warm-up")}
            </button>
          ) : (
            <button
              className="btn-primary min-h-14"
              onClick={() => {
                setDone((d) => new Set(d).add(idx));
                openMove(idx + 1);
              }}
              data-testid="warmup-next"
            >
              {L("التالي", "Next")} {dir === "rtl" ? "←" : "→"}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        display
        title={L("إحماء آمن", "Safe warm-up")}
        back={target ? `/workout/?session=${target.session.id}` : "/"}
        subtitle={L("مناسب لخشونة الركبة وألم الظهر · بدون قفز ولا ثني ركبة عميق · 8 دقائق", "Suited to knee OA and back pain · no jumping or deep knee bends · 8 minutes")}
      />
      <ProgressBar value={(done.size / moves.length) * 100} label={L("تقدم الإحماء", "Warm-up progress")} />
      <div className="mt-3 grid grid-cols-2 gap-2" data-testid="warmup-grid">
        {moves.map((m, i) => (
          <button key={m.id} className="card overflow-hidden p-0 text-start" onClick={() => openMove(i)} data-testid="warmup-move">
            <MoveMedia move={m} />
            <div className="p-2">
              <div className="flex items-center justify-between gap-1">
                <b className="text-sm">
                  {i + 1}. {pick(m.name)}
                </b>
                {done.has(i) && <span className="text-accent">✓</span>}
              </div>
              <div className={`text-[11px] font-bold uppercase text-muted ${lang === "ar" ? "ltr text-start" : ""}`}>{lang === "ar" ? m.name.en : m.name.ar}</div>
              <div className="mt-1 text-[11px] text-muted">
                {pick(m.dose)} · {pick(m.area)}
              </div>
            </div>
          </button>
        ))}
      </div>
      <div className="mt-3">
        <Alert tone="blue">{L("لو أي حركة سببت ألم، تخطاها وكمّل الباقي.", "If any move causes pain, skip it and continue with the rest.")}</Alert>
      </div>
      <button className="btn-primary mt-3 min-h-14 w-full text-lg" onClick={() => openMove(0)} data-testid="start-warmup">
        {L("ابدأ الإحماء", "Start warm-up")}
      </button>
      <button className="btn-go mt-2 w-full" onClick={completeWarmup} data-testid="complete-warmup">
        ✓ {L("تم الإحماء – Complete Warm-up", "Complete Warm-up – تم الإحماء")}
      </button>
      <p className="mt-2 text-center text-xs text-muted">{db ? L("الإحماء بيتسجل في حصة اليوم.", "The warm-up is logged on today's session.") : ""}</p>
    </div>
  );
}
