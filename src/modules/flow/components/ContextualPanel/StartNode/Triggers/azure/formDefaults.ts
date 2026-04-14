import { RepeatTypeEnum, RepeatUnitEnum, SizeTypeEnum, SizeUnitEnum } from "../constants";

import type { AzureFormValues } from "./types";

export const AZURE_DEFAULTS: AzureFormValues = {
  firstInstance: undefined,
  firstInstanceTime: "",
  repeats: RepeatTypeEnum.Weekdays,
  repeatValue: 1,
  repeatUnit: RepeatUnitEnum.Days,
  timeZone: "",
  storageAccountName: undefined,
  container: undefined,
  filePattern: "",
  lookBackValue: { value: "7", label: "7" },
  lookBackUnit: RepeatUnitEnum.Days,
  sizeType: SizeTypeEnum.Min,
  sizeValue: { value: "100", label: "100" },
  sizeUnit: SizeUnitEnum.MB,
};
