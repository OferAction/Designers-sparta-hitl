import axios from 'axios';

const GAS_MACRO_URL =
  'https://script.google.com/macros/s/AKfycbw8wAko8EHhl_SGW_4spda_Y4wSJAvzB19wPeMTqqN1424s0HwwMSO9vpP3fbu-imzd/exec';

/** Raw entry returned by the Apps Script _processed endpoint */
export interface ProcessedSheetEntry {
  sheetRow: number;
  data: string;
  response?: string;
  recommendation?: string;
  approverResponse?: string;
}

interface GasResponse<T> {
  success: boolean;
  error?: string;
  entries?: T[];
}

/** Fetches all entries from the _processed Google Sheet tab */
export async function fetchProcessedEntries(): Promise<ProcessedSheetEntry[]> {
  const { data } = await axios.get<GasResponse<ProcessedSheetEntry>>(GAS_MACRO_URL, {
    params: { sheet: 'processed' },
  });

  if (!data.success) {
    throw new Error(data.error ?? 'Failed to fetch processed entries');
  }

  return data.entries ?? [];
}

/** Writes the requester's response to column B of the _processed sheet */
export async function writeRequesterResponse(
  sheetRow: number,
  response: Record<string, unknown>
): Promise<void> {
  const payload = {
    action: 'writeRequesterResponse',
    sheetRow,
    response,
  };

  // Use text/plain to avoid CORS preflight with Google Apps Script
  const { data } = await axios.post<GasResponse<never>>(
    GAS_MACRO_URL,
    JSON.stringify(payload),
    { headers: { 'Content-Type': 'text/plain;charset=utf-8' } }
  );

  if (!data.success) {
    throw new Error(data.error ?? 'Failed to write requester response');
  }
}

/** Writes the approver's decision to column D of the _processed sheet */
export async function writeApproverResponse(
  sheetRow: number,
  response: Record<string, unknown>
): Promise<void> {
  const payload = {
    action: 'writeApproverResponse',
    sheetRow,
    response,
  };

  const { data } = await axios.post<GasResponse<never>>(
    GAS_MACRO_URL,
    JSON.stringify(payload),
    { headers: { 'Content-Type': 'text/plain;charset=utf-8' } }
  );

  if (!data.success) {
    throw new Error(data.error ?? 'Failed to write approver response');
  }
}
