import { useCallback } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { getBranches } from "@/modules/flow/services";
import { File } from "@/modules/workspace";
import { useDuplicateFile } from "@/services";

export const useHandleDuplicate = (fileId: string) => {
  const { mutateAsync: duplicateFile } = useDuplicateFile(fileId);
  const queryClient = useQueryClient();
  return useCallback(
    async (branch: File) => {
      try {
        await duplicateFile({
          fileId: branch.id,
          projectId: branch.projectId || "",
        });
        queryClient.invalidateQueries(getBranches(branch.parentFileId || branch.id));
      } catch (e) {
        console.log(e);
      }
    },
    [duplicateFile, queryClient]
  );
};
