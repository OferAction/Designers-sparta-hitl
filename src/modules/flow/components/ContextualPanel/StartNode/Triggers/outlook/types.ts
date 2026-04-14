import type { StartNodeTrigger } from "@/modules/flow/types/BaseNodeTypes";

export type OutlookFormValues = {
  sendDate?: string;
  firstInstanceTime: string;
  repeatType: number;
  repeatValue?: number;
  repeatUnit?: number;
  timeZoneId: string;
  folders: string[];
  from: string[];
  titleContains: string[];
  to?: string[];
  cc?: string[];
  bcc?: string[];
  hasAttachment: boolean;
  lookBackValue: { value: string; label: string } | null;
  lookBackUnit: number;
  fromMatch?: string;
  titleContainsMatch?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
};

export type OutlookConfigurationModalProps = {
  id: string;
  onClose: () => void;
  initialTrigger?: StartNodeTrigger;
};

export type FolderOption = { value: string; label: string };