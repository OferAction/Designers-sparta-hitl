import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { REVIEWER_IAN, REVIEWER_REQ } from '@/hq/data/mockData';
import { fetchProcessedEntries, writeApproverResponse, writeRequesterResponse, type ProcessedSheetEntry } from '@/hq/services/processedSheetApi';
import { ApproverRecommendation, RequesterShipmentDetail, ReviewRequest, ShippingOption } from '@/hq/types';

const PROCESSED_ENTRIES_KEY = ['hq', 'processed-sheet-entries'];

/** Parses the raw JSON from _processed column A into a typed detail object. Skips incomplete rows. */
function parseProcessedEntry(rawJson: string): RequesterShipmentDetail | null {
  try {
    const raw = JSON.parse(rawJson);
    if (!raw || !raw.row || raw.processedId == null) return null;

    return {
      processedId: raw.processedId,
      processedAt: raw.processedAt,
      rowNumber: raw.rowNumber,
      requestInfo: raw.row.requestInfo ?? {},
      itemInfo: raw.row.itemInfo ?? {},
      shipFrom: raw.row.shipFrom ?? {},
      shipTo: raw.row.shipTo ?? {},
      packageInfo: raw.row.packageInfo ?? {},
      selection: raw.selection ?? { strategy: '', reason: '', selected: null, allOptions: [] },
      dimWeightNote: raw.dimWeightNote ?? '',
      warnings: raw.warnings ?? [],
      hasWarnings: raw.hasWarnings ?? false,
    };
  } catch {
    return null;
  }
}

/** Formats an ISO timestamp as a relative time string */
function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

/** Converts a _processed sheet entry into a ReviewRequest for the requester role */
function toReviewRequest(entry: ProcessedSheetEntry): ReviewRequest | null {
  const detail = parseProcessedEntry(entry.data);
  if (!detail) return null;

  const hasResponse = !!entry.response && entry.response.trim() !== '';
  let status: ReviewRequest['status'] = 'Pending';
  let reason = 'PENDING_REQUESTER_REVIEW';
  let workflowId = 'sparta-parcel';
  let workflowName = 'Shipment Review';

  if (hasResponse) {
    try {
      const resp = JSON.parse(entry.response!);
      status = resp.action === 'SUBMIT' ? 'Submitted' : 'Discarded';
      reason = resp.action === 'SUBMIT' ? 'REQUESTER_APPROVED' : 'REQUESTER_DISCARDED';
      workflowId = 'sparta-parcel-done';
      workflowName = 'Completed';
    } catch {
      status = 'Pending';
    }
  }

  return {
    id: `req-live-${detail.processedId}`,
    reqId: `REQ-${detail.processedId}`,
    status,
    reason,
    type: 'Requester review',
    sentToReview: formatRelativeTime(detail.processedAt),
    sortTs: new Date(detail.processedAt).getTime(),
    workflowId,
    workflowName,
    environment: 'live',
    assignedTo: REVIEWER_REQ,
    spartaRole: 'requester',
    requesterShipmentDetail: { ...detail, processedSheetRow: entry.sheetRow },
  };
}

/** Fetches _processed entries and converts them to ReviewRequest objects */
export function useProcessedEntries(enabled = true) {
  return useQuery({
    queryKey: PROCESSED_ENTRIES_KEY,
    queryFn: async () => {
      const entries = await fetchProcessedEntries();
      return entries
        .map(toReviewRequest)
        .filter((r): r is ReviewRequest => r !== null);
    },
    enabled,
    refetchInterval: 30_000,
    staleTime: 10_000,
  });
}

/** Mutation to write the requester's response to the _processed sheet column B */
export function useWriteRequesterResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      sheetRow: number;
      response: {
        action: 'SUBMIT' | 'DISCARD';
        respondedAt: string;
        processedId: number;
        rowNumber: number;
        selectedOption?: ShippingOption;
      };
    }) => writeRequesterResponse(params.sheetRow, params.response),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROCESSED_ENTRIES_KEY });
    },
  });
}

/* ────────────────────────── Approver (Column C → D) ────────────────────────── */

/** Parses the recommendation JSON from column C into an ApproverRecommendation */
function parseRecommendation(rawJson: string, sheetRow: number): ApproverRecommendation | null {
  try {
    const raw = JSON.parse(rawJson);
    if (!raw || raw.processedId == null) return null;

    return {
      processedId: raw.processedId,
      processedAt: raw.processedAt ?? '',
      status: raw.status ?? '',
      rowNumber: raw.rowNumber ?? 0,
      processedSheetRow: sheetRow,
      shipment: raw.shipment ?? {},
      selectedService: raw.selectedService ?? {},
      budgetAnalysis: raw.budgetAnalysis ?? {},
      recommendation: raw.recommendation ?? { status: '', color: '', approvalLevel: '', summary: '' },
    } as ApproverRecommendation;
  } catch {
    return null;
  }
}

/** Converts a _processed entry with column C recommendation into a ReviewRequest for the approver */
function toApproverReviewRequest(entry: ProcessedSheetEntry): ReviewRequest | null {
  if (!entry.recommendation) return null;

  const rec = parseRecommendation(entry.recommendation, entry.sheetRow);
  if (!rec) return null;

  /* Determine status from column D (approver response) */
  let status: ReviewRequest['status'] = 'Pending';
  let workflowId = 'sparta-parcel';
  let workflowName = 'Shipment Review';

  /* Derive recommendation column text from budget analysis */
  const recColor = (rec.recommendation?.color ?? '').toLowerCase();
  const reason = recColor === 'red'
    ? 'BUDGET_EXCEEDED'
    : recColor === 'yellow'
      ? 'APPROACHING_LIMIT'
      : 'WITHIN_BUDGET';

  if (entry.approverResponse && entry.approverResponse.trim() !== '') {
    try {
      const resp = JSON.parse(entry.approverResponse);
      status = resp.action === 'APPROVE' ? 'Approved' : 'Declined';
      workflowId = 'sparta-parcel-done';
      workflowName = 'Completed';
    } catch {
      status = 'Pending';
    }
  }

  return {
    id: `apr-live-${rec.processedId}`,
    reqId: `SHP-${rec.processedId}`,
    status,
    reason,
    type: 'Wait for approval',
    sentToReview: formatRelativeTime(rec.processedAt),
    sortTs: new Date(rec.processedAt).getTime(),
    workflowId,
    workflowName,
    environment: 'live',
    assignedTo: REVIEWER_IAN,
    spartaRole: 'approver',
    approverRecommendation: rec,
  };
}

/** Fetches _processed entries that have a column C recommendation for the approver role */
export function useApproverEntries(enabled = true) {
  return useQuery({
    queryKey: [...PROCESSED_ENTRIES_KEY, 'approver'],
    queryFn: async () => {
      const entries = await fetchProcessedEntries();
      return entries
        .map(toApproverReviewRequest)
        .filter((r): r is ReviewRequest => r !== null);
    },
    enabled,
    refetchInterval: 30_000,
    staleTime: 10_000,
  });
}

/** Mutation to write the approver's response to column D of the _processed sheet */
export function useWriteApproverResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      sheetRow: number;
      response: {
        action: 'APPROVE' | 'REJECT';
        respondedAt: string;
        processedId: number;
        approver: string;
        shipmentRowNumber?: number;
        notes?: string;
      };
    }) => writeApproverResponse(params.sheetRow, params.response),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROCESSED_ENTRIES_KEY });
    },
  });
}

/* ─────────────────── Approval Status (requester's submitted → approver outcome) ─────────────────── */

/** Converts a submitted requester entry into an approval-tracking ReviewRequest */
function toApprovalStatusRequest(entry: ProcessedSheetEntry): ReviewRequest | null {
  /* Only include entries that the requester has already submitted */
  if (!entry.response || entry.response.trim() === '') return null;

  let requesterAction: string;
  try {
    const resp = JSON.parse(entry.response);
    requesterAction = resp.action;
  } catch {
    return null;
  }

  /* Only submitted (not discarded) entries enter the approval pipeline */
  if (requesterAction !== 'SUBMIT') return null;

  const detail = parseProcessedEntry(entry.data);
  if (!detail) return null;

  /* Derive status from the approver's column D response */
  let status: ReviewRequest['status'] = 'Pending';
  let workflowId = 'sparta-parcel';
  let workflowName = 'Shipment Review';

  /* Derive budget-based reason from column C recommendation when available */
  let reason = 'PENDING_APPROVAL';
  if (entry.recommendation) {
    const rec = parseRecommendation(entry.recommendation, entry.sheetRow);
    if (rec) {
      const color = (rec.recommendation?.color ?? '').toLowerCase();
      reason = color === 'red'
        ? 'BUDGET_EXCEEDED'
        : color === 'yellow'
          ? 'APPROACHING_LIMIT'
          : 'WITHIN_BUDGET';
    }
  }

  if (entry.approverResponse && entry.approverResponse.trim() !== '') {
    try {
      const resp = JSON.parse(entry.approverResponse);
      status = resp.action === 'APPROVE' ? 'Approved' : 'Declined';
      workflowId = 'sparta-parcel-done';
      workflowName = 'Completed';
    } catch {
      /* keep Pending on parse failure */
    }
  }

  return {
    id: `astatus-live-${detail.processedId}`,
    reqId: `REQ-${detail.processedId}`,
    status,
    reason,
    type: 'Approval tracking',
    sentToReview: formatRelativeTime(detail.processedAt),
    sortTs: new Date(detail.processedAt).getTime(),
    workflowId,
    workflowName,
    environment: 'live',
    assignedTo: REVIEWER_REQ,
    spartaRole: 'requester',
    requesterShipmentDetail: { ...detail, processedSheetRow: entry.sheetRow },
  };
}

/** Fetches submitted requester entries and tracks their approval status from column D */
export function useApprovalStatusEntries(enabled = true) {
  return useQuery({
    queryKey: [...PROCESSED_ENTRIES_KEY, 'approval-status'],
    queryFn: async () => {
      const entries = await fetchProcessedEntries();
      return entries
        .map(toApprovalStatusRequest)
        .filter((r): r is ReviewRequest => r !== null);
    },
    enabled,
    refetchInterval: 30_000,
    staleTime: 10_000,
  });
}
