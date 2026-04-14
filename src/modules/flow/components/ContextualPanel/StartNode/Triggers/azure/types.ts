import type { StartNodeTrigger } from "@/modules/flow/types/BaseNodeTypes";

export type Option = { value: string; label: string };

export type AzureFormValues = {
  firstInstance?: Date;
  firstInstanceTime: string;
  repeats: number;
  timeZone: string;
  repeatValue?: number;
  repeatUnit?: number;
  storageAccountName?: string;
  container?: string;
  filePattern: string;
  lookBackValue: Option | null;
  lookBackUnit: number;
  sizeType: number;
  sizeValue: Option | null;
  sizeUnit: number;
};

export type AzureConfigurationModalProps = {
  id: string;
  onClose: () => void;
  initialTrigger?: StartNodeTrigger;
};
