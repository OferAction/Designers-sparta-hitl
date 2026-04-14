import { PlaceholderIcon } from "@phosphor-icons/react";

import { CommandItem } from "@/components/ui/command";
import { cn } from "@/utils";

import { NODE_ICONS_MAP } from "@/constants/NodesConstants";

type CommandOption = {
  label: string;
  value?: string;
  onSelect: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  typeName?: string;
};

type CommandSection = {
  title: string;
  options: CommandOption[];
};

export function CommandNodeSections({ sections, className }: { sections: CommandSection[]; className?: string }) {
  return (
    <div className={cn(className)}>
      {sections.map((section) => (
        <div key={section.title} className="px-3 py-2">
          <div className="text-xs text-muted-foreground mb-2">{section.title}</div>
          <div className="flex flex-col">
            {section.options.map((opt, idx) => {
              const IconComp = opt.icon ?? (opt.typeName ? NODE_ICONS_MAP(opt.typeName) : undefined) ?? PlaceholderIcon;
              return (
                <CommandItem
                  key={`${section.title}-${idx}-${opt.label}`}
                  value={opt.value ?? opt.label}
                  onSelect={opt.onSelect}
                  className="px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <IconComp className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate text-sm text-muted-foreground">{opt.label}</span>
                  </div>
                </CommandItem>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default CommandNodeSections;
