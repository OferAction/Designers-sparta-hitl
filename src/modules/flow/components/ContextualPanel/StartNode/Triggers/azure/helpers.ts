import { RepeatTypeEnum } from "../constants";
import { toFirstInstanceISOFromDate, formatDateOnly } from "../shared/utils";
import type { NodeOutput, StartNodeTrigger } from "@/modules/flow/types/BaseNodeTypes";
import { TRIGGER_TYPES, buildStartEventTaskPayload } from "@/services";

import type { AzureFormValues } from "./types";

export function makeAzureSettings(data: AzureFormValues) {
  return {
    storageAccountName: data.storageAccountName || undefined,
    container: data.container || undefined,
    filePattern: data.filePattern,
    lookBackValue: data.lookBackValue?.value ? Number(data.lookBackValue.value) : undefined,
    lookBackUnit: data.lookBackUnit,
    sizeType: data.sizeType,
    sizeValue: data.sizeValue?.value ? Number(data.sizeValue.value) : undefined,
    sizeUnit: data.sizeUnit,
  } as Record<string, unknown>;
}

export function makeAzureTrigger(data: AzureFormValues, id?: string): StartNodeTrigger {
  const isCustomRepeat = Number(data.repeats) === RepeatTypeEnum.Custom;
  return {
    id: id || `${Date.now()}`,
    account: data.storageAccountName || "",
    repeats: isCustomRepeat ? data.repeatValue || 0 : data.repeats,
    hasAttachment: undefined,
    sender: [],
    eventTime: toFirstInstanceISOFromDate(data.firstInstance, data.firstInstanceTime) || "",
    type: TRIGGER_TYPES.AzureTrigger,
    settings: {
      repeatType: data.repeats,
      repeatValue: isCustomRepeat ? data.repeatValue : undefined,
      repeatUnit: isCustomRepeat ? data.repeatUnit : undefined,
      timeZoneId: data.timeZone,
      firstInstanceTime: data.firstInstanceTime,
      firstInstanceDate: formatDateOnly(data.firstInstance),
      ...makeAzureSettings(data),
    },
  } as StartNodeTrigger;
}

export function ensureAzureOutputs(existing: NodeOutput[]): NodeOutput[] {
  const next = [...existing];
  if (!next.some((o) => o.key === "attachment")) {
    next.push({ id: "attachment", key: "attachment", type: "File", description: "File attachment" });
  }
  return next;
}

export function buildAzurePayload(data: AzureFormValues, configurationKey: string, fileId: string) {
  const isCustomRepeat = Number(data.repeats) === RepeatTypeEnum.Custom;
  const settings = makeAzureSettings(data);
  return buildStartEventTaskPayload({
    name: "Azure Start Event",
    repeatType: data.repeats,
    repeatValue: isCustomRepeat ? data.repeatValue : undefined,
    repeatUnit: isCustomRepeat ? data.repeatUnit : undefined,
    timeZoneId: data.timeZone,
    firstInstance: toFirstInstanceISOFromDate(data.firstInstance, data.firstInstanceTime),
    triggerType: TRIGGER_TYPES.AzureTrigger,
    settings,
    configurationKey,
    fileId,
  });
}
