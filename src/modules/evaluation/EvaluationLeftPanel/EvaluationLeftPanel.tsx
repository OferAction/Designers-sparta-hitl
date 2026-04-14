import React, { useImperativeHandle } from "react";

import { XIcon as X } from "@phosphor-icons/react";
import { useNavigate, useParams } from "react-router-dom";

import { useInfiniteScrollTrigger } from "@/hooks/useInfiniteScrollTrigger";

import { useGetEvaluationHistory } from "../services";
import { EvaluationJobCard } from "./EvaluationJobCard";
import { Button } from "@/components/ui/button";

export type LeftPanelHandle = {
  scrollToView: (batchId: string) => void;
};

const EvaluationLeftPanel = ({
  setSelectedBatchId,
  selectedBatchId,
  ref,
}: {
  setSelectedBatchId: React.Dispatch<React.SetStateAction<string>>;
  selectedBatchId: string;
  ref?: React.RefObject<LeftPanelHandle>;
}) => {
  const { fileId = "" } = useParams();
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useGetEvaluationHistory(fileId);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { configId = "", folderId = "" } = useParams();

  useImperativeHandle(ref, () => ({
    scrollToView: (batchId: string) => {
      const element = containerRef.current?.querySelector(`[data-id='${batchId}']`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    },
  }));

  const items = data?.pages.flatMap((page) => page.items) || [];

  const handleDeleteSuccess = (deletedId: string) => {
    const currentIndex = items.findIndex((item) => item.id === deletedId);
    if (currentIndex === -1) return;

    const nextCard = items[currentIndex + 1] || items[currentIndex - 1];
    if (items.length === 1) {
      navigate(`/canvas/${folderId}/${fileId}/${configId}`);
    }
    if (nextCard) {
      setSelectedBatchId(nextCard.id);
    }
  };

  const { sentinelRef, canLoadMore } = useInfiniteScrollTrigger({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    itemsLength: items.length,
  });

  return (
    <div className="flex flex-col max-w-[360px] w-full bg-sidebar border-r border-sidebar-border h-screen">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-6 p-5">
          <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => navigate(`/canvas/${folderId}/${fileId}/${configId}`)}>
            <X className="size-4 " />
          </Button>
          <h1 className="text-3xl font-semibold  pl-0">Evaluation</h1>
        </div>
      </div>
      {/* evaluation job cards */}
      <div className="flex flex-col flex-1 overflow-y-auto" ref={containerRef}>
        {items.map((evaluationJobData) => (
          <EvaluationJobCard
            key={evaluationJobData.id}
            data-id={evaluationJobData.id}
            evaluationJob={evaluationJobData}
            setSelectedBatchId={setSelectedBatchId}
            selected={selectedBatchId === evaluationJobData.id}
            onDeleteSuccess={() => handleDeleteSuccess(evaluationJobData.id)}
          />
        ))}
        {canLoadMore && <div ref={sentinelRef} aria-hidden="true" id="observer" className="w-full h-px" />}
      </div>
    </div>
  );
};

export default EvaluationLeftPanel;
