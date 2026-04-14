import { useCallback, useMemo } from "react";

import { PanelDialogWrapper } from "../components/dialog/PanelDialogWrapper";
import { usePanelDialogContext } from "@/modules/flow/components";
import { RunDialog } from "@/modules/flow/components/ContextualPanel/RunDialog/RunDialog";
import { useFlowStore } from "@/store";
import { checkCanvasPermission } from "@/store/slices";

export const useRunHandlers = () => {
  const { openDialog } = usePanelDialogContext();
  const { mode, setMode } = useFlowStore((state) => ({ mode: state.mode, setMode: state.setMode }));

  const handleRunSingleNode = useCallback(
    (nodeId?: string) => {
      if (!checkCanvasPermission("canRunFlow")) return;
      if (mode !== "run") {
        setMode("run");
      }

      openDialog(
        <PanelDialogWrapper className="max-w-[850px] w-[850px] py-0 !top-2 bg-transparent overflow-hidden  ">
          <RunDialog initialSelectedNode={nodeId} scope="run-node" />
        </PanelDialogWrapper>
      );
    },
    [openDialog, mode, setMode]
  );

  const handleRunPath = useCallback(
    (nodeId?: string, initialSource?: string) => {
      if (!checkCanvasPermission("canRunFlow")) return;
      if (mode !== "run") {
        setMode("run");
      }

      openDialog(
        <PanelDialogWrapper className="max-w-[850px] w-[850px] py-0 !top-2 bg-transparent overflow-hidden  ">
          <RunDialog initialSelectedNode={nodeId} scope="run-path" initialSource={initialSource} />
        </PanelDialogWrapper>
      );
    },
    [openDialog, mode, setMode]
  );

  return useMemo(() => ({ handleRunSingleNode, handleRunPath }), [handleRunPath, handleRunSingleNode]);
};
