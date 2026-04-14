import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

import { ArrowsDownUpIcon as ArrowsUpDown, CaretDownIcon as ChevronDown, CheckCircleIcon as CheckCircle, ClipboardTextIcon as ClipboardText, PackageIcon as Package, ThumbsUpIcon as ThumbsUp, TimerIcon as Timer, UserCheckIcon as UserCheck, UsersIcon as Users, WarningIcon as Warning } from '@phosphor-icons/react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';

import { useIsMobile } from '@/hq/hooks/useIsMobile';
import { useApprovalStatusEntries, useApproverEntries, useProcessedEntries, useWriteApproverResponse, useWriteRequesterResponse } from '@/hq/hooks/useProcessedSheet';

import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import CaseDetailPanel from '@/hq/components/CaseDetailPanel';
import HumanReviewTable, { ColOverrides } from '@/hq/components/HumanReviewTable';
import KPICard from '@/hq/components/KPICard';
import RequesterDetailPanel from '@/hq/components/RequesterDetailPanel';
import SpartaParcelDetailPanel from '@/hq/components/SpartaParcelDetailPanel';
import ToastUndo from '@/hq/components/ToastUndo';
import { useHQTheme, useHQActOne, useHQRole } from '@/hq/context';
import { reviewRequests, spartaReviewRequests, approvalStatusRequests, REVIEWER_IAN, REVIEWER_SM, REVIEWER_REQ } from '@/hq/data/mockData';
import { ReviewRequest, ReviewStatus, SpartaRole, ShippingOption } from '@/hq/types';

const ROLE_OPTIONS: { value: SpartaRole; label: string }[] = [
  { value: 'approver',         label: 'Approver' },
  { value: 'shipment-manager', label: 'Shipment Manager' },
  { value: 'requester',        label: 'Requester' },
];

const STATUS_OPTIONS: { value: ReviewStatus; label: string }[] = [
  { value: 'Pending',            label: 'Pending' },
  { value: 'Approved',           label: 'Approved' },
  { value: 'Declined',           label: 'Declined' },
  { value: 'Timed out',          label: 'Timed out' },
  { value: 'Handoff',            label: 'Handoff' },
  { value: 'Review',             label: 'Review' },
  { value: 'Sent',               label: 'Sent' },
  { value: 'Sent to AP',         label: 'Sent to AP' },
  { value: 'Sent to Requester',  label: 'Sent to Requester' },
  { value: 'Submitted',          label: 'Submitted' },
  { value: 'Discarded',          label: 'Discarded' },
];

const PANEL_PCT_MIN = 35;
const PANEL_PCT_MAX = 75;
const PANEL_PCT_DEFAULT = 50;

/** Statuses considered "actionable" — shown above completed ones */
const PENDING_STATUSES = new Set<ReviewStatus>(['Pending', 'Review', 'Handoff', 'Sent to Requester']);

/** Parses a relative time string ("2 days ago", "Today", "Just now", "3h ago") into epoch ms */
function parseSentToReview(text: string): number {
  const now = Date.now();
  if (text === 'Today' || text === 'Just now') return now;
  const hoursMatch = text.match(/^(\d+)h ago$/);
  if (hoursMatch) return now - Number(hoursMatch[1]) * 3_600_000;
  const dayMatch = text.match(/^(\d+)\s*days?\s*ago$/);
  if (dayMatch) return now - Number(dayMatch[1]) * 86_400_000;
  return 0;
}

/** Returns a sort timestamp — prefers explicit sortTs, falls back to parsing sentToReview */
function getSortTs(r: ReviewRequest): number {
  return r.sortTs ?? parseSentToReview(r.sentToReview);
}

/** Sorts reviews: pending/actionable first, then by newest on top within each group */
function sortReviews(list: ReviewRequest[]): ReviewRequest[] {
  return [...list].sort((a, b) => {
    const aPending = PENDING_STATUSES.has(a.status) ? 0 : 1;
    const bPending = PENDING_STATUSES.has(b.status) ? 0 : 1;
    if (aPending !== bPending) return aPending - bPending;
    return getSortTs(b) - getSortTs(a);
  });
}

const STATIC_REVIEWS = [...reviewRequests, ...spartaReviewRequests];

type Tab = 'mine' | 'all' | 'approval-status';
type Toast = { id: string; message: string; nextId: string | null; undo: () => void; commit: () => void };

const STATUS_FILTER_OPTIONS_QUICK: { value: string; label: string }[] = [
  { value: 'Pending',  label: 'Pending' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Declined', label: 'Declined' },
];

function StatusMultiSelect({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const allSelected = value.length === 0;
  const label = allSelected
    ? 'All Statuses'
    : value.length === 1
      ? value[0]
      : `${value.length} statuses`;

  function toggle(status: string) {
    if (value.includes(status)) {
      onChange(value.filter((v) => v !== status));
    } else {
      onChange([...value, status]);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`flex items-center h-8 gap-2 px-3 rounded-lg border text-xs font-medium transition-colors bg-card text-foreground ${
            open ? 'border-ring' : 'border-border hover:border-ring'
          }`}
        >
          {label}
          <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-auto min-w-[160px] p-1.5 rounded-xl border-border bg-card"
      >
        <div className="flex flex-col">
          <button
            onClick={() => onChange([])}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
              allSelected
                ? 'bg-muted text-foreground font-medium'
                : 'text-foreground/80 hover:bg-muted hover:text-foreground'
            }`}
          >
            All Statuses
            {allSelected && <span className="w-1.5 h-1.5 rounded-full bg-purple-accent flex-shrink-0" />}
          </button>
          {STATUS_FILTER_OPTIONS_QUICK.map((opt) => {
            const checked = value.includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => toggle(opt.value)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  checked
                    ? 'bg-muted text-foreground font-medium'
                    : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                }`}
              >
                {opt.label}
                {checked && <span className="w-1.5 h-1.5 rounded-full bg-purple-accent flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Main HQ reviews page — responsive desktop (side-by-side) and mobile (stacked inline) */
export default function HQReviewsPage() {
  const [searchParams] = useSearchParams();
  const workflowFilter = searchParams.get('workflow') ?? 'sparta-parcel';
  const isMobile = useIsMobile();
  const { theme } = useHQTheme();
  const { actoneOpen } = useHQActOne();
  const { roleFilter, setRoleFilter } = useHQRole();
  const [statusFilter] = useState<string[]>(STATUS_OPTIONS.map((o) => o.value));
  const [statusQuickFilter, setStatusQuickFilter] = useState<string[]>([]);
  const pendingBadge = theme === 'light'
    ? 'bg-amber-100 text-amber-700 border-amber-300'
    : 'bg-amber-500/15 text-amber-400 border-amber-500/25';
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  const [detailMounted, setDetailMounted] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);

  useEffect(() => {
    if (mobileDetailOpen) {
      setDetailMounted(true);
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setDetailVisible(true)));
      return () => cancelAnimationFrame(id);
    } else {
      setDetailVisible(false);
      const t = setTimeout(() => setDetailMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [mobileDetailOpen]);

  // Fetch live _processed entries for the requester role
  const { data: processedReviews = [], isLoading: processedLoading, isError: processedError } = useProcessedEntries(roleFilter === 'requester');
  const writeResponse = useWriteRequesterResponse();

  // Fetch live _processed entries with column C recommendations for the approver role
  const { data: approverReviews = [], isLoading: approverLoading, isError: approverError } = useApproverEntries(roleFilter === 'approver');
  const writeApprover = useWriteApproverResponse();

  // Fetch live approval-status entries (submitted by requester → tracked through approver pipeline)
  const { data: approvalStatusLive = [], isLoading: approvalStatusLoading, isError: approvalStatusError } = useApprovalStatusEntries(roleFilter === 'requester');

  // Merge static mock reviews with live processed entries
  const reviews = useMemo(() => {
    if (roleFilter === 'requester') return [...STATIC_REVIEWS, ...processedReviews];
    if (roleFilter === 'approver') return [...STATIC_REVIEWS, ...approverReviews];
    return STATIC_REVIEWS;
  }, [roleFilter, processedReviews, approverReviews]);

  /** Approval-status entries: mock + live — only relevant for the requester role */
  const approvalStatusReviews = useMemo(() => {
    if (roleFilter !== 'requester') return [];
    return sortReviews([...approvalStatusRequests, ...approvalStatusLive]);
  }, [roleFilter, approvalStatusLive]);

  const [tab, setTab] = useState<Tab>('all');

  // currentUser is role-aware: Ian (id u-1) for approver, Shipping Manager for SM, Requester for requester
  const currentUser = roleFilter === 'approver' ? REVIEWER_IAN : roleFilter === 'requester' ? REVIEWER_REQ : REVIEWER_SM;

  const [selected, setSelected] = useState<ReviewRequest>(
    STATIC_REVIEWS.find((r) => r.assignedTo.id === REVIEWER_IAN.id) ?? STATIC_REVIEWS[0]
  );
  const [panelPct, setPanelPct] = useState(PANEL_PCT_DEFAULT);
  const panelPctRef = useRef(PANEL_PCT_DEFAULT);
  const containerRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const isSparta = workflowFilter === 'sparta-parcel';

  const workflowFiltered = useMemo(() => {
    let base: ReviewRequest[];
    if (workflowFilter === 'all') {
      base = reviews;
    } else if (workflowFilter === 'sparta-parcel') {
      base = reviews.filter((r) => r.workflowId === 'sparta-parcel' || r.workflowId === 'sparta-parcel-done');
    } else {
      base = reviews.filter((r) => r.workflowId === workflowFilter);
    }
    const filtered = base.filter((r) =>
      (r.spartaRole == null || r.spartaRole === roleFilter) &&
      statusFilter.includes(r.status) &&
      (statusQuickFilter.length === 0 || statusQuickFilter.includes(r.status))
    );
    return sortReviews(filtered);
  }, [reviews, workflowFilter, roleFilter, statusFilter, statusQuickFilter]);

  const mineReviews = useMemo(
    () => workflowFiltered.filter((r) => r.assignedTo.id === currentUser.id),
    [workflowFiltered]
  );

  const visibleReviews = useMemo(
    () => tab === 'mine' ? mineReviews : tab === 'approval-status' ? approvalStatusReviews : workflowFiltered,
    [tab, mineReviews, workflowFiltered, approvalStatusReviews]
  );

  function handleSelect(review: ReviewRequest) {
    setSelected(review);
    if (isMobile) setMobileDetailOpen(true);
  }

  // KPIs — Sparta-specific per role, generic otherwise
  const kpiData = useMemo(() => {
    if (isSparta && roleFilter === 'approver') {
      const pending = mineReviews.filter((r) => r.status === 'Pending').length;
      return [
        { label: 'Pending',              value: pending, subtext: 'Assigned to me',      icon: UserCheck, valueSuffix: undefined as string | undefined },
        { label: 'Reviewed',             value: 27,      subtext: 'Decisions made',      icon: Users,     valueSuffix: undefined },
        { label: 'Avg Response Time',    value: '1.4',   subtext: 'Time to decision',    icon: Timer,     valueSuffix: 'days' },
        { label: 'Approval Rate',        value: '89%',   subtext: 'Of reviewed parcels', icon: ThumbsUp,  valueSuffix: undefined },
      ];
    }
    if (isSparta && roleFilter === 'shipment-manager') {
      const awaitingReview = mineReviews.filter((r) => r.status === 'Review' || r.status === 'Pending').length;
      return [
        { label: 'Awaiting Review',      value: awaitingReview, subtext: 'Delivered shipments', icon: ClipboardText, valueSuffix: undefined as string | undefined },
        { label: 'Invoices Processed',   value: 41,             subtext: 'Submitted to AP',     icon: CheckCircle,  valueSuffix: undefined },
        { label: 'Avg Variance',         value: '+$3.80',       subtext: 'Estimate vs. actual', icon: ArrowsUpDown, valueSuffix: undefined },
        { label: 'Flagged',              value: 2,              subtext: 'Billing anomalies',   icon: Warning,      valueSuffix: undefined },
      ];
    }
    if (isSparta && roleFilter === 'requester') {
      const pending = mineReviews.filter((r) => r.status === 'Pending').length;
      const submitted = mineReviews.filter((r) => r.status === 'Submitted').length;
      const awaitingApproval = approvalStatusReviews.filter((r) => r.status === 'Pending').length;
      return [
        { label: 'Pending Review',     value: pending,          subtext: 'Awaiting your decision',   icon: Package,    valueSuffix: undefined as string | undefined },
        { label: 'Submitted',          value: submitted,        subtext: 'Shipments confirmed',      icon: CheckCircle, valueSuffix: undefined },
        { label: 'Awaiting Approval',  value: awaitingApproval, subtext: 'Sent to approver',         icon: Timer,       valueSuffix: undefined },
        { label: 'Discarded',          value: 0,                subtext: 'Shipments cancelled',      icon: Warning,     valueSuffix: undefined },
      ];
    }
    const awaiting = mineReviews.filter((r) => r.status === 'Pending').length;
    return [
      { label: 'Pending',              value: awaiting, subtext: 'Assigned to me',      icon: UserCheck, valueSuffix: undefined as string | undefined },
      { label: 'Reviewed',             value: 104,     subtext: 'Decisions made',       icon: Users,     valueSuffix: undefined },
      { label: 'Average Response Time',value: '3.2',   subtext: 'Time to decision',     icon: Timer,     valueSuffix: 'days' },
      { label: 'Approval Rate',        value: '84%',   subtext: 'Of my reviewed cases', icon: ThumbsUp,  valueSuffix: undefined },
    ];
  }, [isSparta, roleFilter, mineReviews, approvalStatusReviews]);

  const pendingCount = kpiData[0].value as number;

  function showToast(id: string, message: string, prevReview: ReviewRequest, nextId: string | null, commit: () => void) {
    setToast({
      id, message, nextId, commit,
      undo: () => {
        setSelected((prev) => (prev.id === id ? prevReview : prev));
        setToast(null);
      },
    });
  }
  void showToast;

  function handleExpire() {
    toast?.commit();
    const nextId = toast?.nextId ?? null;
    setToast(null);
    if (nextId) {
      const nextReview = reviews.find((r) => r.id === nextId);
      if (nextReview) setSelected(nextReview);
    }
  }

  const startPanelResize = useCallback((startX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const containerWidth = container.getBoundingClientRect().width;
    const startPct = panelPctRef.current;
    const onMove = (e: MouseEvent) => {
      const deltaPx = startX - e.clientX;
      const deltaPct = (deltaPx / containerWidth) * 100;
      const next = Math.max(PANEL_PCT_MIN, Math.min(PANEL_PCT_MAX, startPct + deltaPct));
      panelPctRef.current = next;
      setPanelPct(next);
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
  }, []);

  // If selected review is no longer visible (e.g. role switched), fall back to first visible
  const syncedSelected = visibleReviews.find((r) => r.id === selected.id) ?? visibleReviews[0];

  // Role-specific column labels for Sparta Parcel workflows
  const colOverrides = useMemo<ColOverrides | undefined>(() => {
    if (!isSparta) return undefined;
    if (roleFilter === 'approver') {
      return { reasonLabel: 'Recommendation', sentLabel: 'Submitted' };
    }
    if (roleFilter === 'requester') {
      /* Approval Status tab shows the budget recommendation column */
      if (tab === 'approval-status') return { reasonLabel: 'Recommendation', sentLabel: 'Submitted' };
      return { reasonLabel: null, sentLabel: 'Reason' };
    }
    // shipment-manager: hide reason column, rename sent
    return { reasonLabel: null, sentLabel: 'Submitted' };
  }, [isSparta, roleFilter, tab]);

  useEffect(() => {
    const first = visibleReviews[0];
    if (first) setSelected(first);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => {
    /* Reset to 'mine' tab when switching away from requester (approval-status is requester-only) */
    if (roleFilter !== 'requester' && tab === 'approval-status') setTab('mine');
    const first = visibleReviews[0];
    if (first) setSelected(first);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  function handleMobileBack() {
    setMobileDetailOpen(false);
  }

  /** Records the requester's submission response — writes to column B of the _processed sheet */
  function handleRequesterSubmit(review: ReviewRequest, selectedOption: ShippingOption) {
    const sheetRow = review.requesterShipmentDetail?.processedSheetRow;
    if (!sheetRow) return;

    setSelected((prev) => (prev.id === review.id ? { ...prev, status: 'Submitted' as const } : prev));

    writeResponse.mutate({
      sheetRow,
      response: {
        action: 'SUBMIT',
        respondedAt: new Date().toISOString(),
        processedId: review.requesterShipmentDetail!.processedId,
        rowNumber: review.requesterShipmentDetail!.rowNumber,
        selectedOption,
      },
    });
  }

  /** Records the requester's discard response — writes to column B of the _processed sheet */
  function handleRequesterDiscard(review: ReviewRequest) {
    const sheetRow = review.requesterShipmentDetail?.processedSheetRow;
    if (!sheetRow) return;

    setSelected((prev) => (prev.id === review.id ? { ...prev, status: 'Discarded' as const } : prev));

    writeResponse.mutate({
      sheetRow,
      response: {
        action: 'DISCARD',
        respondedAt: new Date().toISOString(),
        processedId: review.requesterShipmentDetail!.processedId,
        rowNumber: review.requesterShipmentDetail!.rowNumber,
      },
    });
  }

  /** Records the approver's acceptance — writes to column D of the _processed sheet */
  function handleApproverAccept(review: ReviewRequest) {
    const sheetRow = review.approverRecommendation?.processedSheetRow;
    if (!sheetRow) return;

    setSelected((prev) => (prev.id === review.id ? { ...prev, status: 'Approved' as const } : prev));

    writeApprover.mutate({
      sheetRow,
      response: {
        action: 'APPROVE',
        respondedAt: new Date().toISOString(),
        processedId: review.approverRecommendation!.processedId,
        approver: currentUser.name,
        shipmentRowNumber: review.approverRecommendation!.rowNumber,
      },
    });
  }

  /** Records the approver's rejection — writes to column D of the _processed sheet */
  function handleApproverReject(review: ReviewRequest) {
    const sheetRow = review.approverRecommendation?.processedSheetRow;
    if (!sheetRow) return;

    setSelected((prev) => (prev.id === review.id ? { ...prev, status: 'Declined' as const } : prev));

    writeApprover.mutate({
      sheetRow,
      response: {
        action: 'REJECT',
        respondedAt: new Date().toISOString(),
        processedId: review.approverRecommendation!.processedId,
        approver: currentUser.name,
        shipmentRowNumber: review.approverRecommendation!.rowNumber,
      },
    });
  }

  function renderDetailPanel(review: ReviewRequest, extraProps?: { width?: number | string; mobile?: boolean; onBack?: () => void }) {
    if (review.spartaRole === 'requester' && review.requesterShipmentDetail) {
      return (
        <RequesterDetailPanel
          review={review}
          currentUser={currentUser}
          onSubmit={handleRequesterSubmit}
          onDiscard={handleRequesterDiscard}
          {...extraProps}
        />
      );
    }
    if (review.spartaRole) {
      return (
        <SpartaParcelDetailPanel
          review={review}
          currentUser={currentUser}
          onApprove={handleApproverAccept}
          onReject={handleApproverReject}
          {...extraProps}
        />
      );
    }
    return (
      <CaseDetailPanel
        review={review}
        currentUser={currentUser}
        actoneOpen={actoneOpen}
        {...extraProps}
      />
    );
  }

  return (
    <div className={`flex flex-col gap-4 h-full ${isMobile ? 'px-3 pt-3' : 'px-6 pt-4'}`}>
      {/* KPIs */}
      <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-4 gap-4'}`}>
        {kpiData.map((kpi) => (
          <KPICard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            valueSuffix={kpi.valueSuffix}
            subtext={kpi.subtext}
            icon={kpi.icon}
            iconColor="text-purple-accent hover:text-purple-accent-hover"
            compact={isMobile}
          />
        ))}
      </div>

      <div className="flex items-center flex-shrink-0 mt-2 mb-2" style={{ gap: '24px' }}>
        <h2 className="text-lg leading-7 font-medium text-foreground">Approval Requests</h2>
        {!isMobile && (
          <>
            <div className="w-px h-5 bg-border" />
            <StatusMultiSelect value={statusQuickFilter} onChange={setStatusQuickFilter} />
          </>
        )}
        <div className="flex-1" />
        {roleFilter === 'requester' && processedLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Loading shipment data…
          </div>
        )}
        {roleFilter === 'requester' && processedError && (
          <div className="text-sm text-destructive">
            Failed to load processed shipments. Retrying…
          </div>
        )}
        {roleFilter === 'requester' && tab === 'approval-status' && approvalStatusLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Loading approval status…
          </div>
        )}
        {roleFilter === 'requester' && tab === 'approval-status' && approvalStatusError && (
          <div className="text-sm text-destructive">
            Failed to load approval status. Retrying…
          </div>
        )}
        {roleFilter === 'approver' && approverLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Loading recommendations…
          </div>
        )}
      </div>

      {isMobile ? (
        <div className="flex flex-col flex-1 min-h-0 -mt-[8px]">
          <HumanReviewTable
            reviews={visibleReviews}
            selectedId={syncedSelected?.id ?? null}
            onSelect={handleSelect}
            showAssignee={tab === 'all'}
            colOverrides={colOverrides}
            compact
          />

          {detailMounted && syncedSelected && createPortal(
            <div
              className="fixed inset-0 z-50 flex flex-col hq-layout transition-transform duration-300 ease-in-out"
              style={{
                background: 'hsl(var(--background))',
                transform: detailVisible ? 'translateX(0)' : 'translateX(-100%)',
              }}
            >
              {renderDetailPanel(syncedSelected, { mobile: true, onBack: handleMobileBack })}
            </div>,
            document.body
          )}

          {toast && createPortal(
            <div className="fixed bottom-6 left-3 right-3 z-[9999]">
              <div className="hq-layout">
                <ToastUndo key={toast.id + toast.message} message={toast.message} onUndo={toast.undo} onExpire={handleExpire} />
              </div>
            </div>,
            document.body
          )}
        </div>
      ) : (
        <div ref={containerRef} className="flex flex-1 min-h-0 relative -mt-[8px]">
          <HumanReviewTable
            reviews={visibleReviews}
            selectedId={syncedSelected?.id ?? null}
            onSelect={setSelected}
            showAssignee={tab === 'all'}
            colOverrides={colOverrides}
          />
          <div
            onMouseDown={(e) => { e.preventDefault(); startPanelResize(e.clientX); }}
            className="w-1 flex-shrink-0 cursor-col-resize group relative bg-accent"
          >
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px opacity-0 group-hover:opacity-100 group-hover:w-0.5 bg-blue-400 transition-all" />
          </div>
          {syncedSelected ? (
            renderDetailPanel(syncedSelected, { width: `${panelPct}%` })
          ) : (
            <div
              className="flex-shrink-0 flex-grow-0 h-full border-t border-r border-b-0 border-border rounded-tr-xl bg-muted"
              style={{ width: `${panelPct}%` }}
            />
          )}
          {toast && createPortal(
            <div className="fixed bottom-6 z-[9999]" style={{ right: `calc(${panelPct}% + 28px)` }}>
              <div className="hq-layout">
                <ToastUndo key={toast.id + toast.message} message={toast.message} onUndo={toast.undo} onExpire={handleExpire} />
              </div>
            </div>,
            document.body
          )}
        </div>
      )}
    </div>
  );
}
