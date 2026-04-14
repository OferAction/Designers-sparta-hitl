import { ConfigTyped, Identifiable, Labeled, Typed } from "@/modules/flow/types/interfaces";
import { ReferenceField, ReferenceNodeOutput, ReferenceParam } from "@/modules/flow/types/NodeReference";
import { ObjectRepresentation } from "@/modules/flow/types/ObjectRepresentation";

export interface IOType {
  value: string;
  label: string;
}

export interface IOField {
  value: string | ReferenceField;
  label: string;
  type: IOType;
  reference?: string;
}

export type ObjectRepresentableInputs = "str" | "input_with_type_dropdown";
export type CodeInputs = "list" | "dict";
export type InputRenderType =
  | "codeInput"
  | "dropdown"
  | "group"
  | "hidden"
  | "input_with_type_dropdown"
  | "multi_str"
  | "number"
  | "regex"
  | ObjectRepresentableInputs
  | CodeInputs;

export interface BaseInput<T, R extends InputRenderType> extends ConfigTyped, Labeled, Typed, Identifiable {
  render_type: R;
  value: T;
  options?: { label: string; value: string }[];
}

export type GroupInput = BaseInput<[], "group">;
export type StringInput = BaseInput<string, ObjectRepresentableInputs> & {
  objectRepresentation: ObjectRepresentation[];
};
export type CodeInput = BaseInput<ReferenceField, "codeInput">;
export type MultiStrInput = BaseInput<StringInput[], "multi_str">;
export type DropdownInputOptions = ReferenceField | (Labeled & Typed);
export type DropdownInput = BaseInput<DropdownInputOptions, "dropdown" | "dict" | "regex" | "number">;
export type EditorInputs = BaseInput<string, CodeInputs> & {
  language: IOType;
};
export type HiddenInput = BaseInput<any, "hidden">;
export type NodeInputs = StringInput | CodeInput | MultiStrInput | DropdownInput | HiddenInput | GroupInput;

export type Dataset = unknown[];

export type GroupOutputField = BaseInput<ReferenceNodeOutput, "dropdown">;
export type GroupOutput = BaseInput<GroupOutputField[], "group">;

export function isReferenceParam(value: NodeInputs["value"]): value is ReferenceParam {
  return typeof value === "object" && value !== null && "reference" in value && value.reference === "local_param";
}

export function isReferenceNodeOutput(value: NodeInputs["value"] | Labeled): value is ReferenceNodeOutput {
  return typeof value === "object" && "source_title" in value && "source_node_id" in value;
}

export function isReferenceField(value: NodeInputs["value"] | Labeled): value is ReferenceField {
  return typeof value === "object" && "source_title" in value;
}
