import { FolderOption } from "./outlook/types";

export const hourOptions: { value: string; label: string }[] = [
  { value: "00:00AM", label: "00:00 AM" },
  { value: "01:00AM", label: "01:00 AM" },
  { value: "02:00AM", label: "02:00 AM" },
  { value: "03:00AM", label: "03:00 AM" },
  { value: "04:00AM", label: "04:00 AM" },
  { value: "05:00AM", label: "05:00 AM" },
  { value: "06:00AM", label: "06:00 AM" },
  { value: "07:00AM", label: "07:00 AM" },
  { value: "08:00AM", label: "08:00 AM" },
  { value: "09:00AM", label: "09:00 AM" },
  { value: "10:00AM", label: "10:00 AM" },
  { value: "11:00AM", label: "11:00 AM" },
  { value: "12:00PM", label: "12:00 PM" },
  { value: "01:00PM", label: "01:00 PM" },
  { value: "02:00PM", label: "02:00 PM" },
  { value: "03:00PM", label: "03:00 PM" },
  { value: "04:00PM", label: "04:00 PM" },
  { value: "05:00PM", label: "05:00 PM" },
  { value: "06:00PM", label: "06:00 PM" },
  { value: "07:00PM", label: "07:00 PM" },
  { value: "08:00PM", label: "08:00 PM" },
  { value: "09:00PM", label: "09:00 PM" },
  { value: "10:00PM", label: "10:00 PM" },
  { value: "11:00PM", label: "11:00 PM" },
];

export const folderOptions: FolderOption[] = [{ value: "Inbox", label: "Inbox" }];

export const timeZoneOptions: { value: string; label: string }[] = [
  { value: "UTC", label: "UTC" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (GMT+1)" },
  { value: "Europe/Berlin", label: "Berlin (GMT+1)" },
  { value: "Europe/Madrid", label: "Madrid (GMT+1)" },
  { value: "Europe/Moscow", label: "Moscow (GMT+3)" },
  { value: "Asia/Jerusalem", label: "Jerusalem (GMT+2)" },
  { value: "Asia/Tel_Aviv", label: "Tel Aviv (GMT+2)" },
  { value: "Africa/Cairo", label: "Cairo (GMT+2)" },
  { value: "Asia/Tokyo", label: "Tokyo (GMT+9)" },
  { value: "Asia/Shanghai", label: "Shanghai (GMT+8)" },
  { value: "America/Los_Angeles", label: "Los Angeles (Pacific) (GMT-8)" },
  { value: "America/New_York", label: "New York (Eastern) (GMT-5)" },
  { value: "America/Sao_Paulo", label: "São Paulo (GMT-3)" },
  { value: "Africa/Johannesburg", label: "Johannesburg (GMT+2)" },
];

export enum RepeatTypeEnum {
  Weekdays = 1,
  DailyMidnight = 2,
  MonthlyTenth = 3,
  EveryOtherWeek = 4,
  Custom = 5,
}

export enum RepeatUnitEnum {
  Seconds = 1,
  Minutes = 2,
  Hours = 3,
  Days = 4,
  Weeks = 5,
}

export const repeatsOptions: { value: number; label: string }[] = [
  { value: RepeatTypeEnum.Weekdays, label: "Monday to Friday" },
  { value: RepeatTypeEnum.DailyMidnight, label: "Every day at 12am" },
  { value: RepeatTypeEnum.MonthlyTenth, label: "Monthly on the 10th" },
  { value: RepeatTypeEnum.EveryOtherWeek, label: "Every other week" },
  { value: RepeatTypeEnum.Custom, label: "Custom" },
];

// export enum OutlookContainerEnum {
//   Inbox = 1,
//   FolderName = 2,
// }

// export const outlookContainerOptions: { value: number; label: string }[] = [
//   { value: OutlookContainerEnum.Inbox, label: "Inbox" },
//   { value: OutlookContainerEnum.FolderName, label: "Folder Name" },
// ];

export enum SizeTypeEnum {
  Min = 1,
  Max = 2,
  Exact = 3,
}

export const sizeTypeOptions: { value: SizeTypeEnum; label: string }[] = [
  { value: SizeTypeEnum.Min, label: "Minimum" },
  { value: SizeTypeEnum.Max, label: "Maximum" },
  { value: SizeTypeEnum.Exact, label: "Exactly" },
];

export enum SizeUnitEnum {
  MB = 1,
  GB = 2,
  TB = 3,
}

export const sizeUnitOptions: { value: SizeUnitEnum; label: string }[] = [
  { value: SizeUnitEnum.MB, label: "MB" },
  { value: SizeUnitEnum.GB, label: "GB" },
  { value: SizeUnitEnum.TB, label: "TB" },
];

export const lookBackUnitOptions: { value: number; label: string }[] = [
  { value: RepeatUnitEnum.Seconds, label: "Seconds" },
  { value: RepeatUnitEnum.Minutes, label: "Minutes" },
  { value: RepeatUnitEnum.Hours, label: "Hours" },
  { value: RepeatUnitEnum.Days, label: "Days" },
  { value: RepeatUnitEnum.Weeks, label: "Weeks" },
];

export interface InitScheduleDefaultsOptions {
  hasExistingTrigger: boolean;
  getValues: (name: any) => any;
  setValue: (name: any, value: any) => void;
  dateField: string;
  timeField: string;
  timeZoneField: string;
  dateValueKind?: "date-object" | "string-ymd";
}
