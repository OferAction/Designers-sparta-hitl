export const RELEVANT_MATCHES = [
  {
    label: "Any",
    value: "any",
  },
  {
    label: "First",
    value: "first",
  },
  {
    label: "Last",
    value: "last",
  },
];

export const OPERATOR_MAPPINGS = {
  bool: [
    { value: "==", label: "is" },
    { value: "!=", label: "is not" },
  ],
  str: [
    { value: "==", label: "equals" },
    { value: "!=", label: "does not equal" },
    { value: "startswith", label: "starts with" },
    { value: "endswith", label: "ends with" },
    { value: "in", label: "contains" },
    { value: "not in", label: "does not contain" },
    { value: "re.match", label: "matches" },
    { value: "not re.match", label: "does not match" },
    { value: '== ""', label: "is empty" },
    { value: '!= ""', label: "is not empty" },
  ],
  number: [
    { value: "==", label: "is" },
    { value: "!=", label: "is not" },
    { value: ">", label: "greater than" },
    { value: "<", label: "less than" },
    { value: ">=", label: "greater than or equal to" },
    { value: "<=", label: "less than or equal to" },
  ],
  integer: [
    { value: "==", label: "is" },
    { value: "!=", label: "is not" },
    { value: ">", label: "greater than" },
    { value: "<", label: "less than" },
    { value: ">=", label: "greater than or equal to" },
    { value: "<=", label: "less than or equal to" },
  ],
  int: [
    { value: "==", label: "is" },
    { value: "!=", label: "is not" },
    { value: ">", label: "greater than" },
    { value: "<", label: "less than" },
    { value: ">=", label: "greater than or equal to" },
    { value: "<=", label: "less than or equal to" },
  ],
  float: [
    { value: "==", label: "is" },
    { value: "!=", label: "is not" },
    { value: ">", label: "greater than" },
    { value: "<", label: "less than" },
    { value: ">=", label: "greater than or equal to" },
    { value: "<=", label: "less than or equal to" },
  ],
  dict: [
    { value: "in", label: "contains" },
    { value: "not in", label: "does not contain" },
    { value: "==", label: "length equals" },
    { value: "<", label: "length less than" },
    { value: ">", label: "length greater than" },
    { value: "is_empty", label: "is empty" },
    { value: "is_not_empty", label: "is not empty" },
  ],
  list: [
    { value: "in", label: "contains" },
    { value: "not in", label: "does not contain" },
    { value: "==", label: "length equals" },
    { value: "<", label: "length less than" },
    { value: ">", label: "length greater than" },
    { value: "is_empty", label: "is empty" },
    { value: "is_not_empty", label: "is not empty" },
  ],
};

export const ParameterLanguageOptions = [
  // yaml and json
  {
    label: "YAML",
    value: "yaml",
  },
  {
    label: "JSON",
    value: "json",
  },
];

export const ParameterTypeOptions = [
  { value: "str", label: "String" },
  { value: "int", label: "Integer" },
  { value: "float", label: "Float" },
  { value: "bool", label: "Boolean" },
  { value: "dict", label: "Dictionary" },
  { value: "list", label: "List" },
];

export const MESSAGE_STATUS_OPTIONS = ["all", "read", "unread"] as const;
export const HAS_ATTACHMENTS_OPTIONS = ["Both", "Yes", "No"] as const;
export const ALLOWED_FILE_TYPES_OPTIONS = ["All", "PDF", "DOCX", "JPG", "PNG", "XLSX", "CSV", "ZIP"] as const;
export const MAX_EMAILS_TO_RETURN_OPTIONS = [10, 20, 50, 100, 200] as const;
