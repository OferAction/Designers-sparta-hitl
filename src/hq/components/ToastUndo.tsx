import { useEffect, useRef } from 'react';

interface Props {
  message: string;
  duration?: number;
  onUndo: () => void;
  onExpire: () => void;
}

const R = 10;
const CIRC = 2 * Math.PI * R; // ~62.83

export default function ToastUndo({ message, duration = 10000, onUndo, onExpire }: Props) {
  const ringRef = useRef<SVGCircleElement>(null);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    const start = performance.now();
    let raf: number;

    function tick(now: number) {
      const p = Math.min((now - start) / duration, 1);
      if (ringRef.current) {
        ringRef.current.style.strokeDashoffset = String(-p * CIRC);
      }
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        onExpireRef.current();
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl shadow-2xl bg-popover border border-border">
      <svg
        width="26" height="26" viewBox="0 0 26 26"
        className="flex-shrink-0"
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Track */}
        <circle cx="13" cy="13" r={R} fill="none" stroke="hsl(var(--border))" strokeWidth="2.5" />
        {/* Countdown ring — drains from full to empty */}
        <circle
          ref={ringRef}
          cx="13" cy="13" r={R}
          fill="none"
          stroke="hsl(var(--purple-accent))"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={0}
        />
      </svg>

      <span className="text-sm font-medium whitespace-nowrap text-foreground">
        {message}
      </span>

      <button
        onClick={onUndo}
        className="ml-1 px-3 py-1.5 rounded-xl text-sm font-semibold bg-foreground text-background transition-colors hover:opacity-90"
      >
        Undo
      </button>
    </div>
  );
}
