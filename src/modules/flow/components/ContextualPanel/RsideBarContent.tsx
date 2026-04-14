import { DefaultBar } from "./DefaultBar";
import { MultiLevelPianos } from "./MultiLevelPiano/MultiLevelPianos";
import { MultipleNodesPanel } from "./MultipleNodesPanel";
import RightPanelTabs from "./RightPanelTabs";
import RsideBarNodeHeader from "./RsideBarNodeHeader";
import { useSubflowContext } from "../../contexts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSelectedNode, useSelectedNodes } from "@/modules/flow/hooks";

export default function RsideBarContent() {
  const selectedNode = useSelectedNode();
  const selectedNodes = useSelectedNodes();
  const isSubflow = useSubflowContext();

  if (selectedNode) {
    return (
      <>
        <div className="flex-1 thin-scrollbar [&>div>div]:!block">
          <MultiLevelPianos />
          <RsideBarNodeHeader />
          <RightPanelTabs />
        </div>
      </>
    );
  }

  if (selectedNodes.length > 1 && !isSubflow) {
    return (
      <ScrollArea className="thin-scrollbar overflow-y-auto h-full">
        <div className="w-full">
          <MultipleNodesPanel />
        </div>
      </ScrollArea>
    );
  }

  return (
    <>
      <DefaultBar />
      <RightPanelTabs />
    </>
  );
}
