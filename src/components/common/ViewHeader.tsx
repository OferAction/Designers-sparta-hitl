import { ListIcon, SquaresFourIcon } from "@phosphor-icons/react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/modules/workspace/store";

export function ViewHeader() {
  const viewMode = useWorkspaceStore((state) => state.viewMode);
  const setViewMode = useWorkspaceStore((state) => state.setViewMode);
  // const [sortOption, setSortOption] = useState<Option>(null);

  return (
    <header className="w-full border-sidebar-border text-sidebar-accent-foreground py-2 px-12 min-h-16 flex items-center justify-end gap-2">
      {/* <div className="flex flex-row items-start gap-2 w-full">
        <h2 className="text-muted-foreground font-sans font-normal text-sm leading-5">Sort by:</h2>
        <InputTag.Root variant="emphasized">
          <SelectTag selectedOption={sortOption} onOptionChange={setSortOption} options={SORT_OPTIONS} hasDropdownArrow />
        </InputTag.Root>
      </div> */}
      <ToggleGroup
        type="single"
        onValueChange={(value: "CardView" | "ListView") => {
          if (value) {
            setViewMode(value);
          }
        }}
        value={viewMode}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                value="CardView"
                className={cn("py-2 px-2.5 rounded-md", viewMode === "CardView" ? "bg-accent text-accent-foreground" : "bg-transparent")}
              >
                <SquaresFourIcon size={16} weight="regular" />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>Card View</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                value="ListView"
                className={cn("py-2 px-2.5 rounded-md", viewMode === "ListView" ? "bg-accent text-accent-foreground" : "bg-transparent")}
              >
                <ListIcon size={16} weight="regular" />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>List View</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </ToggleGroup>
    </header>
  );
}
