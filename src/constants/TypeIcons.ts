import {
  BooleanTypeIcon,
  DictionaryTypeIcon,
  FileTypeIcon,
  ListOfFilesTypeIcon,
  ListOfNumbersTypeIcon,
  ListOfObjectsTypeIcon,
  ListOfStringsTypeIcon,
  ListTypeIcon,
  NumberTypeIcon,
  ObjectTypeIcon,
  PydanticTypeIcon,
  StringTypeIcon,
} from "@/lib/icons";
import { NodeInputOutputType } from "@/modules/flow/types";

const VALUE_ICONS = {
  String: StringTypeIcon,
  Number: NumberTypeIcon,
  Float: NumberTypeIcon,
  Boolean: BooleanTypeIcon,
  File: FileTypeIcon,
  Dictionary: DictionaryTypeIcon,
  Any: ObjectTypeIcon,
  Object: DictionaryTypeIcon,
  Integer: NumberTypeIcon,
  List: ListTypeIcon,
  "List of Strings": ListOfStringsTypeIcon,
  "List of Numbers": ListOfNumbersTypeIcon,
  "List of Booleans": null,
  "List of Objects": ListOfObjectsTypeIcon,
  "List of Files": ListOfFilesTypeIcon,
  Pydantic: PydanticTypeIcon,
  Undefined: null,
} satisfies Record<NodeInputOutputType["type"], React.ElementType | null>;

export const VALUE_ICONS_MAP = (type?: string) => VALUE_ICONS[type as keyof typeof VALUE_ICONS] ?? ObjectTypeIcon;
