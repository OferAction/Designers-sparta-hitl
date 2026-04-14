import { useEffect, useRef } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { toPng } from "html-to-image";
import { useParams } from "react-router-dom";

import { useToast } from "@/hooks/use-toast";
import { useLoadActiveConfiguration } from "@/modules/flow/hooks/useLoadActiveConfiguration";

import { THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT } from "./constants";
import { useDomPreparation } from "./useDomPreparation";
import { shouldUpdateThumbnail } from "./utils";
import { getFile, useUpdateFileInsideCanvas } from "@/services";
import { useCollaborativeStore } from "@/store";

export const useFlowThumbnailUpdate = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const hasRun = useRef(false);

  const { isLoading } = useLoadActiveConfiguration();

  const { fileId = "" } = useParams();
  const { mutateAsync: updateFile } = useUpdateFileInsideCanvas(fileId);

  const isSynced = useCollaborativeStore((state) => state.isSynced);

  const withDomPreparation = useDomPreparation();

  useEffect(() => {
    if (!fileId || hasRun.current || !isSynced || isLoading) return;
    hasRun.current = true;

    const updateThumbnail = async () => {
      try {
        const file = await queryClient.ensureQueryData(getFile(fileId));
        const shouldUpdate = shouldUpdateThumbnail(file);

        if (shouldUpdate) {
          const dataUrl = await withDomPreparation((domNode) =>
            toPng(domNode, {
              pixelRatio: 2,
              width: THUMBNAIL_WIDTH,
              height: THUMBNAIL_HEIGHT,
            })
          );

          await updateFile({
            ...file,
            thumbnailBase64: dataUrl,
            thumbnailUTC: new Date().toISOString(),
          });

          toast({
            title: "Workflow updated",
            description: `The workflow thumbnail has been updated.`,
          });
        }
      } catch (error) {
        console.error("Error updating thumbnail:", error);
        hasRun.current = false;
      }
    };

    updateThumbnail();
  }, [fileId, queryClient, toast, updateFile, isLoading, isSynced, withDomPreparation]);
};
