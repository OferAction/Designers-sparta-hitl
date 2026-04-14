import { useEffect } from "react";

import { CloudCheckIcon, SpinnerIcon } from "@phosphor-icons/react";

import useOfflineStatus from "@/hooks/useOfflineStatus";

import { CloudArrowUpIcon as CloudArrowUp } from "@/lib/icons";
import { useCollaborativeStore } from "@/store";

const SavedIndicator = () => {
  const setSaveStatus = useCollaborativeStore((state) => state.setSaveStatus);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSaveStatus("");
    }, 10000);

    return () => clearTimeout(timer);
  }, [setSaveStatus]);

  return (
    <>
      <CloudCheckIcon size={20} className="animate-flow-status-opacity" />
      <span className="text-xs">Saved</span>
    </>
  );
};

const statusIndicators = [
  {
    useCondition: () => useOfflineStatus().isOffline,
    render: () => <CloudArrowUp className="size-5 text-destructive animate-flow-status-opacity" />,
  },
  {
    useCondition: () => useCollaborativeStore((state) => state.saveStatus === "save_started"),
    render: () => (
      <span className="animate-flow-status-opacity">
        <SpinnerIcon size={20} className="animate-spin" />
      </span>
    ),
  },
  {
    useCondition: () => useCollaborativeStore((state) => state.saveStatus === "save_failed"),
    render: () => (
      <>
        <span className="text-xs"> Save Failed</span>
        <CloudArrowUp className="size-5 animate-flow-status-opacity" />
      </>
    ),
  },
  {
    useCondition: () => useCollaborativeStore((state) => state.saveStatus === "save_succeeded"),
    render: SavedIndicator,
  },
];

const StatusIndicator = ({ indicator }: { indicator: (typeof statusIndicators)[0] }) => {
  const shouldShow = indicator.useCondition();
  const RenderComponent = indicator.render;
  if (!shouldShow) return null;
  return (
    <div className="flex items-center gap-2 pointer-events-auto text-sm text-muted-foreground text-nowrap">
      <RenderComponent />
    </div>
  );
};

export default function FlowStatus() {
  return (
    <>
      {statusIndicators.map((indicator, index) => (
        <StatusIndicator indicator={indicator} key={index} />
      ))}
    </>
  );
}
