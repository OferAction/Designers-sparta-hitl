import { useEffect } from "react";

import { ArrowLeftIcon, XIcon } from "@phosphor-icons/react";
import moment from "moment";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useSubsetFilter } from "@/modules/bna";
import { useFlowStore } from "@/store";

export const BatchRunHeader = () => {
  const { data, isLoading, isSuccess } = useSubsetFilter();
  const navigate = useNavigate();
  const { fileId = "", folderId = "", currentConfigId = "", batchId = "" } = useParams();

  useEffect(() => {
    if (isSuccess) {
      const { jobId, setJobId, setMode } = useFlowStore.getState();
      // if jobId jobId is not set or jobId is not in the subset results, set it to the first result's jobId
      if (!jobId || !data?.nodeResultSubsetDtos.find((dto) => dto.jobId === jobId)) {
        const jobId = data.nodeResultSubsetDtos[0]?.jobId;
        setJobId(jobId || "");
        if (jobId) {
          setMode("run");
        }
      }
    }
  }, [data?.nodeResultSubsetDtos, isSuccess]);

  useEffect(() => {
    return () => {
      const { setJobId, setMode } = useFlowStore.getState();
      setJobId("");
      setMode("build");
    };
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <div className="px-5 py-4 flex items-center justify-between gap-4">
      {batchId && (
        <div className="flex items-center justify-center gap-2 pointer-events-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              navigate(`/canvas/${folderId}/${fileId}/${currentConfigId}/evaluation`, {
                state: { batchId },
              });
            }}
          >
            <ArrowLeftIcon size={16} />
          </Button>
          <div className="text-sm">
            <h1 className="text-foreground">{data?.evaluationName}</h1>
            <span className="text-muted-foreground">{moment(data?.evaluationDate).format("hh:mmA DD.MM.YYYY")}</span>
          </div>
        </div>
      )}
      <Button
        className="pointer-events-auto"
        variant="ghost"
        size="icon"
        onClick={() => {
          navigate(`/canvas/${folderId}/${fileId}`);
        }}
      >
        <XIcon size={16} />
      </Button>
    </div>
  );
};
