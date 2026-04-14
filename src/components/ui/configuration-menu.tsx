import * as React from "react";
import { useRef, useState } from "react";

import { useLeftPanelWidth } from "@/hooks/useLeftPanelWidth";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { usePanelDialogStateContext } from "@/modules/flow/components/dialog/PanelDialogContext";
import { PortalContainerContext } from "@/modules/flow/SystemExEx/SystemRulesConfiguration/PortalContainerContext";

export type ConfigurationNavItem = {
  id: string;
  label: string;
  icon?: React.ReactNode;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  navItems: ConfigurationNavItem[];
  activeId: string;
  onNavChange: (id: string) => void;
  children: React.ReactNode;

  leftOffset?: number;
  position?: "top" | "center";
  defaultMessage?: string;
};

export function ConfigurationMenu({
  open,
  onOpenChange,
  title,
  navItems,
  activeId,
  onNavChange,
  children,
  leftOffset = 12,
  position = "top",
}: Props) {
  const [style, setStyle] = useState<React.CSSProperties>({});
  const contentRef = useRef<HTMLDivElement | null>(null);

  const { containerRef } = usePanelDialogStateContext();
  const leftPanelWidth = useLeftPanelWidth();

  React.useEffect(() => {
    const el = containerRef?.current;
    const computeAndSet = () => {
      const left = leftPanelWidth + leftOffset;
      setStyle({
        left: `${left}px`,
        right: "auto",
      });
    };

    let ro: ResizeObserver | null = null;
    if (el) {
      ro = new ResizeObserver(computeAndSet);
      ro.observe(el);
    }

    window.addEventListener("resize", computeAndSet);

    computeAndSet();

    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", computeAndSet);
    };
  }, [containerRef, leftPanelWidth, leftOffset, position]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={contentRef}
        style={style}
        data-config-menu
        className={cn("left-auto translate-x-0 translate-y-0 top-20", "p-[1px] sm:max-w-[44rem] !gap-0")}
        overlayProps={{ className: "bg-transparent" }}
      >
        <DialogHeader className="p-4 bg-sidebar border-b">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-[12rem_1fr] gap-0">
          <aside className="border-r bg-sidebar">
            <div className="p-2 border-b">
              {navItems.map((item) => {
                const active = item.id === activeId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavChange(item.id)}
                    className={cn(
                      "w-full flex items-center gap-2 rounded-md px-3 py-2.5 mb-2 text-sm transition",
                      active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    )}
                  >
                    {item.icon ? <span className="shrink-0">{item.icon}</span> : null}
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="min-h-[520px] pt-3 bg-background">
            <PortalContainerContext.Provider value={contentRef}>{children}</PortalContainerContext.Provider>
          </main>
        </div>
      </DialogContent>
    </Dialog>
  );
}
