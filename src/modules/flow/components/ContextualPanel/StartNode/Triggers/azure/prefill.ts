import { RepeatTypeEnum, RepeatUnitEnum, SizeTypeEnum, SizeUnitEnum } from "../constants";
import type { StartNodeTrigger } from "@/modules/flow/types/BaseNodeTypes";

import type { AzureFormValues } from "./types";

export function prefillAzure(initialTrigger?: StartNodeTrigger | null): Partial<AzureFormValues> {
  if (!initialTrigger) return {};
  const s = (initialTrigger.settings || {}) as any;
  const firstInstanceDateStr = (s.firstInstanceDate as string) || (initialTrigger.eventTime ? String(initialTrigger.eventTime).split("T")[0] : "");
  const firstInstance = firstInstanceDateStr ? new Date(`${firstInstanceDateStr}T00:00:00`) : undefined;
  return {
    firstInstance,
    firstInstanceTime: (s.firstInstanceTime as string) || "11:00AM",
    repeats: (s.repeatType as number) ?? RepeatTypeEnum.Custom,
    repeatValue: (s.repeatValue as number) ?? 1,
    repeatUnit: (s.repeatUnit as number) ?? RepeatUnitEnum.Days,
    timeZone: (s.timeZoneId as string) || "",
    storageAccountName: (s.storageAccountName as string) || (initialTrigger.account as string) || undefined,
    container: (s.container as string) || undefined,
    filePattern: (s.filePattern as string) || "",
    lookBackValue: s.lookBackValue ? { value: String(s.lookBackValue), label: String(s.lookBackValue) } : { value: "7", label: "7" },
    lookBackUnit: (() => {
      const raw = s.lookBackUnit as any;
      if (typeof raw === "number") return raw as number;
      const map: Record<string, number> = {
        seconds: RepeatUnitEnum.Seconds,
        minutes: RepeatUnitEnum.Minutes,
        hours: RepeatUnitEnum.Hours,
        days: RepeatUnitEnum.Days,
        weeks: RepeatUnitEnum.Weeks,
      };
      return map[String(raw)?.toLowerCase()] ?? RepeatUnitEnum.Days;
    })(),
    sizeType: (s.sizeType as number) ?? SizeTypeEnum.Min,
    sizeValue: s.sizeValue ? { value: String(s.sizeValue), label: String(s.sizeValue) } : { value: "100", label: "100" },
    sizeUnit: (s.sizeUnit as number) ?? SizeUnitEnum.MB,
  };
}
