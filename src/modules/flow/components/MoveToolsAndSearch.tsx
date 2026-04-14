import React, { useCallback, useMemo, useState } from "react";

import { HandIcon, MagnifyingGlassIcon, NavigationArrowIcon } from "@phosphor-icons/react";

import { useCanvasPermissions } from "@/modules/flow/hooks/useCanvasPermissions";

import WithTooltip from "@/components/common/WithTooltip";
import { IconSplitButtonItem } from "@/components/ui/split-button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KEYBOARD_SHORTCUTS } from "@/constants";
import { cn } from "@/utils";

import Shortcut, { type ShortcutDefinition } from "@/utils/Shortcut";

type Mode = "navigation" | "hand";

interface MoveToolsAndSearchProps {
  defaultMode?: Mode;
  onModeChange?: (mode: Mode) => void;
  onSearchClick?: () => void;
}

const permissions: Parameters<typeof useCanvasPermissions>[0] = {
  canChangeNodeData: true,
  canDragOrRemoveNodes: false,
  canCreateElements: false,
  canRemoveEdges: false,
  canRunFlow: false,
  canSelectEdges: false,
  canSelectNodes: false,
};

const ReadOnlyCanvasToggle: React.FC = () => {
  useCanvasPermissions(permissions);
  return null;
};

const MoveToolsAndSearch: React.FC<MoveToolsAndSearchProps> = ({ defaultMode = "hand", onModeChange, onSearchClick }) => {
  const [mode, setMode] = useState<Mode>(defaultMode);

  const handleModeChange = useCallback(
    (value: string) => {
      const next = value as Mode;
      const body = document.body;

      if (next == "navigation") {
        body.classList.add("flow-navigation");
      } else {
        body.classList.remove("flow-navigation");
      }

      setMode(next);
      onModeChange?.(next);
    },
    [onModeChange]
  );

  const handleSearchClick = () => {
    onSearchClick?.();
  };

  const handToolShortcut = useCallback(() => handleModeChange("hand"), [handleModeChange]);
  const moveToolShortcut = useCallback(() => handleModeChange("navigation"), [handleModeChange]);

  const shortcuts = useMemo<ShortcutDefinition[]>(
    () => [
      {
        id: "move-tools-hand",
        keys: KEYBOARD_SHORTCUTS.HAND_TOOL.keys,
        handler: handToolShortcut,
        options: { preventDefault: true, enableOnFormTags: false },
      },
      {
        id: "move-tools-navigation",
        keys: KEYBOARD_SHORTCUTS.MOVE_TOOL.keys,
        handler: moveToolShortcut,
        options: { preventDefault: true, enableOnFormTags: false },
      },
    ],
    [handToolShortcut, moveToolShortcut]
  );

  return (
    <>
      <Shortcut shortcuts={shortcuts} />
      {mode === "navigation" && <ReadOnlyCanvasToggle />}
      <div className="flex items-center bg-secondary rounded-lg p-1">
        <Tabs value={mode} onValueChange={handleModeChange}>
          <TabsList className="py-1.5">
            <WithTooltip
              tooltip={
                <>
                  <span>Move</span>
                  <span className="pl-2.5 text-muted-foreground text-xs leading-5">V</span>
                </>
              }
            >
              <div>
                <TabsTrigger
                  className={cn("h-8 w-8 p-2 text-foreground group", mode === "navigation" && "bg-background")}
                  value="navigation"
                  aria-label="Move V"
                >
                  <NavigationArrowIcon size={16} weight="regular" className="group-hover:hidden group-data-[state=active]:hidden" />
                  <NavigationArrowIcon size={16} weight="fill" className="hidden group-hover:block group-data-[state=active]:block" />
                </TabsTrigger>
              </div>
            </WithTooltip>

            <WithTooltip
              tooltip={
                <>
                  <span>Hand tool</span>
                  <span className="pl-2.5 text-muted-foreground text-xs leading-5">H</span>
                </>
              }
            >
              <div>
                <TabsTrigger
                  className={cn("h-8 w-8 p-2 text-foreground group", mode === "hand" && "bg-background")}
                  value="hand"
                  aria-label="Hand tool H"
                >
                  <HandIcon size={16} weight="regular" className="group-hover:hidden group-data-[state=active]:hidden" />
                  <HandIcon size={16} weight="fill" className="hidden group-hover:block group-data-[state=active]:block" />
                </TabsTrigger>
              </div>
            </WithTooltip>
          </TabsList>
        </Tabs>
      </div>

      <div className="ml-2 flex items-center">
        <WithTooltip tooltip={<span>Search</span>}>
          <IconSplitButtonItem onClick={handleSearchClick} className="size-8" variant="ghost" aria-label="Search">
            <MagnifyingGlassIcon size={16} weight="bold" />
          </IconSplitButtonItem>
        </WithTooltip>

        {/* {showSearch && (
          <input
            ref={inputRef}
            placeholder="Search"
            className="ml-2 w-48 rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground focus:outline-none"
            aria-label="Search input"
          />
        )} */}
      </div>
    </>
  );
};

export default MoveToolsAndSearch;
export { MoveToolsAndSearch };
