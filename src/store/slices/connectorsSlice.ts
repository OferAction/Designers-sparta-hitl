export type HasAttachments = "Both" | "Yes" | "No";
export const HAS_ATTACHMENTS_OPTIONS: HasAttachments[] = ["Both", "Yes", "No"];

export type MessageStatus = "all" | "read" | "unread";
export const MESSAGE_STATUS_OPTIONS: MessageStatus[] = ["all", "read", "unread"];

export type AllowedFileTypeOption = "All" | "PDF" | "DOCX" | "JPG" | "PNG" | "XLSX" | "CSV" | "ZIP";
export const ALLOWED_FILE_TYPES_OPTIONS: AllowedFileTypeOption[] = ["All", "PDF", "DOCX", "JPG", "PNG", "XLSX", "CSV", "ZIP"];

export const MAX_EMAILS_TO_RETURN_OPTIONS: number[] = [10, 20, 50, 100, 200];

export interface OutlookAdvancedParams {
  messageStatus?: MessageStatus;
  dateFrom?: string;
  dateTo?: string;
  to?: string;
  cc?: string;
  bcc?: string;
  bodyContains?: string;
  hasAttachments: HasAttachments;
  allowedFileTypes?: AllowedFileTypeOption | "";
  minSizeMB?: number;
  maxSizeMB?: number;
  maxEmailsToReturn?: number;
  includeSubfolders: boolean;
  markAsReadAfterProcessing: boolean;
}

export interface ConnectorsState {
  outlookAdvancedParams: OutlookAdvancedParams;
  setOutlookAdvancedParams: (p: OutlookAdvancedParams) => void;
}

const defaultParams: OutlookAdvancedParams = {
  messageStatus: undefined,
  dateFrom: undefined,
  dateTo: undefined,
  to: "",
  cc: "",
  bcc: "",
  bodyContains: "",
  hasAttachments: "Both",
  allowedFileTypes: "",
  minSizeMB: undefined,
  maxSizeMB: undefined,
  maxEmailsToReturn: undefined,
  includeSubfolders: true,
  markAsReadAfterProcessing: true,
};

export const createConnectorsSlice = (set: any): ConnectorsState => ({
  outlookAdvancedParams: defaultParams,
  setOutlookAdvancedParams: (p) => set({ outlookAdvancedParams: p }),
});
