import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { ReviewRequest, ReviewStatus, WorkflowEnvironment } from '@/hq/types';
import StatusBadge from './StatusBadge';
import { ArrowUpIcon as ArrowUp, ArrowDownIcon as ArrowDown, ArrowsDownUpIcon as ArrowUpDown } from "@phosphor-icons/react";
import { useHQTheme } from '@/hq/context';
import { Badge } from '@/components/ui/badge';
import { getReviewContent, hasReviewContent } from '@/hq/reviewContent';

export interface ColOverrides {
  /** Override label for the 'reason' column. Set to null to hide it. */
  reasonLabel?: string | null;
  /** Override label for the 'sent' column */
  sentLabel?: string;
}

interface Props {
  reviews: ReviewRequest[];
  selectedId: string | null;
  onSelect: (review: ReviewRequest) => void;
  onFilteredChange?: (rows: ReviewRequest[]) => void;
  compact?: boolean;
  colOverrides?: ColOverrides;
}

const MIN_COL_WIDTH = 60;

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  if (isNaN(d.getTime())) return ts;
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

type Col = { key: string; label: string; defaultWidth: number };

const BASE_COLS_DEFAULT: Col[] = [
  { key: 'status',   label: 'Status',        defaultWidth: 130 },
  { key: 'reason',   label: 'Description',   defaultWidth: 130 },
  { key: 'sent',     label: 'Sent to review', defaultWidth: 130 },
  { key: 'reqId',    label: 'Event ID',      defaultWidth: 130 },
  { key: 'price',    label: 'Price',         defaultWidth: 100 },
];

const COL_SORT_KEY: Record<string, (r: ReviewRequest) => string> = {
  status:   (r) => r.status,
  reason:   (r) => r.reason,
  sent:     (r) => r.sentToReview,
  reqId:    (r) => r.reqId,
  price:    (r) => String(r.invoice?.price ?? 0).padStart(12, '0'),
};

const STATUS_OPTIONS: { value: ReviewStatus; label: string }[] = [
  { value: 'Pending',    label: 'Pending' },
  { value: 'Approved',   label: 'Approved' },
  { value: 'Declined',   label: 'Declined' },
  { value: 'Timed out',  label: 'Timed out' },
  { value: 'Handoff',    label: 'Handoff' },
  { value: 'Review',            label: 'Review' },
  { value: 'Sent',              label: 'Sent' },
  { value: 'Sent to AP',        label: 'Sent to AP' },
  { value: 'Sent to Requester', label: 'Sent to Requester' },
  { value: 'Submitted',         label: 'Submitted' },
  { value: 'Discarded',         label: 'Discarded' },
];

function distributeWidths(containerWidth: number, defaultWidths: number[], manualWidths: Map<number, number>) {
  if (defaultWidths.length === 0) return [];

  const resolved = Array<number>(defaultWidths.length).fill(MIN_COL_WIDTH);
  const autoIndices: number[] = [];
  let manualTotal = 0;

  defaultWidths.forEach((_, index) => {
    const manualWidth = manualWidths.get(index);
    if (manualWidth != null) {
      const clamped = Math.max(MIN_COL_WIDTH, manualWidth);
      resolved[index] = clamped;
      manualTotal += clamped;
      return;
    }

    resolved[index] = MIN_COL_WIDTH;
    autoIndices.push(index);
  });

  if (autoIndices.length === 0) return resolved;

  const minimumAutoTotal = autoIndices.length * MIN_COL_WIDTH;
  const targetAutoTotal = Math.max(containerWidth - manualTotal, minimumAutoTotal);
  let remaining = targetAutoTotal - minimumAutoTotal;
  const extraBasis = autoIndices.map((index) => Math.max(defaultWidths[index] - MIN_COL_WIDTH, 1));
  const totalBasis = extraBasis.reduce((sum, value) => sum + value, 0);

  autoIndices.forEach((index, order) => {
    if (remaining <= 0) return;
    const share = order === autoIndices.length - 1
      ? remaining
      : Math.min(remaining, Math.round((extraBasis[order] / totalBasis) * (targetAutoTotal - minimumAutoTotal)));
    resolved[index] += share;
    remaining -= share;
  });

  return resolved;
}

function groupByWorkflowAndEnv(reviews: ReviewRequest[]) {
  const map = new Map<string, { name: string; env: WorkflowEnvironment; items: ReviewRequest[] }>();
  for (const r of reviews) {
    const key = `${r.workflowId}-${r.environment}`;
    if (!map.has(key)) map.set(key, { name: r.workflowName, env: r.environment, items: [] });
    map.get(key)!.items.push(r);
  }
  return Array.from(map.entries()).map(([id, g]) => ({ id, ...g }));
}

function EnvBadge({ env }: { env: WorkflowEnvironment }) {
  const { theme } = useHQTheme();
  const light = theme === 'light';

  return env === 'live' ? (
    <Badge variant="outline" className={`rounded-md gap-1 text-[10px] px-1.5 py-0 ${light ? 'text-emerald-700 border-emerald-200' : 'text-emerald-400 border-emerald-500/25'}`}>
      <span className={`w-1 h-1 rounded-full flex-shrink-0 ${light ? 'bg-emerald-600' : 'bg-emerald-400'}`} />
      Live
    </Badge>
  ) : (
    <Badge variant="outline" className={`rounded-md gap-1 text-[10px] px-1.5 py-0 ${light ? 'text-amber-700 border-amber-200' : 'text-amber-400 border-amber-500/25'}`}>
      <span className={`w-1 h-1 rounded-full flex-shrink-0 ${light ? 'bg-amber-500' : 'bg-amber-400'}`} />
      Test
    </Badge>
  );
}

// suppress unused import warning
void formatTimestamp;

export default function HumanReviewTable({ reviews, selectedId, onSelect, onFilteredChange, compact = false, colOverrides }: Props) {
  useHQTheme();
  const COLS = useMemo<Col[]>(() => {
    const base: Col[] = BASE_COLS_DEFAULT
      .filter((c) => !(c.key === 'reason' && colOverrides?.reasonLabel === null))
      .map((c) => {
        if (c.key === 'reason' && colOverrides?.reasonLabel != null) return { ...c, label: colOverrides.reasonLabel };
        if (c.key === 'sent'   && colOverrides?.sentLabel   != null) return { ...c, label: colOverrides.sentLabel };
        return c;
      });
    return base;
  }, [colOverrides]);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [manualWidths, setManualWidths] = useState<Map<number, number>>(new Map());
  const [activeId, setActiveId] = useState<string | null>(selectedId);
  const lastKeyNavTime = useRef(0);
  const defaultWidths = useMemo(() => COLS.map((c) => c.defaultWidth), [COLS]);
  const widths = useMemo(
    () => distributeWidths(containerWidth, defaultWidths, manualWidths),
    [containerWidth, defaultWidths, manualWidths],
  );

  useEffect(() => {
    // Skip prop sync within 100ms of keyboard navigation to prevent flicker
    if (Date.now() - lastKeyNavTime.current < 100) return;
    setActiveId(selectedId);
  }, [selectedId]);

  useEffect(() => {
    setManualWidths((prev) => {
      const next = new Map<number, number>();
      prev.forEach((value, key) => {
        if (key < COLS.length) next.set(key, value);
      });
      return next;
    });
  }, [COLS.length]);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateWidth = () => {
      setContainerWidth(containerRef.current?.clientWidth ?? 0);
    };

    updateWidth();

    const observer = new ResizeObserver(() => updateWidth());
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);
  const [envFilter] = useState<string[]>(['live', 'test']);
  const [statusFilter] = useState<string[]>(STATUS_OPTIONS.map((o) => o.value));
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  function handleSort(key: string) {
    if (sortCol === key) {
      if (sortDir === 'asc') {
        setSortDir('desc');
      } else {
        setSortCol(null);
      }
    } else {
      setSortCol(key);
      setSortDir('asc');
    }
  }

  const filtered = useMemo(() => {
    const base = reviews.filter(
      (r) => envFilter.includes(r.environment) && statusFilter.includes(r.status),
    );
    if (!sortCol || !COL_SORT_KEY[sortCol]) return base;
    const getter = COL_SORT_KEY[sortCol];
    return [...base].sort((a, b) => {
      const cmp = getter(a).localeCompare(getter(b));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [reviews, envFilter, statusFilter, sortCol, sortDir]);

  const groups = useMemo(() => groupByWorkflowAndEnv(filtered), [filtered]);

  useEffect(() => {
    onFilteredChange?.(groups.flatMap((g) => g.items));
  }, [groups, onFilteredChange]);

  const gridTemplate = useMemo(() => {
    if (containerWidth === 0) return widths.map(() => '1fr').join(' ');
    const STATUS_WIDTH = 130;
    const remaining = containerWidth - STATUS_WIDTH;
    const nonStatusCount = widths.length - 1;
    return widths.map((w, i) => {
      if (i === 0) return `${STATUS_WIDTH}px`;
      if (manualWidths.has(i)) return `${w}px`;
      return `${Math.max(MIN_COL_WIDTH, Math.floor(remaining / nonStatusCount))}px`;
    }).join(' ');
  }, [widths, manualWidths, containerWidth]);

  useEffect(() => {
    if (!activeId || !scrollRef.current) return;
    const row = scrollRef.current.querySelector(`[data-row-id="${activeId}"]`);
    row?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  }, [activeId]);

  const navRef = useRef({ groups, activeId, onSelect, setActiveId });
  navRef.current = { groups, activeId, onSelect, setActiveId };

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      // Only navigate when focus is on the table scroll container (or nothing specific is focused)
      const scrollEl = scrollRef.current;
      if (scrollEl && target !== document.body && !scrollEl.contains(target) && target !== scrollEl) return;
      e.preventDefault();
      const { groups, activeId, onSelect, setActiveId } = navRef.current;
      const items = groups.flatMap((g) => g.items);
      const idx = items.findIndex((r) => r.id === activeId);
      const dir = e.key === 'ArrowDown' ? 1 : -1;
      const nextIdx = idx === -1 ? 0 : Math.max(0, Math.min(items.length - 1, idx + dir));
      const next = items[nextIdx];
      if (next && next.id !== activeId) {
        lastKeyNavTime.current = Date.now();
        setActiveId(next.id);
        onSelect(next);
      }
    }
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, []);

  const startResize = useCallback((colIdx: number, startX: number) => {
    const startPx = widths[colIdx];

    const onMove = (e: MouseEvent) => {
      const newPx = Math.max(MIN_COL_WIDTH, startPx + (e.clientX - startX));
      setManualWidths((prev) => {
        const next = new Map(prev);
        next.set(colIdx, newPx);
        return next;
      });
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [widths]);

  return (
    <div ref={containerRef} className={`flex-1 flex flex-col overflow-hidden ${compact ? 'min-w-0' : 'min-w-[320px] border-t border-l border-b-0 rounded-tl-xl'}`} style={compact ? {} : { borderColor: 'var(--border-subtle)' }}>
      {/* Column headers — hidden in compact mode */}
      {!compact && (
        <div
          className="flex-shrink-0 border-b px-5 py-3"
          style={{ borderColor: 'var(--border-subtle)', display: 'grid', gridTemplateColumns: gridTemplate, width: '100%' }}
        >
        {COLS.map((col, i) => {
          const isActive = sortCol === col.key;
          const Icon = isActive ? (sortDir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
          return (
            <div
              key={col.key}
              onClick={() => handleSort(col.key)}
              className="relative flex items-center gap-1 overflow-hidden cursor-pointer select-none group/col"
            >
              <span
                className={`text-xs text-foreground/50 font-semibold uppercase tracking-widest truncate ${i > 0 ? 'pl-3' : ''} ${i < COLS.length - 1 ? 'pr-3' : ''}`}
              >
                {col.label}
              </span>
              <Icon
                size={11}
                className={`flex-shrink-0 transition-opacity ${
                  isActive ? 'opacity-100 text-blue-400' : 'opacity-0 group-hover/col:opacity-60 text-foreground/80'
                }`}
              />
              {i < COLS.length - 1 && (
                <div
                  onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); startResize(i, e.clientX); }}
                  className="absolute right-0 top-0 bottom-0 w-4 flex items-center justify-center cursor-col-resize group/resize"
                  style={{ transform: 'translateX(50%)' }}
                >
                  <div className="w-px h-5 rounded-full bg-strong group-hover/resize:w-0.5 group-hover/resize:h-full group-hover/resize:bg-blue-400 transition-all duration-150" />
                </div>
              )}
            </div>
          );
        })}
        </div>
      )}

      <div ref={scrollRef} tabIndex={0} className="flex-1 overflow-auto focus:outline-none">
        {/* Rows */}
        {groups.length === 0 ? (
          <div className={`flex flex-col items-center justify-center gap-5 text-center px-8 ${compact ? 'py-10' : 'py-16'}`}>
            <svg width={compact ? 64 : 96} height={compact ? 64 : 96} viewBox="0 0 112 112" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="56" cy="56" r="52" fill="hsl(var(--popover))" />
              <circle cx="56" cy="56" r="52" stroke="hsl(var(--border))" strokeWidth="1" />
              <circle cx="56" cy="56" r="34" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1.5" />
              <path d="M40 56 L50 66 L72 44" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-semibold text-foreground">All caught up</p>
              <p className="text-sm text-foreground/80">No pending reviews assigned to you</p>
            </div>
          </div>
        ) : (
          groups.flatMap((group) => group.items).map((rev) => {
              const reviewLabel = hasReviewContent(rev) ? getReviewContent(rev).tag : rev.reason;
              return (
                <div
                  key={rev.id}
                  data-row-id={rev.id}
                  onClick={() => { onSelect(rev); scrollRef.current?.focus({ preventScroll: true }); }}
                  className={`cursor-pointer border-b ${
                    activeId === rev.id ? 'border-l-4 border-l-purple-accent' : 'hover:bg-muted border-l-4 border-l-transparent'
                  }`}
                  style={{
                    borderBottomColor: 'var(--border-subtle)',
                    ...(activeId === rev.id ? { backgroundColor: 'hsl(var(--general-primary-foreground))' } : {}),
                  }}
                >
                  {compact ? (
                    /* Mobile card-style row */
                    <div className="px-4 py-3.5 flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[15px] font-semibold truncate" style={{ color: 'hsl(var(--foreground) / 0.8)' }}>{reviewLabel}</span>
                        <div className="flex-shrink-0 w-20 flex justify-center">
                          <StatusBadge status={rev.status} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-xs text-foreground/80">
                        <span className="truncate min-w-0">{rev.sentToReview}</span>
                        <span className="flex-shrink-0 w-20 text-center tabular-nums">{rev.reqId}</span>
                        <span className="flex-shrink-0 w-16 text-right tabular-nums">{rev.invoice?.price != null ? `$${rev.invoice.price.toLocaleString('en-US')}` : '—'}</span>
                      </div>
                    </div>
                  ) : (
                    /* Desktop grid row */
                    <div
                      className="px-5 py-4"
                      style={{ display: 'grid', gridTemplateColumns: gridTemplate, width: '100%' }}
                    >
                      <div className="flex items-center overflow-hidden">
                        <StatusBadge status={rev.status} />
                      </div>
                      <div className="flex items-center pl-3 pr-4 overflow-hidden">
                        <span className="text-sm font-semibold truncate" style={{ color: 'hsl(var(--foreground) / 0.8)' }} title={reviewLabel}>{reviewLabel}</span>
                      </div>
                      <div className="flex items-center pl-3 overflow-hidden">
                        <span className="text-sm text-foreground/80 truncate" title={rev.sentToReview}>{rev.sentToReview}</span>
                      </div>
                      <div className="flex items-center pl-3 overflow-hidden">
                        <span className="text-sm text-foreground/80 tabular-nums font-medium truncate" title={rev.reqId}>{rev.reqId}</span>
                      </div>
                      <div className="flex items-center pl-3 overflow-hidden">
                        <span className="text-sm text-foreground/80 tabular-nums font-medium truncate">{rev.invoice?.price != null ? `$${rev.invoice.price.toLocaleString('en-US')}` : '—'}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
          })
        )}
      </div>
    </div>
  );
}
