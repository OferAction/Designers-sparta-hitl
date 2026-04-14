import { IOType } from "@/modules/flow/types/NodeInput";

export interface ConfigTyped {
  configType: string;
}
export interface Labeled {
  label: string;
}

export interface Typed {
  type: IOType;
}

export interface Identifiable {
  id: string | number;
}
