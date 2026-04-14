import { IOType } from "@/modules/flow/types/NodeInput";

export type ObjectRepresentationTypes = "output_ref" | "local_param" | "text";
// TODO-debt: text doesn't have stringRepresentation
export type ObjectRepresentation = {
  stringRepresentation?: string;
  type: ObjectRepresentationTypes;
  value: string;
};

export type hasObjectRepresentation = {
  objectRepresentation: ObjectRepresentation[];
  type?: IOType;
};
