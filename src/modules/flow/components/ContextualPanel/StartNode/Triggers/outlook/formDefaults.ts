import { RepeatTypeEnum } from "../constants";

import type { OutlookFormValues } from "./types";

export const OUTLOOK_DEFAULTS: OutlookFormValues = {
  sendDate: "",
  firstInstanceTime: "",
  repeatType: RepeatTypeEnum.Weekdays,
  repeatValue: 1,
  repeatUnit: 4,
  timeZoneId: "",
  folders: [],
  from: [],
  titleContains: [],
  hasAttachment: false,
  lookBackValue: { value: "1", label: "1" },
  lookBackUnit: 4,
  fromMatch: "oneOf",
  titleContainsMatch: "containsOneOf",
  userEmail: undefined,
};
