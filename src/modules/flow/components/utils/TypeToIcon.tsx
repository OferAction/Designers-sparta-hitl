import { FC } from "react";

import {
  BooleanTypeIcon as IconBoolean,
  FileTypeIcon as IconFile,
  DictionaryTypeIcon as IconDictionary,
  ListTypeIcon as IconList,
  ListOfFilesTypeIcon as IconListOfFiles,
  ListOfNumbersTypeIcon as IconListOfNumbers,
  ListOfObjectsTypeIcon as IconListOfObjects,
  ListOfStringsTypeIcon as IconListOfStrings,
  NumberTypeIcon as IconNumber,
  ObjectTypeIcon as IconObject,
  StringTypeIcon as IconString,
} from "@/lib/icons";

export const getIconForType = (type: string): FC => {
  switch (type) {
    case "String":
      return IconString;
    case "Number":
      return IconNumber;
    case "Boolean":
      return IconBoolean;
    case "File":
      return IconFile;
    case "List":
      return IconList;
    case "List of Files":
      return IconListOfFiles;
    case "List of Numbers":
      return IconListOfNumbers;
    case "List of Objects":
      return IconListOfObjects;
    case "List of Strings":
      return IconListOfStrings;
    case "Object":
      return IconDictionary;
    case "Any":
      return IconObject;
    default:
      return IconString; // Default to string icon
  }
};

interface TypeToIconProps {
  type: string;
}

export const TypeToIcon: FC<TypeToIconProps> = ({ type }) => {
  const IconComponent = getIconForType(type);
  return <IconComponent />;
};

export default TypeToIcon;
