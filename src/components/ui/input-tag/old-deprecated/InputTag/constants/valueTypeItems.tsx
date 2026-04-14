import { ClockIcon, ArrowUpIcon, ArrowDownIcon } from "@phosphor-icons/react";

import {
  BooleanTypeIcon as IconBoolean,
  FileTypeIcon as IconFile,
  DictionaryTypeIcon as IconDictionary,
  ListTypeIcon as IconList,
  ListOfFilesTypeIcon as IconListOfFiles,
  NumberTypeIcon as IconNumber,
  ObjectTypeIcon as IconObject,
  PydanticTypeIcon as IconPydantic,
  StringTypeIcon as IconString,
} from "@/lib/icons";
import { NonNullableOption as Option } from "@/components/ui/input-tag/input-tag";

export const SORT_OPTIONS: Option[] = [
  {
    value: "last-modified-desc",
    label: "Last Modified (Newest)",
    icon: ClockIcon,
  },
  {
    value: "last-modified-asc",
    label: "Last Modified (Oldest)",
    icon: ClockIcon,
  },
  {
    value: "name-asc",
    label: "Name (A-Z)",
    icon: ArrowUpIcon,
  },
  {
    value: "name-desc",
    label: "Name (Z-A)",
    icon: ArrowDownIcon,
  },
];

export const VALUE_TYPE_ITEMS = [
  {
    value: "valueType",
    label: "Value Type",
    isTitle: true,
  },
  { value: "separator-1", label: "separator" },
  { value: "String", label: "String", icon: IconString },
  { value: "Number", label: "Number", icon: IconNumber },
  { value: "Boolean", label: "Boolean", icon: IconBoolean },
  { value: "File", label: "File", icon: IconFile },
  { value: "Object", label: "Dictionary", icon: IconDictionary },
  { value: "Any", label: "Object", icon: IconObject },
  { value: "separator-2", label: "separator" },
  {
    value: "Lists",
    label: "Lists",
    isSubTitle: true,
  },
  { value: "List", label: "List", icon: IconList },
  { value: "List of Files", label: "List of Files", icon: IconListOfFiles },
  {
    value: "Operators",
    label: "Operators",
    isSubTitle: true,
  },
  {
    value: "logical-operator",
    label: "Logical",
    icon: IconBoolean,
  },
  {
    value: "string-operator",
    label: "String",
    icon: IconBoolean,
  },
  {
    value: "list-operator",
    label: "List",
    icon: IconBoolean,
  },
] satisfies Option[];

export const NEW_VALUE_TYPE_ITEMS = [
  {
    value: "valueType",
    label: "Value Type",
    isTitle: true,
  },
  { value: "separator-1", label: "separator" },
  { value: "string", label: "String", icon: IconString },
  { value: "number", label: "Number", icon: IconNumber },
  { value: "boolean", label: "Boolean", icon: IconBoolean },

  { value: "separator-2", label: "separator" },

  {
    value: "logical-operator",
    label: "Logical",
    icon: IconBoolean,
  },
] satisfies Option[];

export const BOOLEAN_OPTIONS: Option[] = [
  { value: "True", label: "True", type: "Boolean" },
  {
    value: "False",
    label: "False",
    type: "Boolean",
  },
];
export const DROPDOWN_ITEMS: Option[] = [
  {
    value: "True",
    label: "True",
    type: "Boolean",
  },
  {
    value: "False",
    label: "False",
    type: "Boolean",
  },

  {
    value: "last-modified",
    label: "Last Modified",
    type: "String",
  },
  {
    value: "name-ascending",
    label: "Name Ascending",
    type: "String",
  },
  {
    value: "name-descending",
    label: "Name Descending",
    type: "String",
  },
  {
    value: "100",
    label: "100",
    type: "Number",
  },
  {
    value: "200",
    label: "200",
    type: "Number",
  },
  {
    value: ">",
    keywords: [">"],
    label: "greater than",
    type: "logical-operator",
  },
  {
    value: "<",
    keywords: ["<"],
    label: "less than",
    type: "logical-operator",
  },
  {
    label: "equals to",
    value: "==",
    keywords: ["==", "equal"],
    type: "logical-operator",
  },
  {
    label: "not equal to",
    value: "!=",
    keywords: ["!=", "not equal"],
    type: "logical-operator",
  },
  {
    label: "and",
    value: "and",
    keywords: ["and", "&&"],
    type: "logical-operator",
  },
  {
    label: "or",
    value: "or",
    keywords: ["or", "||"],
    type: "logical-operator",
  },
  {
    label: "not",
    value: "not",
    keywords: ["not", "!"],
    type: "logical-operator",
  },
];

export const getDropdownItemsByType = (type: string): Option[] => {
  const typeItems = DROPDOWN_ITEMS.filter((item) => item.type === type);
  return typeItems;
};

// Base value type items used across the application
export const VALUE_TYPE_ITEMS_ENHANCHED = [
  {
    label: "",
    value: "",
    children: [
      { value: "String", label: "String", icon: IconString },
      { value: "Number", label: "Number", icon: IconNumber },
      { value: "Float", label: "Float", icon: IconNumber },
      { value: "Boolean", label: "Boolean", icon: IconBoolean },
      { value: "File", label: "File", icon: IconFile },
      { value: "Any", label: "Object", icon: IconObject },
      { value: "Object", label: "Dictionary", icon: IconDictionary },
    ],
  },
  {
    label: "Lists",
    value: "Lists",
    children: [
      { value: "List", label: "List" },
      { value: "List of Files", label: "List of Files" },
    ],
  },
  {
    label: "Operators",
    value: "Operators",
    children: [
      { value: "logical-operator", label: "Logical" },
      { value: "string-operator", label: "String" },
      { value: "list-operator", label: "List" },
    ],
  },
] satisfies Option[];

/**
 * Value type items for start node - extends base items with Pydantic Model
 * Adds Pydantic Model support to the first category
 */
export const VALUE_TYPE_ITEMS_START = [
  {
    ...VALUE_TYPE_ITEMS_ENHANCHED[0],
    children: [...VALUE_TYPE_ITEMS_ENHANCHED[0].children, { value: "Pydantic", label: "Pydantic", icon: IconPydantic }],
  },
  VALUE_TYPE_ITEMS_ENHANCHED[1],
] satisfies Option[];
