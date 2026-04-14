import { useMemo } from "react";

import { useParams } from "react-router-dom";

import { useParentFileId } from "@/hooks/useFileCache";

import { useCanvasPermissions, useEnableCanvasInteractions } from "@/modules/flow/hooks";

const EnablePermissions = () => {
  useEnableCanvasInteractions();
  return null;
};

const DisablePermissions = () => {
  const permissions = useMemo(
    () => ({
      canChangeNodeData: false,
      canDragOrRemoveNodes: false,
      canCreateElements: false,
      canSelectEdges: false,
      canRemoveEdges: false,
      canRunFlow: true,
      canSelectNodes: true,
    }),
    []
  );
  useCanvasPermissions(permissions);
  return null;
};

export const PermissionsHandler = () => {
  const { fileId } = useParams();
  const [parentFileId, isLive] = useParentFileId(fileId || "");
  return parentFileId === fileId && isLive ? <DisablePermissions /> : <EnablePermissions />;
};
