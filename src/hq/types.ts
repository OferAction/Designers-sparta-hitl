export type InvoiceStatus = 'Success' | 'Rerouted' | 'Failed' | 'Terminated' | 'Matched' | 'Open';
export type ReviewStatus = 'Pending' | 'Approved' | 'Declined' | 'Timed out' | 'Handoff' | 'Review' | 'Sent' | 'Sent to AP' | 'Sent to Requester' | 'Submitted' | 'Discarded';
export type ReviewType = 'Wait for approval' | 'Notify & End execution' | 'Notify & pause execution' | 'Invoice review' | 'Requester review' | 'Approval tracking';
export type WorkflowEnvironment = 'live' | 'test';
export type SpartaRole = 'approver' | 'shipment-manager' | 'requester';

export interface Reviewer {
  id: string;
  name: string;
  level: 1 | 2;
}

export interface RecentInvoice {
  id: string;
  timestamp: string;
  status: InvoiceStatus;
  subjectReference?: string;
  accountName?: string;
  value?: string;
  attachment?: Attachment;
}

export interface RunDataPoint {
  date: string;
  total: number;
  terminated: number;
  rerouted: number;
  success: number;
  samples?: {
    success: string[];
    rerouted: string[];
    terminated: string[];
  };
}

export interface ReviewRequest {
  id: string;
  reqId: string;
  status: ReviewStatus;
  reason: string;
  type: ReviewType;
  sentToReview: string;
  /** Epoch ms for sorting — newer = higher. Optional; falls back to sentToReview parsing. */
  sortTs?: number;
  workflowId: string;
  workflowName: string;
  environment: WorkflowEnvironment;
  assignedTo: Reviewer;
  invoice?: InvoiceDetail;
  spartaRole?: SpartaRole;
  parcelShipmentDetail?: ParcelShipmentDetail;
  invoiceReviewDetail?: InvoiceReviewDetail;
  requesterShipmentDetail?: RequesterShipmentDetail;
  approverRecommendation?: ApproverRecommendation;
}

export interface Attachment {
  name: string;
  url: string;
  type: 'image' | 'pdf' | 'doc' | 'other';
}

export interface InvoiceDetail {
  price: number;
  description: string;
  vendor: string;
  items: number;
  billingDate: string;
  poNumber: string;
  attachments: Attachment[];
  auditTrail: AuditEntry[];
}

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  timestamp: string;
  comment?: string;
}

export interface WorkflowOverview {
  id: string;
  name: string;
  environment: WorkflowEnvironment;
  kpis: {
    confidence: string;
    coverage: string;
    samplesProcessed: string;
    avgRunTime: string;
    riskControl: string;
  };
  secondaryStats: {
    timeSavedHours: number;
    timeSavedDays: number;
    tokenUsage: number;
    hitlTriggered: number;
    hitlApprovalPct: number;
    hitlAvgHours: number;
    dataSources: { name: string; color: string }[];
  };
  pendingReviews: number;
  runData: RunDataPoint[];
  recentRuns: RecentInvoice[];
}

export type NotificationKind = 'review' | 'fraud' | 'success' | 'warning' | 'system';

export interface HQNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

export interface ParcelShipmentDetail {
  shipmentId: string;
  item: string;
  requestor: { name: string; dept: string };
  event: { name: string; customerId: string };
  expectedDelivery: string;
  route: string;
  service: string;
  estimatedCost: number;
  requestorNotes: string;
  amazonLink?: string;
  recommendation: { label: string; reason: string };
  budgetImpact: {
    event: { name: string; pct: number; current: number; total: number; afterApproval: number; afterApprovalPct: number };
    annual: { name: string; pct: number; current: number; total: number; afterApproval: number; afterApprovalPct: number };
  };
  apCoding: {
    subsidiary: string;
    department: string;
    glAccount: string;
    customerId: string;
  };
}

/** Shipping option returned by FedEx rate API */
export interface ShippingOption {
  serviceType: string;
  serviceName: string;
  rateType: string;
  totalNetCharge: number;
  totalBaseCharge: number;
  totalSurcharges: number;
  fuelSurcharge: number;
  currency: string;
  billedWeightLbs: number;
  dimWeightLbs: number;
  ratedWeightMethod: string;
  transitDays: number | null;
}

/** Detail for the requester role — maps to the _processed Google Sheet rows */
export interface RequesterShipmentDetail {
  processedId: number;
  processedAt: string;
  rowNumber: number;
  processedSheetRow?: number;
  requestInfo: {
    requestedBy: string;
    requestDate: string;
    submissionId: number;
    notes: string;
    packingList: string;
  };
  itemInfo: {
    itemDescription: string;
    department: string;
    apCoding: number;
    quantityBeingShipped: number;
  };
  shipFrom: {
    vendorName: string;
    address: string;
    city: string;
    state: string;
    zip: number;
  };
  shipTo: {
    venueName: string;
    eventCode: string;
    pocName: string;
    pocPhone: string;
  };
  packageInfo: {
    weightLbs: number;
    lengthIn: number;
    widthIn: number;
    heightIn: number;
    numPackages: number;
    method: string;
    requestedShipDate: string;
  };
  selection: {
    strategy: string;
    reason: string;
    selected: ShippingOption;
    allOptions: ShippingOption[];
  };
  dimWeightNote: string;
  warnings: string[];
  hasWarnings: boolean;
}

/** Recommendation data from column C of _processed sheet — used by the approver role */
export interface ApproverRecommendation {
  processedId: number;
  processedAt: string;
  status: string;
  rowNumber: number;
  processedSheetRow?: number;
  shipment: {
    itemDescription: string;
    department: string;
    apCoding: string;
    quantity: number;
    requestedBy: string;
    requestDate: string;
    vendorName: string;
    shipFromZip: number;
    shipToVenue: string;
    requestedShipDate: string;
    numPackages: number;
    weightLbs: number;
    packingListLink: string;
    notes: string;
  };
  selectedService: {
    serviceType: string;
    serviceName: string;
    totalNetCharge: number;
    baseCharge: number;
    surcharges: number;
    fuelSurcharge: number;
    currency: string;
    billedWeight: number;
    dimWeight: number;
    ratedByDim: boolean;
  };
  budgetAnalysis: {
    eventCode: string;
    eventName: string;
    glCode: string;
    glBudget: number | null;
    deptName: string;
    deptBudget: number;
    shippingCost: number;
    remaining: number;
    utilization: number;
    budgetSource: string;
  };
  recommendation: {
    status: string;
    color: string;
    approvalLevel: string;
    summary: string;
  };
}

export interface InvoiceReviewDetail {
  invoiceId: string;
  item: string;
  tracking: string;
  event: { name: string; customerId: string };
  requestor: string;
  approvedBy: { name: string; date: string };
  delivered: string;
  invoice: {
    number: string;
    invoiced: number;
    estimated: number;
    variance: number;
  };
  invoicePdfName: string;
  invoicePdfUrl: string;
  shipmentNotes: string;
  apEmail: {
    to: string;
    cc: string;
    vendor: string;
    subsidiary: string;
    department: string;
    glCode: string;
    customerCode: string;
    total: number;
    payment: string;
    dueDate: string;
    invoiceNumber: string;
  };
}
