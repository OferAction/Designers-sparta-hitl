import { ComponentProps, createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";

import ExitFullScreenButton from "./ExitFullScreenButton";
import { ResizablePanelGroup } from "@/components/ui/resizable";
import { cn } from "@/utils";

import Shortcut, { type ShortcutDefinition } from "@/utils/Shortcut";

import { KEYBOARD_SHORTCUTS } from "@/constants/KeyboardShortcuts";

type FullScreenContextType = {
  toggleFullScreen: () => void;
  isFullScreen: boolean;
};

const FullScreenContext = createContext<FullScreenContextType | null>(null);

export const useFullScreen = () => {
  const context = useContext(FullScreenContext);
  if (!context) {
    throw new Error("useFullScreen must be used within FlowResizablePanelGroup");
  }
  return context;
};

export default function FlowResizablePanelGroup({
  children,
  className,
  ...props
}: { children?: ReactNode; className?: string } & ComponentProps<typeof ResizablePanelGroup>) {
  const [fullScreenMode, setFullScreenMode] = useState<boolean>(false);

  const toggleFullScreen = useCallback(() => setFullScreenMode((prev) => !prev), []);
  const exitFullScreen = useCallback(() => setFullScreenMode(false), []);

  const shortcuts = useMemo<ShortcutDefinition[]>(
    () => [
      {
        id: "flow-panel-exit-fullscreen",
        keys: KEYBOARD_SHORTCUTS.ESCAPE_KEY.keys,
        handler: exitFullScreen,
        options: { preventDefault: true },
      },
      {
        id: "flow-panel-toggle-fullscreen",
        keys: KEYBOARD_SHORTCUTS.PRESENT.keys,
        handler: toggleFullScreen,
        options: { preventDefault: true },
      },
    ],
    [exitFullScreen, toggleFullScreen]
  );

  const contextValue = useMemo(() => ({ toggleFullScreen, isFullScreen: fullScreenMode }), [fullScreenMode, toggleFullScreen]);

  return (
    <FullScreenContext.Provider value={contextValue}>
      <Shortcut shortcuts={shortcuts} />
      <ResizablePanelGroup className={cn("!h-screen", fullScreenMode && "!hidden", className)} {...props}>
        {children}
      </ResizablePanelGroup>
      {fullScreenMode && <ExitFullScreenButton onExit={() => setFullScreenMode(false)} />}
    </FullScreenContext.Provider>
  );
}
