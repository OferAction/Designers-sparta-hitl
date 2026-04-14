import { RepeatTypeEnum } from "../constants";
import type { StartNodeTrigger } from "@/modules/flow/types/BaseNodeTypes";

import type { OutlookFormValues } from "./types";

export function prefillOutlook(initialTrigger?: StartNodeTrigger | null): Partial<OutlookFormValues> {
  if (!initialTrigger) return {};
  const s = (initialTrigger.settings || {}) as any;
  return {
    sendDate: initialTrigger.eventTime?.split("T")[0] || "",
    firstInstanceTime: (s.firstInstanceTime as string) || "11:00AM",
    repeatType: (s.repeatType as number) ?? RepeatTypeEnum.Custom,
    repeatValue: (s.repeatValue as number) ?? 1,
    repeatUnit: (s.repeatUnit as number) ?? 4,
    timeZoneId: (s.timeZoneId as string) || "",
    folders: (s.folders as string[]) || [],
    from: (s.from as string[]) || [],
    titleContains: (s.titleContains as string[]) || [],
    hasAttachment: Boolean(s.hasAttachment ?? initialTrigger.hasAttachment ?? false),
    lookBackValue: s.lookBackValue ? { value: String(s.lookBackValue), label: String(s.lookBackValue) } : { value: "1", label: "1" },
    lookBackUnit: (s.lookBackUnit as number) ?? 4,
    fromMatch: (s.fromMatch as string) || "oneOf",
    titleContainsMatch: (s.titleContainsMatch as string) || "containsOneOf",
    userId: (s.userId as string) || (initialTrigger as any)?.settings?.userId || undefined,
    userName: (s.userName as string) || (initialTrigger as any)?.settings?.userName || undefined,
    userEmail: (s.userEmail as string) || (initialTrigger as any)?.settings?.userEmail || undefined,
  };
}
