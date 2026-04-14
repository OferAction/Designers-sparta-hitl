import { useState, useRef, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import KPICard from '@/hq/components/KPICard';
import RunsChart from '@/hq/components/RunsChart';
import RecentInvoicesFeed from '@/hq/components/RecentInvoicesFeed';
import OverviewBottomStats from '@/hq/components/OverviewBottomStats';
import ExceptionPipeline from '@/hq/components/ExceptionPipeline';
import ExceptionRouted from '@/hq/components/ExceptionRouted';
import WorkflowSection from '@/hq/components/WorkflowSection';
import { workflowOverviews } from '@/hq/data/mockData';
import { useIsMobile } from '@/hq/hooks/useIsMobile';
import ConfidenceIcon from '@/assets/confidence.svg?react';
import CoverageIcon from '@/assets/kpi-coverage.svg?react';
import SamplesIcon from '@/assets/kpi-samples.svg?react';
import AutoMatchIcon from '@/assets/kpi-auto-match.svg?react';
import RiskIcon from '@/assets/kpi-risk.svg?react';
import type { RunDataPoint, WorkflowOverview } from '@/hq/types';

function useDragReorder(count: number) {
    const [order, setOrder] = useState<number[]>(() => Array.from({ length: count }, (_, i) => i));
    const fromRef = useRef<number | null>(null);
    const [dragging, setDragging] = useState<number | null>(null);
    const [over, setOver] = useState<number | null>(null);

    function getProps(pos: number) {
        return {
            draggable: true as const,
            onDragStart: (e: React.DragEvent) => {
                fromRef.current = pos;
                setDragging(pos);
                e.dataTransfer.effectAllowed = 'move';
            },
            onDragOver: (e: React.DragEvent) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                setOver(pos);
            },
            onDragLeave: (e: React.DragEvent) => {
                if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
                    setOver(null);
                }
            },
            onDrop: (e: React.DragEvent) => {
                e.preventDefault();
                const from = fromRef.current;
                if (from !== null && from !== pos) {
                    setOrder(prev => {
                        const next = [...prev];
                        const [moved] = next.splice(from, 1);
                        next.splice(pos, 0, moved);
                        return next;
                    });
                }
                fromRef.current = null;
                setDragging(null);
                setOver(null);
            },
            onDragEnd: () => {
                fromRef.current = null;
                setDragging(null);
                setOver(null);
            },
        };
    }

    return { order, dragging, over, getProps };
}

function dragCls(pos: number, dragging: number | null, over: number | null) {
    const isDragging = dragging === pos;
    const isOver = over === pos && dragging !== pos;
    return `cursor-grab active:cursor-grabbing select-none transition-opacity duration-150 ${isDragging ? 'opacity-40' : ''} ${isOver ? 'ring-1 ring-purple-500/30 rounded-xl' : ''}`;
}

const overviewKpis = [
    { label: 'Transaction processed', value: '450,312', subtext: 'This period', icon: SamplesIcon },
    { label: 'Auto match rate', value: '99.97%', subtext: 'Automatically matched', icon: AutoMatchIcon },
    { label: 'Exception rate', value: '0.03%', subtext: 'Needing review', icon: RiskIcon },
    { label: 'Value reconciled', value: 'AED 142.5M', subtext: 'Successfully matched transactions', icon: ConfidenceIcon },
    { label: 'Remaning value for reconciliation', value: 'AED 2.4M', subtext: 'Open/ Unmatched transactions', icon: CoverageIcon },
];

type DateRange = '1d' | 'today' | '7d' | '30d' | '3m' | '12m' | 'all';

const DATE_RANGE_SCALE: Record<DateRange, number> = {
    '1d': 0.04,
    today: 0.12,
    '7d': 0.28,
    '30d': 1,
    '3m': 3.1,
    '12m': 12.2,
    all: 18.4,
};

const DATE_RANGE_RECENT_RUNS: Record<DateRange, number> = {
    '1d': 140,
    today: 10,
    '7d': 18,
    '30d': 28,
    '3m': 28,
    '12m': 28,
    all: 28,
};

const DATE_RANGE_BAR_COUNT: Record<DateRange, number> = {
    '1d': 1,
    today: 1,
    '7d': 7,
    '30d': 30,
    '3m': 12,
    '12m': 12,
    all: 18,
};

function formatInteger(value: number) {
    return Math.round(value).toLocaleString();
}

function formatPercent(value: number, digits = 0) {
    return `${value.toFixed(digits)}%`;
}

function parseRunDate(label: string) {
    return new Date(`${label}, 2026`);
}

function formatRunDate(date: Date, range: DateRange) {
    if (range === '12m' || range === 'all') {
        return date.toLocaleDateString('en-US', { month: 'short' });
    }

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function shiftDate(date: Date, range: DateRange, stepsBack: number) {
    const next = new Date(date);
    if (range === '3m') {
        next.setDate(next.getDate() - stepsBack * 7);
    } else if (range === '12m' || range === 'all') {
        next.setMonth(next.getMonth() - stepsBack);
    } else {
        next.setDate(next.getDate() - stepsBack);
    }
    return next;
}

function buildRunDataForRange(runData: RunDataPoint[], range: DateRange) {
    if (runData.length === 0) return runData;

    if (range === '1d') {
        const last = runData[runData.length - 1];
        return last ? [{ ...last, date: '1 Day' }] : runData;
    }

    if (range === 'today') {
        const last = runData[runData.length - 1];
        return last ? [{ ...last, date: 'Today' }] : runData;
    }

    const targetCount = DATE_RANGE_BAR_COUNT[range];
    const endDate = parseRunDate(runData[runData.length - 1].date);
    const sourcePoints =
        targetCount <= runData.length
            ? runData.slice(-targetCount)
            : Array.from({ length: targetCount }, (_, idx) => runData[idx % runData.length]);

    return sourcePoints.map((point, idx) => {
        const stepsBack = targetCount - 1 - idx;
        return {
            ...point,
            date: formatRunDate(shiftDate(endDate, range, stepsBack), range),
        };
    });
}

function transformWorkflowForRange(workflow: WorkflowOverview, range: DateRange): WorkflowOverview {
    const scale = DATE_RANGE_SCALE[range];
    const sampleBase = Number(workflow.kpis.samplesProcessed.replace(/,/g, ''));
    const confidenceBase = Number(workflow.kpis.confidence.replace('%', ''));
    const coverageBase = Number(workflow.kpis.coverage.replace('%', ''));
    const avgRunBase = Number(workflow.kpis.avgRunTime.replace(' sec', ''));
    const riskBase = Number(workflow.kpis.riskControl.replace('%', ''));

    const sampleMultiplier = range === '1d' ? 0.03 : range === 'today' ? 0.08 : range === '7d' ? 0.24 : scale;
    const confidenceShift = range === '1d' ? -1.2 : range === 'today' ? -0.8 : range === '7d' ? -0.4 : range === '3m' ? 0.1 : range === '12m' ? 0.2 : range === 'all' ? 0.3 : 0;
    const coverageShift = range === '1d' ? -0.18 : range === 'today' ? -0.12 : range === '7d' ? -0.05 : range === '3m' ? 0.02 : range === '12m' ? 0.04 : range === 'all' ? 0.05 : 0;
    const avgRunMultiplier = range === '1d' ? 0.88 : range === 'today' ? 0.92 : range === '7d' ? 0.96 : range === '3m' ? 1.03 : range === '12m' ? 1.05 : range === 'all' ? 1.06 : 1;
    const riskMultiplier = range === '1d' ? 1.35 : range === 'today' ? 1.2 : range === '7d' ? 1.08 : range === '3m' ? 0.96 : range === '12m' ? 0.92 : range === 'all' ? 0.9 : 1;

    return {
        ...workflow,
        pendingReviews: Math.max(0, Math.round(workflow.pendingReviews * (range === '1d' ? 0.3 : range === 'today' ? 0.5 : range === '7d' ? 0.75 : range === '30d' ? 1 : 1.1))),
        kpis: {
            confidence: formatPercent(Math.min(99.99, Math.max(90, confidenceBase + confidenceShift))),
            coverage: formatPercent(Math.min(99.99, Math.max(90, coverageBase + coverageShift)), 2),
            samplesProcessed: formatInteger(sampleBase * sampleMultiplier),
            avgRunTime: `${(avgRunBase * avgRunMultiplier).toFixed(1)} sec`,
            riskControl: formatPercent(Math.max(0.01, riskBase * riskMultiplier), 2),
        },
        secondaryStats: {
            ...workflow.secondaryStats,
            timeSavedHours: Math.max(1, Math.round(workflow.secondaryStats.timeSavedHours * sampleMultiplier)),
            timeSavedDays: Math.max(1, Math.round(workflow.secondaryStats.timeSavedDays * sampleMultiplier)),
            tokenUsage: Math.max(1, Math.round(workflow.secondaryStats.tokenUsage * sampleMultiplier)),
            hitlTriggered: Math.max(0, Math.round(workflow.secondaryStats.hitlTriggered * (range === '1d' ? 0.1 : range === 'today' ? 0.25 : range === '7d' ? 0.6 : range === '30d' ? 1 : scale))),
            hitlApprovalPct: Math.min(99, Math.max(40, Math.round(workflow.secondaryStats.hitlApprovalPct + (range === '1d' ? -6 : range === 'today' ? -4 : range === '7d' ? -2 : range === '3m' ? 1 : 0)))),
            hitlAvgHours: Number((workflow.secondaryStats.hitlAvgHours * (range === '1d' ? 0.7 : range === 'today' ? 0.8 : range === '7d' ? 0.9 : range === '3m' ? 1.05 : range === '12m' ? 1.08 : 1)).toFixed(1)),
        },
        runData: buildRunDataForRange(workflow.runData, range),
        recentRuns: workflow.recentRuns.slice(0, DATE_RANGE_RECENT_RUNS[range]),
    };
}

function buildAggregateKpis(workflows: WorkflowOverview[]) {
    void workflows;
    return overviewKpis;
}

export default function HQOverviewPage() {
    const isMobile = useIsMobile();
    const [searchParams] = useSearchParams();
    const workflowFilter = searchParams.get('workflow') ?? 'sparta-parcel';
    const dateRange = (searchParams.get('date') ?? '30d') as DateRange;
    const chartFeedRef = useRef<HTMLDivElement>(null);
    const [chartWidthPct, setChartWidthPct] = useState(45);

    const row1 = useDragReorder(overviewKpis.length);

    const startChartFeedResize = useCallback((startX: number) => {
        const container = chartFeedRef.current;
        if (!container) return;

        const bounds = container.getBoundingClientRect();
        const minPct = 30;
        const maxPct = 70;

        const onMove = (e: MouseEvent) => {
            const relativeX = e.clientX - bounds.left;
            const nextPct = Math.max(minPct, Math.min(maxPct, (relativeX / bounds.width) * 100));
            setChartWidthPct(nextPct);
        };

        const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };

        onMove({ clientX: startX } as MouseEvent);
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }, []);

    const overviewWorkflows = useMemo(
        () => workflowOverviews.map((workflow) => transformWorkflowForRange(workflow, dateRange)),
        [dateRange]
    );

    const visibleWorkflows = useMemo(
        () => workflowFilter === 'all' ? overviewWorkflows : overviewWorkflows.filter(wf => wf.id === workflowFilter),
        [overviewWorkflows, workflowFilter]
    );

    const singleWorkflow = workflowFilter !== 'all' ? visibleWorkflows[0] : null;

    const singleKpis = singleWorkflow ? overviewKpis : null;

    const activeKpis = singleKpis ?? buildAggregateKpis(overviewWorkflows);

    /* ── Single workflow: full detail layout ── */
    if (singleWorkflow) {
        return (
            <div className={`flex flex-col h-full ${isMobile ? 'px-3 pt-3 pb-4 overflow-y-auto' : 'px-6 pt-4 pb-6 overflow-hidden'}`}>
                {/* KPI strip — workflow-specific */}
                <div className="flex-shrink-0">
                    {isMobile ? (
                        <div className="-mr-3">
                            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none" style={{ scrollSnapType: 'x mandatory' }}>
                                {activeKpis.map(kpi => (
                                    <div key={kpi.label} className="flex-shrink-0 w-[44vw]" style={{ scrollSnapAlign: 'start' }}>
                                        <KPICard {...kpi} compact />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-5 gap-4">
                            {row1.order.map((origIdx, pos) => (
                                <div key={origIdx} className={dragCls(pos, row1.dragging, row1.over)} {...row1.getProps(pos)}>
                                    <KPICard {...activeKpis[origIdx]} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 1-Day: Exception pipeline + routed donuts + bottom stats */}
                {dateRange === '1d' ? (
                    <div className="flex-1 overflow-y-auto mt-4">
                        <div className="grid grid-cols-2 grid-rows-[auto_1fr] gap-4">
                            {/* Top-left: Exception Pipeline */}
                            <div className="col-span-1 row-span-1">
                                <ExceptionPipeline />
                            </div>
                            {/* Right: Exception Routed (spans both rows) */}
                            <div className="col-span-1 row-span-2">
                                <ExceptionRouted />
                            </div>
                            {/* Bottom-left: Accounts + Cost */}
                            <div className="col-span-1 row-span-1">
                                <OverviewBottomStats />
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Chart + Feed */}
                        {isMobile ? (
                            <div className="flex flex-col gap-4 mt-4">
                                <div className="h-[260px]"><RunsChart data={singleWorkflow.runData} dateRange={dateRange} /></div>
                                <RecentInvoicesFeed data={singleWorkflow.recentRuns} />
                            </div>
                        ) : (
                            <div ref={chartFeedRef} className="flex flex-1 min-h-0 mt-4 items-stretch">
                                <div className="min-w-0 h-full" style={{ width: `calc(${chartWidthPct}% - 2px)` }}>
                                    <RunsChart data={singleWorkflow.runData} dateRange={dateRange} />
                                </div>
                                <div
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        startChartFeedResize(e.clientX);
                                    }}
                                    className="group flex-shrink-0 w-4 mx-1 cursor-col-resize flex items-center justify-center"
                                >
                                    <div className="h-full w-[4px] rounded-full bg-purple-accent opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
                                </div>
                                <div className="flex-1 min-w-0 h-full">
                                    <RecentInvoicesFeed data={singleWorkflow.recentRuns} />
                                </div>
                            </div>
                        )}

                        {/* Bottom stats */}
                        <div className="flex-shrink-0 mt-4">
                            <OverviewBottomStats />
                        </div>
                    </>
                )}
            </div>
        );
    }

    /* ── All workflows: multi-workflow overview ── */
    return (
        <div className={`flex flex-col h-full ${isMobile ? 'px-3 pt-3' : 'px-6 pt-4'}`}>

            {/* Zone A — Aggregate KPI strip */}
            <div className="flex-shrink-0">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">Average top KPIs</p>
                {isMobile ? (
                    <div className={`grid gap-3 grid-cols-2`}>
                        {activeKpis.map((kpi, i) => (
                            <div key={kpi.label} className={i === activeKpis.length - 1 ? 'col-span-2' : ''}>
                                <KPICard {...kpi} compact />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-5 gap-4">
                        {row1.order.map((origIdx, pos) => (
                            <div key={origIdx} className={dragCls(pos, row1.dragging, row1.over)} {...row1.getProps(pos)}>
                                <KPICard {...activeKpis[origIdx]} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Zone B — Per-workflow sections (scrollable) */}
            <div className={`flex-1 overflow-y-auto mt-4 ${isMobile ? 'pb-4' : 'pb-6'}`}>
                <div className={`flex flex-col ${isMobile ? 'gap-4' : 'gap-3'}`}>
                    {visibleWorkflows.map(wf => (
                        <WorkflowSection
                            key={wf.id}
                            workflow={wf}
                            defaultExpanded={wf.environment === 'live'}
                            isMobile={isMobile}
                        />
                    ))}
                </div>
            </div>

        </div>
    );
}
