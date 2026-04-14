export { InputTagRoot as Root, useInputTagContext } from "./input-tag";
export { InputTagList as List, InputTagTrigger as Trigger } from "./input-tag-list";
export { InputTagContent as Content, InputTagGroup as Group, InputTagItem as Item } from "./input-tag-content";

export {
  InputTagCommand as Command,
  InputTagInput as Input,
  InputTagCommandList as CommandList,
  InputTagCommandEmpty as CommandEmpty,
  InputTagCommandGroup as CommandGroup,
  InputTagCommandItem as CommandItem,
  InputTagCommandSeparator as CommandSeparator,
} from "./input-tag-command";

import { InputTagRoot } from "./input-tag";
import {
  InputTagCommand,
  InputTagInput,
  InputTagCommandList,
  InputTagCommandEmpty,
  InputTagCommandGroup,
  InputTagCommandItem,
  InputTagCommandSeparator,
} from "./input-tag-command";
import { InputTagContent, InputTagGroup, InputTagItem, InputTagLabel, InputTagGroupTitle } from "./input-tag-content";
import { InputTagList, InputTagTrigger } from "./input-tag-list";

export const InputTag = {
  Root: InputTagRoot,
  List: InputTagList,
  Trigger: InputTagTrigger,
  Content: InputTagContent,
  Group: InputTagGroup,
  Item: InputTagItem,
  Label: InputTagLabel,
  GroupTitle: InputTagGroupTitle,
  Command: InputTagCommand,
  Input: InputTagInput,
  CommandList: InputTagCommandList,
  CommandEmpty: InputTagCommandEmpty,
  CommandGroup: InputTagCommandGroup,
  CommandItem: InputTagCommandItem,
  CommandSeparator: InputTagCommandSeparator,
};

export { type Option, type NonNullableOption } from "./input-tag";
