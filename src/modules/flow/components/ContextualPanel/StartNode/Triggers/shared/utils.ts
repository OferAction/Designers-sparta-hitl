import { InitScheduleDefaultsOptions, lookBackUnitOptions, repeatsOptions, RepeatTypeEnum } from "../constants";
import { hourOptions, timeZoneOptions } from "../constants";

export function parseTimeToHoursMinutes(time?: string): { hours: number; minutes: number } {
  if (!time) return { hours: 0, minutes: 0 };
  const match = time.match(/^(\d{2}):(\d{2})(AM|PM)$/i);
  if (!match) return { hours: 0, minutes: 0 };
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3].toUpperCase();
  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  return { hours, minutes };
}

function formatLocalDateTime(date: Date): string {
  const offsetMs = date.getTimezoneOffset() * 60_000;
  const local = new Date(date.getTime() - offsetMs);
  return local.toISOString().slice(0, 19);
}

export function toFirstInstanceISOFromDate(date?: Date, timeStr?: string): string | undefined {
  if (!date || !timeStr) return undefined;
  const base = new Date(date);
  const { hours, minutes } = parseTimeToHoursMinutes(timeStr);
  base.setHours(hours, minutes, 0, 0);
  return formatLocalDateTime(base);
}

export function toFirstInstanceISOFromLocalDateStr(dateStr?: string, timeStr?: string): string | undefined {
  if (!dateStr || !timeStr) return undefined;
  const [y, m, d] = dateStr.split("-").map((x) => parseInt(x, 10));
  if (!y || !m || !d) return undefined;
  const base = new Date(y, m - 1, d, 0, 0, 0, 0);
  const { hours, minutes } = parseTimeToHoursMinutes(timeStr);
  base.setHours(hours, minutes, 0, 0);
  return formatLocalDateTime(base);
}

export function formatDateOnly(d?: Date): string | undefined {
  if (!d) return undefined;
  return new Intl.DateTimeFormat("en-CA").format(d);
}

export function getRepeatTextFromSettings(settings?: Record<string, unknown>): string {
  const s = settings || {};
  const repeatType = Number((s as any).repeatType);
  if (!repeatType) return "—";
  if (repeatType !== RepeatTypeEnum.Custom) {
    const preset = repeatsOptions.find((o) => o.value === repeatType);
    return preset?.label || "—";
  }
  const val = Number((s as any).repeatValue || 0);
  const unitNum = Number((s as any).repeatUnit);
  const unitLabel = lookBackUnitOptions.find((o) => o.value === unitNum)?.label?.toLowerCase() || "days";
  if (!val || !unitNum) return "—";
  const plural = val === 1 ? unitLabel.replace(/s$/i, "") : unitLabel;
  return `Every ${val} ${plural}`;
}

export function initScheduleDefaults(opts: InitScheduleDefaultsOptions) {
  const { hasExistingTrigger, getValues, setValue, dateField, timeField, timeZoneField, dateValueKind = "string-ymd" } = opts;

  if (hasExistingTrigger) return;

  const dateVal = getValues(dateField);
  const timeVal = getValues(timeField);
  const tzVal = getValues(timeZoneField);

  const now = new Date();
  if (!dateVal) {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    if (dateValueKind === "date-object") {
      setValue(dateField as any, new Date(`${y}-${m}-${d}T00:00:00`));
    } else {
      setValue(dateField as any, `${y}-${m}-${d}`);
    }
  }

  if (!timeVal) {
    let hrs = now.getHours();
    const mins = now.getMinutes();
    if (mins > 0) {
      hrs = (hrs + 1) % 24;
    }
    let candidate: string;
    if (hrs === 0) {
      candidate = "00:00AM";
    } else if (hrs === 12) {
      candidate = "12:00PM";
    } else if (hrs < 12) {
      candidate = `${String(hrs).padStart(2, "0")}:00AM`;
    } else {
      const hour12 = hrs - 12;
      candidate = `${String(hour12).padStart(2, "0")}:00PM`;
    }
    const exists = hourOptions.some((o) => o.value === candidate);
    setValue(timeField as any, exists ? candidate : "00:00AM");
  }

  if (!tzVal) {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const match = timeZoneOptions.find((t) => t.value === tz) || timeZoneOptions[0];
      if (match) setValue(timeZoneField as any, match.value);
    } catch {
      if (timeZoneOptions[0]) setValue(timeZoneField as any, timeZoneOptions[0].value);
    }
  }
}
