import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import ContextualPanel from "@/modules/flow/components/ContextualPanel";
import { cn } from "@/utils";

export default function RightPanelLayout({
  children = <ContextualPanel />,
  className,
  hidden,
}: {
  children?: React.ReactNode;
  className?: string;
  hidden?: boolean;
}) {
  return (
    <>
      <ResizableHandle
        className={cn(
          "hover:bg-primary/50 data-[resize-handle-state=drag]:bg-primary data-[resize-handle-state=hover]:bg-primary/50",
          "after:hover:bg-primary/50 after:data-[resize-handle-state=drag]:bg-primary after:data-[resize-handle-state=hover]:bg-primary/50 md:flex z-[20]",
          hidden && "!hidden"
        )}
      />
      <ResizablePanel defaultSize={27.6} minSize={20} maxSize={35} className={cn("flex-1 hidden md:block", hidden && "!hidden", className)}>
        <SidebarProvider open className="w-[unset] z-50 self-end h-screen">
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
      </ResizablePanel>
    </>
  );
}
