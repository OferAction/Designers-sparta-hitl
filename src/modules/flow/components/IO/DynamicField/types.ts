import { SerializedEditorState } from "lexical";

export type DynamicFieldOnChange = (value: DynamicFieldValue) => void;
export type DynamicFieldValue = string | SerializedEditorState;
