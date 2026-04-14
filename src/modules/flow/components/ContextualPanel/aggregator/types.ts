import { NodeVariant } from "@/modules/flow/types";

export type Outputs = NodeVariant<"aggregator", "aggregator">["data"]["outputs"];
export type Child = Outputs[number]["children"][number];
