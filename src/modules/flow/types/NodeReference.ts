import { Labeled, Typed } from "@/modules/flow/types/interfaces";

export type ReferenceNodeOutput = Labeled &
  Typed & {
    source_title: string;
    source_node_id: string;
    value: string;
  };

export type ReferenceParam = Labeled &
  Typed & {
    reference: "local_param";
    value: string;
    source_title: string;
  };
export type ReferenceField = ReferenceNodeOutput | ReferenceParam;
