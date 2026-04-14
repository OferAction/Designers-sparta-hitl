import { useEffect, useRef, useState } from "react";

import { useLocation, useParams } from "react-router-dom";

import EvaluationLeftPanel, { LeftPanelHandle } from "@/modules/evaluation/EvaluationLeftPanel/EvaluationLeftPanel";
import EvaluationTable from "@/modules/evaluation/evaluationTable";
import ReliableLayout from "@/modules/evaluation/layouts/ReliableLayout";
import { useGetEvaluationHistory } from "@/modules/evaluation/services";

const Evaluation = () => {
  const location = useLocation();
  const initialBatchId = location.state?.batchId || "";
  const [selectedBatchId, setSelectedBatchId] = useState<string>(initialBatchId);
  const leftPanelRef = useRef<LeftPanelHandle>(null);
  const { fileId = "" } = useParams();
  const { data, isSuccess } = useGetEvaluationHistory(fileId);

  if (!selectedBatchId && isSuccess) {
    setSelectedBatchId(data.pages?.[0]?.items[0]?.id || "");
    leftPanelRef.current?.scrollToView(data.pages?.[0]?.items[0]?.id || "");
  }

  useEffect(() => {
    if (initialBatchId) {
      setSelectedBatchId(initialBatchId);
      leftPanelRef.current?.scrollToView(initialBatchId);
    }
  }, [initialBatchId, location.key]);

  return (
    <div className="flex flex-col h-screen w-full">
      <div className="flex flex-1 min-h-0">
        <EvaluationLeftPanel ref={leftPanelRef} setSelectedBatchId={setSelectedBatchId} selectedBatchId={selectedBatchId || initialBatchId} />

        <div className="flex flex-col px-6 flex-1 min-w-0 overflow-auto">
          <ReliableLayout batchId={selectedBatchId} />
          <EvaluationTable batchId={selectedBatchId} />
        </div>
      </div>
    </div>
  );
};

export default Evaluation;
