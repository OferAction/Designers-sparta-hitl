import { ConditionType } from "@/modules/flow/types";

import { genId } from "@/utils/IdGenerator";

export const getConditionId = (nodeId: string, condition: ConditionType) => {
  return `node-${nodeId}-condition-${condition.type.toLowerCase() === "else" ? "else" : genId()}`;
};
