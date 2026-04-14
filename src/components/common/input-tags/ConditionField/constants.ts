export interface ValidationError {
  message: string;
  index?: number;
}

export interface ValidationResult {
  errors: ValidationError[];
}

export type Part = { type: "text" | "variable" | "operator" | "function"; value: string; id?: string };

// Equality operators that require type matching
export const EQUALITY_OPERATORS = new Set(["==", "!=", "is", "is not"]);
export const COMPARISON_OPERATORS = new Set([">", ">=", "<", "<="]);

export const LOGICAL_OPERATORS = new Set(["and", "or"]);
export const UNARY_OPERATORS = new Set(["not"]);

// Map opening to closing characters
export const PAREN_MAP: Record<string, string> = {
  "(": ")",
  "[": "]",
  "{": "}",
};

// Functions that can start a condition
export const FUNCTION_SET = new Set([
  "nofunction",
  "len",
  "empty",
  "notempty",
  "str",
  "int",
  "float",
  "bool",
  "type",
  "list",
  "dict",
  "set",
  "tuple",
  "isinstance",
]);

export const FUNCTION_RETURN_TYPES: Record<string, string> = {
  len: "number",
  empty: "boolean",
  notempty: "boolean",
  str: "string",
  int: "number",
  float: "number",
  bool: "boolean",
  type: "string",
  list: "string", // Type constructor, returns type name
  dict: "string",
  set: "string",
  tuple: "string",
  isinstance: "boolean",
};
