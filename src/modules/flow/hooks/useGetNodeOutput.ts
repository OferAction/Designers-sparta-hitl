import { useCallback } from "react";

import { useReactFlow } from "@xyflow/react";

import { getNodeOutputFromReferenceId } from "../utils/getNodeOutputFromReferenceId";
import { Node } from "@/modules/flow/types";

export const useGetNodeOutputFromReferenceId = (id: `${string}.${string}` | string) => {
  const { getNode } = useReactFlow<Node>();
  return useCallback(() => getNodeOutputFromReferenceId(id, getNode), [id, getNode]);
};
