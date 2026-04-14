import { RepeatTypeEnum } from "../constants";
import { toFirstInstanceISOFromLocalDateStr } from "../shared/utils";
import type { NodeOutput, StartNodeTrigger } from "@/modules/flow/types/BaseNodeTypes";
import { TRIGGER_TYPES, buildStartEventTaskPayload } from "@/services";

import type { OutlookFormValues } from "./types";

export function makeOutlookSettings(data: OutlookFormValues) {
  return {
    folders: data.folders,
    from: data.from,
    titleContains: data.titleContains,
    hasAttachment: data.hasAttachment,
    lookBackValue: data.lookBackValue ? Number(data.lookBackValue.value) : undefined,
    lookBackUnit: data.lookBackUnit,
    fromMatch: data.fromMatch,
    titleContainsMatch: data.titleContainsMatch,
    userId: data.userId,
    userName: data.userName,
    userEmail: data.userEmail,
  } as Record<string, unknown>;
}

export function makeOutlookTrigger(data: OutlookFormValues, id?: string): StartNodeTrigger {
  const isCustomRepeat = Number(data.repeatType) === RepeatTypeEnum.Custom;
  return {
    id: id || `${Date.now()}`,
    account: data.userEmail || data.userName || "",
    repeats: isCustomRepeat ? data.repeatValue || 0 : data.repeatType,
    hasAttachment: data.hasAttachment,
    sender: data.from || [],
    eventTime: toFirstInstanceISOFromLocalDateStr(data.sendDate, data.firstInstanceTime) || "",
    type: TRIGGER_TYPES.EmailTrigger,
    settings: {
      repeatType: data.repeatType,
      repeatValue: isCustomRepeat ? data.repeatValue : undefined,
      repeatUnit: isCustomRepeat ? data.repeatUnit : undefined,
      timeZoneId: data.timeZoneId,
      firstInstanceTime: data.firstInstanceTime,
      sendDate: data.sendDate,
      folders: data.folders,
      from: data.from,
      titleContains: data.titleContains,
      hasAttachment: data.hasAttachment,
      lookBackValue: data.lookBackValue ? Number(data.lookBackValue.value) : undefined,
      lookBackUnit: data.lookBackUnit,
      fromMatch: data.fromMatch,
      titleContainsMatch: data.titleContainsMatch,
      // Persist identity fields so they survive refresh & editing.
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail,
    },
  } as StartNodeTrigger;
}

export function ensureOutlookOutputs(existing: NodeOutput[]): NodeOutput[] {
  const next = [...existing];
  const ensure = (key: string, type: NodeOutput["type"], description?: string) => {
    if (!next.some((o) => o.key === key)) next.push({ id: key, key, type, description });
  };
  ensure("body", "String", "Email body");
  ensure("attachments", "List of Files", "Email attachments");
  return next;
}

export function ensureOutlookInputs(existing: any[]): any[] {
  const next = [...existing];
  const ensure = (key: string, type: string, description?: string) => {
    if (!next.some((o) => o.key === key)) {
      next.push({
        id: key,
        key,
        type,
        description,
        value: { label: "", value: "" },
        readOnly: true,
      });
    }
  };
  ensure("body", "String", "Email body");
  ensure("attachments", "List of Files", "Email attachments");
  return next;
}

export function buildOutlookPayload(data: OutlookFormValues, configurationKey: string, fileId: string) {
  const isCustomRepeat = Number(data.repeatType) === RepeatTypeEnum.Custom;
  const settings = makeOutlookSettings(data);
  return buildStartEventTaskPayload({
    name: "Outlook Start Event",
    repeatType: data.repeatType,
    repeatValue: isCustomRepeat ? data.repeatValue : undefined,
    repeatUnit: isCustomRepeat ? data.repeatUnit : undefined,
    timeZoneId: data.timeZoneId,
    firstInstance: toFirstInstanceISOFromLocalDateStr(data.sendDate, data.firstInstanceTime),
    triggerType: TRIGGER_TYPES.EmailTrigger,
    settings,
    configurationKey,
    fileId,
  });
}
