import { useCallback } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { useToast } from "@/hooks/use-toast";

import { getBranches } from "@/modules/flow/services";
import { File } from "@/modules/workspace";
import { useArchiveFile } from "@/services";

export const useHandleArchiveBranch = (branch: File) => {
  const queryClient = useQueryClient();
  const { mutateAsync } = useArchiveFile(branch);
  const { toast } = useToast();
  const navigate = useNavigate();

  return useCallback(async () => {
    try {
      await mutateAsync();
      queryClient.invalidateQueries(getBranches(branch.parentFileId || branch.id));
      toast({
        title: "Branch archived",
        description: `The branch "${branch.name}" has been archived.`,
        position: "center",
      });
      navigate(`/canvas/${branch.projectId}/${branch.parentFileId}`);
    } catch (e) {
      console.log(e);
    }
  }, [branch.id, branch.name, branch.parentFileId, branch.projectId, mutateAsync, navigate, queryClient, toast]);
};
