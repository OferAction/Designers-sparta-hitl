import { useCallback, useEffect, useMemo, useState } from "react";

import { CommandIcon, XIcon } from "@phosphor-icons/react";

import { KEYBOARD_SHORTCUTS } from "../../constants/KeyboardShortcuts";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mitt } from "@/lib/mitt";

import Shortcut, { type ShortcutDefinition } from "@/utils/Shortcut";

type ShortcutCategory = {
  id: string;
  name: string;
  shortcuts: { action: string; shortcutKey: keyof typeof KEYBOARD_SHORTCUTS }[];
};

const shortcutCategories: ShortcutCategory[] = [
  {
    id: "essentials",
    name: "Essentials",
    shortcuts: [
      { action: "New workflow", shortcutKey: "NEW_WORKFLOW" },
      // { action: "Move tool", shortcutKey: "MOVE_TOOL" },
      { action: "Zoom in", shortcutKey: "ZOOM_IN" },
      { action: "Undo", shortcutKey: "UNDO" },
      // { action: "Hand tool", shortcutKey: "HAND_TOOL" },
      { action: "Zoom out", shortcutKey: "ZOOM_OUT" },
      { action: "Redo", shortcutKey: "REDO" },
      { action: "Fit to Screen", shortcutKey: "FIT_TO_SCREEN" },
      { action: "Present", shortcutKey: "PRESENT" },
    ],
  },
  {
    id: "file-handling",
    name: "File handling",
    shortcuts: [
      { action: "New workflow", shortcutKey: "NEW_WORKFLOW" },
      { action: "Undo", shortcutKey: "UNDO" },
      { action: "Redo", shortcutKey: "REDO" },
    ],
  },
  {
    id: "navigation",
    name: "Navigation",
    shortcuts: [
      { action: "Open node panel", shortcutKey: "NODES_TEMPLATE_MENU" },
      { action: "Open Subflow panel", shortcutKey: "SUBFLOW_TEMPLATE_MENU" },
      { action: "Open connector panel", shortcutKey: "CONNECTOR_TEMPLATE_MENU" },
      { action: "Global rules", shortcutKey: "SYSTEM_RULES_PANEL" },
      { action: "Evaluation", shortcutKey: "EVALUATION_PANEL" },
      { action: "Dataset", shortcutKey: "DATASET_PANEL" },
      { action: "Monitor", shortcutKey: "MONITORING_PANEL" },
    ],
  },
  {
    id: "view-selection",
    name: "View & Selection",
    shortcuts: [
      { action: "Zoom in", shortcutKey: "ZOOM_IN" },
      { action: "Zoom out", shortcutKey: "ZOOM_OUT" },
      { action: "Fit to Screen", shortcutKey: "FIT_TO_SCREEN" },
      { action: "Present", shortcutKey: "PRESENT" },
      { action: "Zoom to fit selection", shortcutKey: "ZOOM_TO_FIT" },
      { action: "Zoom to 50%", shortcutKey: "ZOOM_PRESET_50" },
      { action: "Zoom to 100%", shortcutKey: "ZOOM_PRESET_100" },
      { action: "Zoom to 200%", shortcutKey: "ZOOM_PRESET_200" },
      { action: "Select all nodes", shortcutKey: "SELECT_ALL" },
      { action: "Select next node", shortcutKey: "SELECT_NEXT_NODE" },
      { action: "Select previous node", shortcutKey: "SELECT_PREVIOUS_NODE" },
    ],
  },
  {
    id: "edit",
    name: "Edit",
    shortcuts: [
      { action: "Copy node", shortcutKey: "COPY_NODE" },
      { action: "Paste node", shortcutKey: "PASTE_NODE" },
      { action: "Duplicate node", shortcutKey: "DUPLICATE_NODE" },
      { action: "Replace with clipboard", shortcutKey: "REPLACE_WITH_CLIPBOARD" },
      { action: "Copy properties", shortcutKey: "COPY_NODE_PROPERTIES" },
      { action: "Paste properties", shortcutKey: "PASTE_NODE_PROPERTIES" },
      { action: "Create subflow", shortcutKey: "CREATE_SUBFLOW" },
      { action: "Run till here", shortcutKey: "RUN_PATH" },
    ],
  },
];

export function ShortcutsPanel() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleShortcutsPanel = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const handler = (event: boolean) => setIsOpen(event);
    mitt.on("canvas:shortcuts-panel", handler);
    return () => {
      mitt.off("canvas:shortcuts-panel", handler);
    };
  }, []);
  const shortcuts = useMemo<ShortcutDefinition[]>(
    () => [
      {
        id: "shortcuts-panel-toggle",
        keys: KEYBOARD_SHORTCUTS.SHORTCUTS_PANEL.keys,
        handler: toggleShortcutsPanel,
      },
      {
        id: "shortcuts-panel-close",
        keys: KEYBOARD_SHORTCUTS.ESCAPE_KEY.keys,
        handler: handleClose,
      },
    ],
    [handleClose, toggleShortcutsPanel]
  );

  return (
    <>
      <Shortcut shortcuts={shortcuts} />
      {!isOpen ? null : (
        <div
          className="fixed bottom-0 left-0 right-0 bg-background z-50 h-[300px] border-t border-secondary shadow-lg animate-in 
    transition-all duration-200
    slide-in-from-bottom  flex flex-col"
        >
          <Tabs defaultValue="essentials" className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-center pt-1.5 ">
              <TabsList className="text-sm bg-transparent p-0 gap-2 border-b-secondary border-b w-full rounded-none ">
                {shortcutCategories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="bg-transparent text-muted-foreground font-semibold data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent data-[state=active]:shadow-none pb-2 hover:border-b-primary/30"
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              <Button onClick={handleClose} variant="ghost" size="icon" className="absolute right-4 top-2 h-2 w-2">
                <XIcon />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
              {shortcutCategories.map((category) => (
                <TabsContent key={category.id} value={category.id} className="mt-0">
                  <div className="grid grid-cols-3 gap-x-10 w-[50vw] min-w-[600px]">
                    {category.shortcuts.map((shortcut, index) => (
                      <div key={index} className="flex items-center justify-between py-2 ">
                        <span className="text-sm text-popover-foreground">{shortcut.action}</span>
                        <div className="flex items-center gap-1">
                          {KEYBOARD_SHORTCUTS[shortcut.shortcutKey].display.map((key, keyIndex) => (
                            <kbd
                              key={keyIndex}
                              className="flex items-center justify-center min-w-8 h-8 px-2 text-xs font-inter text-muted-foreground bg-transparent border border-muted rounded-md"
                            >
                              {key === "⌘" ? <CommandIcon size={14} className="text-muted-foreground" /> : key}
                            </kbd>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>
      )}
    </>
  );
}
