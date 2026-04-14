import { useState, useRef, useCallback } from 'react';
import { CaretDownIcon } from '@phosphor-icons/react';
import { InfoIcon } from 'lucide-react';
import { WorkflowOverview, RecentInvoice } from '@/hq/types';
import MiniRunsChart from './MiniRunsChart';
import StatusBadge from './StatusBadge';
import AttachmentModal from './AttachmentModal';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useHQTheme } from '@/hq/context';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ConfidenceIcon from '@/assets/confidence.svg?react';
import CoverageIcon from '@/assets/kpi-coverage.svg?react';
import SamplesIcon from '@/assets/kpi-samples.svg?react';
import TimeIcon from '@/assets/kpi-time.svg?react';
import RiskIcon from '@/assets/kpi-risk.svg?react';
import SapIcon from '@/assets/sap.svg?react';
import OutlookIcon from '@/assets/nodes/Outlook.svg?react';

interface Props {
  workflow: WorkflowOverview;
  defaultExpanded?: boolean;
  isMobile?: boolean;
}

function useDragReorder(count: number) {
  const [order, setOrder] = useState<number[]>(() => Array.from({ length: count }, (_, i) => i));
  const fromRef = useRef<number | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);

  function getProps(pos: number) {
    return {
      draggable: true as const,
      onDragStart: (e: React.DragEvent) => { fromRef.current = pos; setDragging(pos); e.dataTransfer.effectAllowed = 'move'; },
      onDragOver:  (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setOver(pos); },
      onDragLeave: (e: React.DragEvent) => { if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) setOver(null); },
      onDrop: (e: React.DragEvent) => {
        e.preventDefault();
        const from = fromRef.current;
        if (from !== null && from !== pos) {
          setOrder(prev => { const next = [...prev]; const [moved] = next.splice(from, 1); next.splice(pos, 0, moved); return next; });
        }
        fromRef.current = null; setDragging(null); setOver(null);
      },
      onDragEnd: () => { fromRef.current = null; setDragging(null); setOver(null); },
    };
  }

  return { order, dragging, over, getProps };
}

function Row2({ workflow, trackBg }: { workflow: WorkflowOverview; trackBg: string }) {
  const s = workflow.secondaryStats;
  const rowRef = useRef<HTMLDivElement>(null);
  // leftPct = percentage of total row width used by the left column (chart + HITL stacked)
  const [leftPct, setLeftPct] = useState(42);
  const [dragging, setDragging] = useState(false);
  const [handleHover, setHandleHover] = useState(false);

  const onHandleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const container = rowRef.current;
    if (!container) return;
    setDragging(true);
    const startX = e.clientX;
    const startPct = leftPct;
    const totalW = container.getBoundingClientRect().width;
    const onMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startX;
      setLeftPct(Math.min(72, Math.max(22, startPct + (delta / totalW) * 100)));
    };
    const onUp = () => {
      setDragging(false);
      setHandleHover(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [leftPct]);

  return (
    <div ref={rowRef} className="flex items-stretch h-[280px]" style={{ userSelect: dragging ? 'none' : undefined }}>

      {/* Left column: Chart (top) + HITL (bottom) stacked, resizable width */}
      <div className="flex-shrink-0 flex flex-col gap-3 h-full" style={{ width: `${leftPct}%` }}>
        {/* Bar chart */}
        <div className="flex-1 min-h-0">
          <MiniRunsChart data={workflow.runData} />
        </div>
        {/* HITL */}
        <div className="flex-shrink-0 bg-card border border-border rounded-xl px-4 py-3 flex flex-col gap-2">
          <p className="text-xs font-semibold text-foreground/80 uppercase">Human in the Loop</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground leading-none">{s.hitlTriggered.toLocaleString()}</span>
            <span className="text-xs text-foreground/80">triggered</span>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[12px] text-foreground/60">Approved</span>
              <span className="text-[12px] text-foreground/60 tabular-nums">{s.hitlApprovalPct}%</span>
            </div>
            <div className="w-full rounded-full h-1.5" style={{ background: trackBg }}>
              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${s.hitlApprovalPct}%` }} />
            </div>
          </div>
          <p className="text-[12px] text-foreground/60">Avg {s.hitlAvgHours} days to decide</p>
        </div>
      </div>

      {/* Resize handle — 4 px purple line appears only on hover / drag, between the two cards */}
      <div
        className="flex-shrink-0 relative cursor-col-resize"
        style={{ width: 16, marginLeft: -8, marginRight: -8, zIndex: 10 }}
        onMouseDown={onHandleMouseDown}
        onMouseEnter={() => setHandleHover(true)}
        onMouseLeave={() => { if (!dragging) setHandleHover(false); }}
      >
        <div
          className="absolute inset-y-0 rounded-full transition-opacity duration-150"
          style={{
            width: 4,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#a855f7',
            opacity: handleHover || dragging ? 1 : 0,
          }}
        />
      </div>

      {/* Right column: Recent Runs — takes remaining width */}
      <div className="flex-1 min-w-0 h-full bg-card border border-border rounded-xl overflow-hidden flex flex-col">
        {/* Title */}
        <div className="px-3 pt-2.5 pb-1.5 flex-shrink-0">
          <span className="text-xs font-semibold text-foreground/80 uppercase tracking-wide">Recent Runs</span>
        </div>
        {/* Column headers */}
        <div className="grid grid-cols-3 px-3 py-1.5 border-y border-border/50 flex-shrink-0">
          <span className="text-[11px] text-foreground/50 uppercase tracking-wide">Time</span>
          <span className="text-[11px] text-foreground/50 uppercase tracking-wide text-center">Subject Reference</span>
          <span className="text-[11px] text-foreground/50 uppercase tracking-wide text-right">Status</span>
        </div>
        {/* Rows */}
        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {workflow.recentRuns.map(run => (
            <div key={run.id} className="grid grid-cols-3 items-center px-3 py-2">
              <span className="text-xs text-foreground/80">{run.timestamp}</span>
              <span className="text-xs text-foreground/80 text-center">{run.subjectReference ?? '—'}</span>
              <div className="flex justify-end">
                <StatusBadge status={run.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function WorkflowSection({ workflow, defaultExpanded = true, isMobile = false }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [lightbox, setLightbox] = useState<RecentInvoice | null>(null);
  const chipDrag = useDragReorder(5);
  const navigate = useNavigate();
  const { theme } = useHQTheme();
  const isDark = theme === 'dark';
  const trackBg = isDark ? '#1c2133' : '#e8edf8';

  const chips = [
    { icon: ConfidenceIcon, label: 'Confidence', value: workflow.kpis.confidence,       color: 'text-blue-400'    },
    { icon: CoverageIcon,   label: 'Coverage',   value: workflow.kpis.coverage,         color: 'text-emerald-400' },
    { icon: SamplesIcon,    label: 'Samples',    value: workflow.kpis.samplesProcessed,  color: 'text-purple-400'  },
    { icon: TimeIcon,       label: 'Avg Run',    value: workflow.kpis.avgRunTime,        color: 'text-amber-400'   },
    { icon: RiskIcon,       label: 'Risk',       value: workflow.kpis.riskControl,       color: 'text-red-400'     },
  ];

  const s = workflow.secondaryStats;

  const row3Drag = useDragReorder(3);

  return (
    <div className="flex flex-col">
      {/* Header strip */}
      <div
        className="sticky top-0 z-10 flex items-center gap-2.5 py-2 border-b border-border cursor-pointer select-none bg-background"
        onClick={() => setExpanded(e => !e)}
      >
        <CaretDownIcon
          size={14}
          className={cn(
            'text-foreground/50 flex-shrink-0 transition-transform duration-200',
            expanded ? 'rotate-0' : '-rotate-90'
          )}
        />
        <span className="text-sm font-semibold text-foreground">{workflow.name}</span>
        <span className={cn(
          'text-xs px-2 py-0.5 rounded-full border font-medium flex-shrink-0',
          workflow.environment === 'live'
            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
            : 'bg-amber-500/15 text-amber-400 border-amber-500/25'
        )}>
          {workflow.environment === 'live' ? 'Live' : 'Test'}
        </span>
        {workflow.pendingReviews > 0 && (
          <span
            className="text-xs text-purple-accent hover:underline flex-shrink-0 cursor-pointer"
            onClick={e => { e.stopPropagation(); navigate(`/hq/reviews?workflow=${workflow.id}`); }}
          >
            {workflow.pendingReviews} pending reviews ↗
          </span>
        )}
        <span className="flex-1" />
      </div>

      {/* Collapsible content */}
      <div
        className="overflow-hidden transition-all duration-250 ease-in-out"
        style={{ maxHeight: expanded ? '800px' : '0px' }}
      >
        <div className={cn('flex flex-col gap-3', isMobile ? 'pt-3 pb-1' : 'pt-3 pb-2')}>

          {/* Row 1: KPI chip bar — double height, stacked label+value per chip */}
          <div className={cn(
            'flex bg-[hsl(var(--sidebar-background))] rounded-xl border border-sidebar-border',
            isMobile ? 'overflow-x-auto gap-0 h-16 scrollbar-none' : 'overflow-hidden h-20'
          )}>
            {(isMobile ? chips : chipDrag.order.map(i => chips[i])).map(({ icon: Icon, label, value, color }, pos) => {
              const isDragging = !isMobile && chipDrag.dragging === pos;
              const isOver     = !isMobile && chipDrag.over === pos && chipDrag.dragging !== pos;
              return (
                <div
                  key={label}
                  className={cn(
                    'flex flex-col justify-center px-4 h-full transition-opacity duration-150',
                    isMobile ? 'flex-none gap-0.5 border-r border-border last:border-r-0' : 'flex-1 gap-1 cursor-grab active:cursor-grabbing select-none',
                    !isMobile && pos < chips.length - 1 ? 'border-r border-border' : '',
                    isDragging ? 'opacity-40' : '',
                    isOver ? 'bg-purple-500/5' : '',
                  )}
                  {...(!isMobile ? chipDrag.getProps(pos) : {})}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={cn('flex-shrink-0', color)} style={{ height: '18px', width: 'auto' }} />
                    <span className="text-xs font-semibold text-foreground/50 uppercase tracking-wide">{label}</span>
                  </div>
                  <span className={cn('font-bold text-foreground leading-none', isMobile ? 'text-base' : 'text-2xl')}>{value}</span>
                </div>
              );
            })}
          </div>

          {/* Row 2: Chart · HITL | resize handle | Recent runs */}
          {!isMobile && <Row2 workflow={workflow} trackBg={trackBg} />}

          {/* Mobile: chart + HITL + recent runs */}
          {isMobile && (
            <div className="flex flex-col gap-3">
              <div className="h-[120px]">
                <MiniRunsChart data={workflow.runData} />
              </div>
              <div className="bg-card border border-border rounded-xl px-4 py-3 flex flex-col gap-2">
                <p className="text-xs font-semibold text-foreground/80 uppercase">Human in the Loop</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-foreground leading-none">{s.hitlTriggered.toLocaleString()}</span>
                  <span className="text-xs text-foreground/80">triggered</span>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[12px] text-foreground/60">Approved</span>
                    <span className="text-[12px] text-foreground/60 tabular-nums">{s.hitlApprovalPct}%</span>
                  </div>
                  <div className="w-full rounded-full h-1.5" style={{ background: trackBg }}>
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${s.hitlApprovalPct}%` }} />
                  </div>
                </div>
                <p className="text-[12px] text-foreground/60">Avg {s.hitlAvgHours} days to decide</p>
              </div>
            </div>
          )}

          {/* Row 3: Data sources · Time saved · Token usage — draggable */}
          {!isMobile && (() => {
            const row3Cards = [
              /* 0 — Data sources */
              <div className="bg-card border border-border rounded-xl px-4 py-3 h-full flex flex-col gap-2">
                <p className="text-xs font-semibold text-foreground/80 uppercase">Data sources</p>
                <div className="flex flex-col gap-2 mt-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-8 flex items-center justify-center flex-shrink-0">
                      <SapIcon style={{ width: 32, height: 'auto' }} />
                    </span>
                    <span className="text-xs text-foreground/80">Customer Success</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-8 flex items-center justify-center flex-shrink-0">
                      <OutlookIcon style={{ width: 16, height: 16 }} />
                    </span>
                    <span className="text-xs text-foreground/80">Legal</span>
                  </div>
                </div>
              </div>,
              /* 1 — Time saved */
              <div className="bg-card border border-border rounded-xl px-4 py-3 h-full flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <p className="text-xs font-semibold text-foreground/80 uppercase">Time Saved</p>
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-foreground/60 hover:text-foreground/80 transition-colors flex-shrink-0 mt-px">
                          <InfoIcon size={13} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[260px] text-[12px] leading-snug">
                        <p className="font-semibold mb-1">How it's calculated</p>
                        <p className="text-foreground/80">Time saved = benchmark manual process time minus ActionAI process time</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-foreground leading-none">{s.timeSavedHours.toLocaleString()}</span>
                  <span className="text-xs text-foreground/80">hrs</span>
                  <span className="text-foreground/50 mx-0.5">/</span>
                  <span className="text-lg font-bold text-foreground leading-none">{s.timeSavedDays}</span>
                  <span className="text-xs text-foreground/80">days</span>
                </div>
                <p className="text-[11px] text-foreground/60">(based on provided benchmark of {s.timeSavedDays} days)</p>
              </div>,
              /* 2 — Token usage */
              <div className="bg-card border border-border rounded-xl px-4 py-3 h-full flex flex-col gap-2">
                <p className="text-xs font-semibold text-foreground/80 uppercase">Token usage</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-foreground leading-none">{s.tokenUsage.toLocaleString()}</span>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[12px] text-foreground/60">ActOne</span>
                    <span className="text-[12px] text-foreground/60 tabular-nums">38%</span>
                  </div>
                  <div className="w-full rounded-full h-1" style={{ background: trackBg }}>
                    <div className="h-1 rounded-full" style={{ width: '38%', background: 'linear-gradient(90deg,#5eead4,#3b82f6,#a855f7)' }} />
                  </div>
                </div>
              </div>,
            ];
            return (
              <div className="grid grid-cols-3 gap-3">
                {row3Drag.order.map((origIdx, pos) => {
                  const isDragging = row3Drag.dragging === pos;
                  const isOver     = row3Drag.over === pos && row3Drag.dragging !== pos;
                  return (
                    <div
                      key={origIdx}
                      className={cn('cursor-grab active:cursor-grabbing select-none transition-opacity duration-150', isDragging ? 'opacity-40' : '', isOver ? 'ring-1 ring-purple-500/30 rounded-xl' : '')}
                      {...row3Drag.getProps(pos)}
                    >
                      {row3Cards[origIdx]}
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Mobile row 3 */}
          {isMobile && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card border border-border rounded-xl px-4 py-3 flex flex-col gap-2">
                <p className="text-xs font-semibold text-foreground/80 uppercase">Data sources</p>
                <div className="flex flex-col gap-2 mt-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-8 flex items-center justify-center flex-shrink-0">
                      <SapIcon style={{ width: 32, height: 'auto' }} />
                    </span>
                    <span className="text-xs text-foreground/80">Customer Success</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-8 flex items-center justify-center flex-shrink-0">
                      <OutlookIcon style={{ width: 16, height: 16 }} />
                    </span>
                    <span className="text-xs text-foreground/80">Legal</span>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl px-4 py-3 flex flex-col gap-2">
                <p className="text-xs font-semibold text-foreground/80 uppercase">Time Saved</p>
                <div className="flex items-baseline gap-1 flex-wrap">
                  <span className="text-xl font-bold text-foreground leading-none">{s.timeSavedHours.toLocaleString()}</span>
                  <span className="text-xs text-foreground/80">hrs</span>
                  <span className="text-foreground/50 mx-0.5">/</span>
                  <span className="text-lg font-bold text-foreground leading-none">{s.timeSavedDays}</span>
                  <span className="text-xs text-foreground/80">days</span>
                </div>
                <p className="text-[11px] text-foreground/60">(based on provided benchmark of {s.timeSavedDays} days)</p>
              </div>
              <div className="bg-card border border-border rounded-xl px-4 py-3 flex flex-col gap-2 col-span-2">
                <p className="text-xs font-semibold text-foreground/80 uppercase">Token usage</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-foreground leading-none">{s.tokenUsage.toLocaleString()}</span>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[12px] text-foreground/60">ActOne</span>
                    <span className="text-[12px] text-foreground/60 tabular-nums">38%</span>
                  </div>
                  <div className="w-full rounded-full h-1" style={{ background: trackBg }}>
                    <div className="h-1 rounded-full" style={{ width: '38%', background: 'linear-gradient(90deg,#5eead4,#3b82f6,#a855f7)' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {lightbox?.attachment && (
        <AttachmentModal
          attachments={[lightbox.attachment]}
          initialIndex={0}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}
