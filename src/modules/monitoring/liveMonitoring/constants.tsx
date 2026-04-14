import { FC, ReactElement, SVGProps } from "react";

import { CheckCircleIcon } from "@phosphor-icons/react";

import { TriggerTypeKeys } from "../services/types";
import { AzureTriggerIcon as AzureTrigger, ErrorExExIcon as ErrorIcon, OutlookIcon, WarningExExIcon as WarningIcon } from "@/lib/icons";

export const triggerIconMapping: Record<TriggerTypeKeys, FC<SVGProps<SVGSVGElement>> | null> = {
  AzureTrigger: AzureTrigger,
  EmailTrigger: OutlookIcon,
  NotSpecified: null,
};

export const statusIconMapping: Record<string, ReactElement | null> = {
  Running: <CheckCircleIcon weight="fill" className="text-success-hover" size={16} />,
  Pending: <WarningIcon className="size-4" />,
  Finished: <CheckCircleIcon weight="fill" className="text-success-hover" size={16} />,
  Cancelled: null,
  Failed: <ErrorIcon className="size-4" />,
  Paused: null,
};
