import { useEffect, useRef, useCallback } from "react";

import { useReactFlow, useStoreApi } from "@xyflow/react";

import {
  useCopyNode,
  usePasteNode,
  useDuplicateNode,
  useReplaceWithClipboard,
  useCreateSubflowHotkey,
  useRunPathHotkey,
  useCopyPasteNodeProperties,
} from "./nodeOperations";
import { computePastePosition, createPasteBumpState } from "../utils/computePastePosition";

export const useNodeShortcuts = () => {
  const { screenToFlowPosition } = useReactFlow();
  const storeApi = useStoreApi();

  const mousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pasteBumpRef = useRef(createPasteBumpState());

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const computePasteBase = useCallback(() => {
    const domNode = storeApi.getState().domNode as HTMLElement | null;
    return computePastePosition({
      mousePosition: mousePositionRef.current,
      domNode,
      screenToFlowPosition,
      pasteBumpState: pasteBumpRef.current,
    });
  }, [screenToFlowPosition, storeApi]);

  useCopyNode();
  usePasteNode({ computePasteBase });
  useDuplicateNode();
  useReplaceWithClipboard();
  useCreateSubflowHotkey();
  useRunPathHotkey();
  useCopyPasteNodeProperties();
};

export default useNodeShortcuts;
