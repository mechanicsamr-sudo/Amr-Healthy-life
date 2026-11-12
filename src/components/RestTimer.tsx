"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatDuration } from "@/lib/dates";
import { useI18n } from "@/lib/i18n";
import { IconTimer } from "./icons";

// حالة المؤقت تُحفظ في localStorage كوقت انتهاء مطلق، لذا تستمر بعد تحديث الصفحة أو إغلاقها.
const KEY = "restTimer";

interface TimerState {
  endAt: number | null; // يعمل
  remaining: number | null; // متوقف مؤقتًا (ثوانٍ)
  duration: number;
}

function load(): TimerState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { endAt: null, remaining: null, duration: 90 };
}

function save(s: TimerState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
}

function beep() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    [0, 0.35, 0.7].forEach((t) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.25, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.25);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + t);
      o.stop(ctx.currentTime + t + 0.26);
    });
    setTimeout(() => ctx.close(), 1500);
  } catch {}
}

export function useRestTimer(opts: { sound: boolean; vibrate: boolean }) {
  const [state, setState] = useState<TimerState>({ endAt: null, remaining: null, duration: 90 });
  const [now, setNow] = useState(() => Date.now());
  const firedFor = useRef<number | null>(null);

  useEffect(() => {
    setState(load());
  }, []);

  const update = useCallback((s: TimerState) => {
    setState(s);
    save(s);
  }, []);

  useEffect(() => {
    if (!state.endAt) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [state.endAt]);

  const secondsLeft = state.endAt ? Math.max(0, Math.ceil((state.endAt - now) / 1000)) : state.remaining;
  const running = !!state.endAt && secondsLeft! > 0;
  const finished = !!state.endAt && secondsLeft === 0;

  useEffect(() => {
    if (finished && state.endAt && firedFor.current !== state.endAt) {
      firedFor.current = state.endAt;
      if (opts.sound) beep();
      if (opts.vibrate && "vibrate" in navigator) navigator.vibrate([300, 150, 300]);
    }
  }, [finished, state.endAt, opts.sound, opts.vibrate]);

  return {
    secondsLeft,
    running,
    finished,
    paused: !state.endAt && state.remaining != null,
    duration: state.duration,
    start: (sec: number) => {
      firedFor.current = null;
      setNow(Date.now());
      update({ endAt: Date.now() + sec * 1000, remaining: null, duration: sec });
    },
    adjust: (delta: number) => {
      if (state.endAt) update({ ...state, endAt: Math.max(Date.now(), state.endAt + delta * 1000), duration: Math.max(0, state.duration + delta) });
      else if (state.remaining != null) update({ ...state, remaining: Math.max(0, state.remaining + delta) });
    },
    pause: () => {
      if (state.endAt) update({ endAt: null, remaining: Math.max(0, Math.ceil((state.endAt - Date.now()) / 1000)), duration: state.duration });
    },
    resume: () => {
      if (state.remaining != null) {
        firedFor.current = null;
        setNow(Date.now());
        update({ endAt: Date.now() + state.remaining * 1000, remaining: null, duration: state.duration });
      }
    },
    stop: () => update({ endAt: null, remaining: null, duration: state.duration }),
  };
}

export type RestTimerApi = ReturnType<typeof useRestTimer>;

export default function RestTimerBar({ timer, defaultSec }: { timer: RestTimerApi; defaultSec: number }) {
  const { L } = useI18n();
  const active = timer.running || timer.paused || timer.finished;
  return (
    <div
      className={`no-print fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 mx-auto max-w-xl border-t px-3 py-2 ${
        timer.finished ? "border-transparent" : "border-base"
      }`}
      style={timer.finished ? { background: "rgb(var(--go))", color: "rgb(var(--on-go))" } : { background: "rgb(var(--surface) / 0.96)" }}
      data-testid="rest-timer"
    >
      <div className="flex items-center gap-2">
        <IconTimer size={22} />
        <div className="ltr min-w-[4.5rem] text-center text-2xl font-bold tabular-nums" data-testid="rest-remaining" aria-live="polite">
          {active ? formatDuration(timer.secondsLeft ?? 0) : formatDuration(defaultSec)}
        </div>
        {timer.finished && <span className="text-sm font-bold">{L("انتهت الراحة!", "Rest over!")}</span>}
        <div className="ms-auto flex gap-1">
          {active ? (
            <>
              <button className="btn-secondary min-h-11 px-3 text-sm" onClick={() => timer.adjust(-15)} aria-label={L("إنقاص 15 ثانية", "Minus 15 seconds")}>
                −15
              </button>
              <button className="btn-secondary min-h-11 px-3 text-sm" onClick={() => timer.adjust(15)} aria-label={L("زيادة 15 ثانية", "Plus 15 seconds")}>
                +15
              </button>
              {timer.running ? (
                <button className="btn-secondary min-h-11 px-3 text-sm" onClick={timer.pause}>
                  {L("إيقاف مؤقت", "Pause")}
                </button>
              ) : timer.paused ? (
                <button className="btn-secondary min-h-11 px-3 text-sm" onClick={timer.resume}>
                  {L("استئناف", "Resume")}
                </button>
              ) : null}
              <button className="btn-secondary min-h-11 px-3 text-sm" onClick={timer.stop}>
                {L("إنهاء", "End")}
              </button>
            </>
          ) : (
            <button className="btn-secondary min-h-11 px-4 text-sm" onClick={() => timer.start(defaultSec)}>
              {L("ابدأ الراحة", "Start rest")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
