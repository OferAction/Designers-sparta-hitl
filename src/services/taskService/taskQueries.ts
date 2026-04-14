import { createApiDeleteMutation, createApiPostMutation, createApiPutMutation } from "@/api";
import API_CONFIG from "@/config/api.config";

const apiClientKey = "DEFAULT" as const;
const CONFIG = API_CONFIG[apiClientKey];

export const TRIGGER_TYPES = {
  EmailTrigger: 1,
  AzureTrigger: 2,
} as const;

export type TriggerTypeValue = (typeof TRIGGER_TYPES)[keyof typeof TRIGGER_TYPES];

export type TriggerSettings = Record<string, unknown>;
export type ActionSettings = Record<string, unknown>;

export type ActionItem = {
  type: string | number;
  configurationKey: string;
  fileId: string;
  settings: ActionSettings;
};

export type CreateTaskPayload = {
  name: string;
  repeatType: number;
  repeatValue?: number;
  repeatUnit?: number;
  timeZoneId: string;
  firstInstance?: string;
  triggers: Array<{
    type: TriggerTypeValue;
    settings: TriggerSettings;
  }>;
  actions?: ActionItem[];
};

export const createTask = () =>
  createApiPostMutation<unknown, CreateTaskPayload>(CONFIG.ENDPOINTS.TASKS, {
    mutationKey: ["createTask"],
    apiClientKey,
  });

export type UpdateTaskVariables = CreateTaskPayload & { id: string };

// PUT to update an existing task/start event; endpoint shape may be /Tasks/{id}
export const updateTask = () =>
  createApiPutMutation<unknown, UpdateTaskVariables>((vars) => `${CONFIG.ENDPOINTS.TASKS}/${vars.id}` as string, {
    mutationKey: ["updateTask"],
    apiClientKey,
  });

export type DeleteTaskVariables = { id: string };

// DELETE an existing task/start event; endpoint shape may be /Tasks/{id}
export const deleteTask = () =>
  createApiDeleteMutation<unknown, DeleteTaskVariables>((vars) => `${CONFIG.ENDPOINTS.TASKS}/${vars.id}` as string, {
    mutationKey: ["deleteTask"],
    apiClientKey,
  });

export function buildStartEventTaskPayload(args: {
  name: string;
  repeatType: number | string;
  repeatValue?: number | string;
  repeatUnit?: number | string;
  timeZoneId: string;
  firstInstance?: string;
  triggerType: TriggerTypeValue;
  settings: TriggerSettings;
  configurationKey: string;
  fileId: string;
  actions?: CreateTaskPayload["actions"];
}): CreateTaskPayload {
  const repeatTypeNumber = typeof args.repeatType === "string" ? Number(args.repeatType) : args.repeatType;
  const repeatValueNumber = args.repeatValue == null ? undefined : typeof args.repeatValue === "string" ? Number(args.repeatValue) : args.repeatValue;
  const repeatUnitNumber = args.repeatUnit == null ? undefined : typeof args.repeatUnit === "string" ? Number(args.repeatUnit) : args.repeatUnit;

  const fileId = args.fileId;
  return {
    name: args.name,
    repeatType: repeatTypeNumber,
    repeatValue: repeatValueNumber,
    repeatUnit: repeatUnitNumber,
    timeZoneId: args.timeZoneId,
    firstInstance: args.firstInstance,
    triggers: [
      {
        type: args.triggerType,
        settings: args.settings,
      },
    ],
    actions:
      args.actions && args.actions.length > 0
        ? args.actions.map((a) => ({ ...a, fileId: a.fileId || fileId }))
        : [
            {
              type: "",
              configurationKey: args.configurationKey,
              fileId,
              settings: {},
            },
          ],
  };
}

export function buildAction(type: ActionItem["type"], configurationKey: string, settings: ActionSettings, fileId?: string): ActionItem {
  return { type, configurationKey, settings, fileId: fileId || "" };
}
