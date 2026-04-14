import { CommandSeparator } from "@/components/ui/command";
import { InputTag, Option } from "@/components/ui/input-tag";

const CommandItem = ({ option }: { option: NonNullable<Option> }) => {
  return (
    <InputTag.CommandItem option={option}>
      {option.icon && <option.icon className="size-4" />}
      {option.label}
    </InputTag.CommandItem>
  );
};

/**
 * Recursively renders options with support for nested groups.
 * This component handles flat options, grouped options, and nested groups.
 */
export const CommandItemRenderer = ({ option, isFirst }: { option: NonNullable<Option>; isFirst: boolean }) => {
  // Flat option without children
  if (!option.children) {
    return <CommandItem key={option.value} option={option} />;
  }

  // Check if this group has nested groups (children with their own children)
  const hasNestedGroups = option.children.some((child) => child.children && child.children.length > 0);

  if (hasNestedGroups) {
    // Separate regular items from nested groups
    const regularChildren = option.children.filter((child) => !child.children || child.children.length === 0);
    const nestedGroups = option.children.filter((child) => child.children && child.children.length > 0);

    return (
      <div key={option.value}>
        {!isFirst && <CommandSeparator />}
        <InputTag.CommandGroup heading={option.label}>
          {regularChildren.map((child) => (
            <CommandItem key={child.value} option={child} />
          ))}
          {nestedGroups.map((group, index) => (
            <CommandItemRenderer key={group.value} option={group} isFirst={index === 0} />
          ))}
        </InputTag.CommandGroup>
      </div>
    );
  }

  // Standard flat group
  return (
    <div key={option.value}>
      {!isFirst && <CommandSeparator />}
      <InputTag.CommandGroup heading={option.label}>
        {option.children.map((child) => (
          <CommandItem key={child.value} option={child} />
        ))}
      </InputTag.CommandGroup>
    </div>
  );
};
