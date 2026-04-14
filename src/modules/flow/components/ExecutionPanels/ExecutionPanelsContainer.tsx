import { ReactNode, useMemo, Children } from "react";

import { useShallow } from "zustand/shallow";

import { useIterationPathForNode } from "../../hooks/useIteratorPath";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import { LogsWrapper } from "@/modules/flow/components/ExecutionPanels/LogsWrapper";
import { useGetNodeLogs } from "@/modules/flow/services";
import { FlowStoreState, useFlowStore } from "@/store";

const selector = (state: FlowStoreState) => ({
  selectedNodeId: state.selectedNodeId,
  jobId: state.jobId,
  nodes: state.nodes,
});

const LogsSection = () => {
  const { selectedNodeId, jobId, nodes } = useFlowStore(useShallow(selector));

  const startNode = useMemo(() => nodes.find((node) => node.data.type === "start"), [nodes]);

  const displayNodeId = selectedNodeId || (jobId ? startNode?.id : null);
  const iterationPath = useIterationPathForNode(selectedNodeId || undefined);
  const { data: nodeLogs, isLoading: logsLoading } = useGetNodeLogs(jobId, displayNodeId || "", iterationPath);

  return <LogsWrapper data={nodeLogs || { totalCount: 0, items: [], maxIterations: [], iterations: [] }} isLoading={logsLoading} />;
};

export interface ExecutionPanelsContainerProps {
  children: ReactNode;
  className?: string;
  onHeightChange?: (height: number) => void;
  count?: number;
}

const layoutSelector = (state: FlowStoreState) => ({
  rootSizes: state.panelLayoutRoot,
  logsSizes: state.panelLayoutLogs,
  setRoot: state.setPanelLayoutRoot,
  setLogs: state.setPanelLayoutLogs,
  setHorizontal: state.setPanelLayoutHorizontal,
});

export function ExecutionPanelsContainer({ children, className, count }: ExecutionPanelsContainerProps) {
  const selectedNodeId = useFlowStore((state) => state.selectedNodeId);
  const hasLogs = Boolean(selectedNodeId);

  const { rootSizes, setHorizontal, logsSizes, setRoot, setLogs } = useFlowStore(useShallow(layoutSelector));
  const ensureHorizontalCount = useFlowStore((s) => s.ensurePanelHorizontalCount);

  const childrenCount = count ?? Children.count(children);
  ensureHorizontalCount(childrenCount);

  const handleRootLayout = (layout: number[]) => setRoot(layout);
  const handleLogsLayout = (layout: number[]) => setLogs(layout);

  return (
    <div className={cn("absolute bottom-0 left-0 right-0 top-0 z-[15] pointer-events-none group/panel-container", className)}>
      <ResizablePanelGroup direction="vertical" onLayout={handleRootLayout}>
        <ResizablePanel defaultSize={rootSizes[0]} minSize={10} className="pointer-events-none" />

        <div className="pt-1 pointer-events-auto">
          <ExecutionPanelHandle />
        </div>

        <ResizablePanel defaultSize={rootSizes[1]} minSize={20} maxSize={80}>
          <div className="h-full pointer-events-auto">
            {hasLogs ? (
              <ResizablePanelGroup direction="vertical" className="h-full" onLayout={handleLogsLayout}>
                {/* Main Panels Section (Inputs, Outputs, Ground Truth) */}
                <ResizablePanel defaultSize={logsSizes[0]} minSize={35} maxSize={85}>
                  <div className="overflow-hidden bg-background h-full">
                    <ResizablePanelGroup direction="horizontal" className="h-full" onLayout={(layout) => setHorizontal(layout)}>
                      {children}
                    </ResizablePanelGroup>
                  </div>
                </ResizablePanel>

                {/* Resizable Handle between main panels and logs */}
                <ExecutionPanelHandle />

                <ResizablePanel defaultSize={logsSizes[1]} minSize={15} maxSize={70}>
                  <div className="overflow-hidden bg-background h-full">
                    <LogsSection />
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            ) : (
              <div className="overflow-hidden bg-background h-full">
                <ResizablePanelGroup direction="horizontal" className="h-full" onLayout={(layout) => setHorizontal(layout)}>
                  {children}
                </ResizablePanelGroup>
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

interface PanelWrapperProps {
  children: ReactNode;
  index?: number;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
}

export function PanelWrapper({ children, index, defaultSize = 33, minSize = 24, maxSize = 80 }: PanelWrapperProps) {
  const horizontalLayouts = useFlowStore((s) => s.panelLayoutHorizontal);
  const appliedSize = index !== undefined && horizontalLayouts[index] !== undefined ? horizontalLayouts[index] : defaultSize;
  return (
    <ResizablePanel defaultSize={appliedSize} minSize={minSize} maxSize={maxSize}>
      {children}
    </ResizablePanel>
  );
}

export function ExecutionPanelHandle() {
  return (
    <ResizableHandle
      className={cn(
        "hover:bg-primary/50 data-[resize-handle-state=drag]:bg-primary data-[resize-handle-state=hover]:bg-primary/50",
        "after:hover:bg-primary/50 after:data-[resize-handle-state=drag]:bg-primary after:data-[resize-handle-state=hover]:bg-primary/50 md:flex z-[20]"
      )}
    />
  );
}

export { ResizableHandle };
