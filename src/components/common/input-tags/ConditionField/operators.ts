import { Option } from "@/components/ui/input-tag";

export const GROUPED_OPERATORS: NonNullable<Option>[] = [
  {
    value: "Text Matching",
    label: "Text Matching",
    id: "text-matching",
    type: "category",
    children: [
      { value: "==", label: "Equals", id: "==", type: "operator", keywords: ["equals", "equal", "=", "match", "same"] },
      { value: "!=", label: "Does Not Equal", id: "!=", type: "operator", keywords: ["not equal", "!=", "<>", "different", "neq"] },

      // Python membership
      { value: "in", label: "In", id: "in", type: "operator", keywords: ["contains", "includes", "has"] },
      { value: "not in", label: "Not in", id: "not in", type: "operator", keywords: ["not contains", "excludes", "exclude"] },

   ],
  },

  {
    value: "Numeric Comparison",
    label: "Numeric Comparison",
    id: "numeric-comparison",
    type: "category",
    children: [
      { value: ">", label: "Greater Than", id: ">", type: "operator", keywords: [">", "gt", "greater", "larger", "more than"] },
      { value: ">=", label: "Greater Than or Equal To", id: ">=", type: "operator", keywords: [">=", "gte", "greater or equal", "at least"] },
      { value: "<", label: "Less Than", id: "<", type: "operator", keywords: ["<", "lt", "less", "smaller", "fewer"] },
      { value: "<=", label: "Less Than or Equal To", id: "<=", type: "operator", keywords: ["<=", "lte", "less or equal", "at most"] },
    ],
  },

  {
    value: "Boolean Evaluation",
    label: "Boolean Evaluation",
    id: "boolean-evaluation",
    type: "category",
    children: [
      { value: "and", label: "AND", id: "and", type: "operator", keywords: ["and", "&&"] },
      { value: "or", label: "OR", id: "or", type: "operator", keywords: ["or", "||"] },
      { value: "not", label: "NOT", id: "not", type: "operator", keywords: ["not", "!"] },
    ],
  },

  {
    value: "Null / Existence",
    label: "Null / Existence",
    id: "null-existence",
    type: "category",
    children: [
      // existence in Python is usually None-check
      { value: "is not None", label: "Exists", id: "is not None", type: "operator", keywords: ["exists", "defined", "present", "set"] },
      { value: "is None", label: "Does Not Exist", id: "is None", type: "operator", keywords: ["not exists", "missing", "undefined", "null"] },
    ],
  },
];
