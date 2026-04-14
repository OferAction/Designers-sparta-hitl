import { OnConnect, OnDelete, OnEdgesChange, OnNodesChange } from "@xyflow/react";
import initMitt from "mitt";

import { Node } from "@/modules/flow/types";

export type Events = {
  "flow:connect": Parameters<OnConnect>[0];
  "flow:delete": Parameters<OnDelete>[0];
  "flow:node:add": Partial<Node> & Pick<Node, "id">;
  "flow:node:change": Parameters<OnNodesChange>[0];
  "flow:node:resize": string; // Node ID
  "flow:node:resize-end": string; // Node ID
  "flow:node:update-extent": string; // Node ID
  "flow:edge:change": Parameters<OnEdgesChange>[0];
  "node:double-click:focus-label": { nodeId: string };
  "canvas:shortcuts-panel": boolean;
};

export const mitt = initMitt<Events>();
