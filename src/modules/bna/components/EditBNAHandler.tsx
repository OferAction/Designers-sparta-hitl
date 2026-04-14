import { useEffect } from "react";

import { useSearchParams } from "react-router-dom";

import { useSignalRContext } from "@/lib/signalr";
import { useRunHandlers } from "@/modules/flow/hooks";

export const EditBNAHandler = () => {
  const { handleRunPath } = useRunHandlers();
  const connection = useSignalRContext();
  const [searchParams] = useSearchParams();
  useEffect(() => {
    if (connection?.state !== "Connected") return;

    const subsetId = searchParams.get("subsetId");
    if (subsetId) {
      handleRunPath(undefined, "from-dataset");
    }
  }, [handleRunPath, connection?.state, searchParams]);

  return null;
};
