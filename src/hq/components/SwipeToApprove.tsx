import { useRef, useState, useEffect } from 'react';
import { ArrowRightIcon as ArrowRight, CheckIcon as Check } from '@phosphor-icons/react';

interface Props {
  onApprove: () => void;
  disabled?: boolean;
}

const TRACK_PADDING = 4;
const THRESHOLD = 0.82; // fraction of track width to trigger

export default function SwipeToApprove({ onApprove, disabled }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [x, setX] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);

  const thumbSize = 40;

  function getMaxX() {
    if (!trackRef.current) return 0;
    return trackRef.current.clientWidth - thumbSize - TRACK_PADDING * 2;
  }

  function onPointerDown(e: React.PointerEvent) {
    if (disabled || confirmed) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    startXRef.current = e.clientX - currentXRef.current;
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const newX = Math.max(0, Math.min(e.clientX - startXRef.current, getMaxX()));
    currentXRef.current = newX;
    setX(newX);
  }

  function onPointerUp() {
    if (!dragging) return;
    setDragging(false);
    const max = getMaxX();
    if (max > 0 && currentXRef.current / max >= THRESHOLD) {
      setConfirmed(true);
      setX(max);
      onApprove();
    } else {
      // spring back
      currentXRef.current = 0;
      setX(0);
    }
  }

  // Reset when disabled changes (e.g. comment cleared)
  useEffect(() => {
    if (disabled) {
      setConfirmed(false);
      currentXRef.current = 0;
      setX(0);
    }
  }, [disabled]);

  const max = trackRef.current ? getMaxX() : 1;
  const progress = max > 0 ? Math.min(x / max, 1) : 0;

  return (
    <div
      ref={trackRef}
      className="relative flex items-center rounded-xl overflow-hidden select-none"
      style={{
        height: thumbSize + TRACK_PADDING * 2,
        background: confirmed
          ? 'hsl(var(--purple-accent))'
          : `linear-gradient(to right, hsl(var(--purple-accent) / ${0.15 + progress * 0.85}) ${progress * 100}%, hsl(var(--purple-accent) / 0.08) ${progress * 100}%)`,
        border: '1px solid hsl(var(--purple-accent) / 0.4)',
        opacity: disabled ? 0.35 : 1,
        pointerEvents: disabled ? 'none' : undefined,
        padding: TRACK_PADDING,
        transition: dragging ? undefined : 'background 0.3s',
      }}
    >
      {/* Label */}
      <span
        className="absolute inset-0 flex items-center justify-center text-[13px] font-semibold pointer-events-none"
        style={{
          color: confirmed ? 'hsl(var(--purple-accent-foreground))' : 'hsl(var(--foreground))',
          opacity: confirmed ? 1 : 1 - progress * 1.5,
          transition: dragging ? undefined : 'opacity 0.3s, color 0.3s',
        }}
      >
        {confirmed ? 'Approved' : 'Swipe to approve →'}
      </span>

      {/* Thumb */}
      {!confirmed && (
        <div
          ref={thumbRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="absolute flex items-center justify-center rounded-lg cursor-grab active:cursor-grabbing touch-none z-10"
          style={{
            width: thumbSize,
            height: thumbSize,
            left: TRACK_PADDING + x,
            background: 'hsl(var(--purple-accent))',
            color: 'hsl(var(--purple-accent-foreground))',
            transition: dragging ? undefined : 'left 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            boxShadow: dragging ? '0 4px 16px hsl(var(--purple-accent) / 0.4)' : '0 2px 8px hsl(var(--purple-accent) / 0.25)',
          }}
        >
          <ArrowRight size={18} weight="bold" />
        </div>
      )}

      {/* Confirmed checkmark */}
      {confirmed && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Check size={20} weight="bold" style={{ color: 'hsl(var(--purple-accent-foreground))' }} />
        </div>
      )}
    </div>
  );
}
