import { useEffect, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { useSignalRListener } from "@/lib/signalr";
import { getBranches } from "@/modules/flow/services";
import { useBranchPullLatestChanges } from "@/modules/flow/services";
import { File } from "@/modules/workspace";

export const useStaleBranchNotification = ({ parentFileId, id }: File) => {
  const queryClient = useQueryClient();
  const { fileId = "" } = useParams();
  const [dismissed, setDismissed] = useState(false);

  const finalFileId = parentFileId || id;

  useEffect(() => {
    setDismissed(false);
  }, [fileId]);

  const { mutate: pullLatestChanges } = useBranchPullLatestChanges(finalFileId);

  useSignalRListener("ReceiveConfigurationNotification", (notification) => {
    if (notification.eventType === "configurations_file_updated" && notification.payload.fileId === id) {
      setDismissed(false);
      queryClient.setQueryData(getBranches(finalFileId).queryKey, (old) => {
        return old?.map((b) => (b.id === id ? { ...b, isLatestVersion: false } : b)) || [];
      });
      queryClient.invalidateQueries({ queryKey: getBranches(finalFileId).queryKey });
    }
  });

  const handleIgnore = () => {
    setDismissed(true);
  };

  const handleUpdate = () => {
    setDismissed(true);
    pullLatestChanges({
      $fileId: id,
    });
  };

  return { dismissed, setDismissed, handleIgnore, handleUpdate };
};
