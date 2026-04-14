import { Identifiable, Labeled, Typed } from "@/modules/flow/types/interfaces";
import { ObjectRepresentation } from "@/modules/flow/types/ObjectRepresentation";

export type ParameterRenderType = "str" | "int" | "float" | "bool" | "dict" | "list" | "dataSource" | "code";

export interface Parameter extends Identifiable, Labeled, Typed {
  render_type: ParameterRenderType;
  value: string;
  language?: {
    label: string;
    value: string;
  };
  objectRepresentation?: ObjectRepresentation[];
  globPattern?: string;
}
