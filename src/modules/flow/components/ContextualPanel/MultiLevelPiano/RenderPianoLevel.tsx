import { useMemo } from "react";

import { useQueries } from "@tanstack/react-query";
import { useShallow } from "zustand/shallow";

import { useAncestorIteratorIds, useIterationPathForNode } from "@/modules/flow/hooks/useIteratorPath";

import { PianoLevel } from "./PianoLevel";
import { Skeleton } from "@/components/ui/skeleton";
import { getNodeResult, useGetNodeResult } from "@/modules/flow/services";
import { FlowStoreState, useFlowStore } from "@/store";

const selector = (s: FlowStoreState) => ({
  jobId: s.jobId,
  nodes: s.nodes,
  selectedNodeId: s.selectedNodeId,
  iteratorSelections: s.iteratorSelections,
  setIteratorSelectionAtLevel: s.setIteratorSelectionAtLevel,
  mode: s.mode,
});

export function RenderPianoLevel() {
  const { jobId, nodes, selectedNodeId, iteratorSelections, setIteratorSelectionAtLevel, mode } = useFlowStore(useShallow(selector));

  // Hook calls (must be before early returns)
  const parentPathForSelected = useIterationPathForNode(selectedNodeId || undefined);
  const { data: selectedNodeResult, isFetching, isFetched } = useGetNodeResult(jobId, selectedNodeId || "", parentPathForSelected);

  // Collect ancestor iterator nodes (outer-most first)
  const getAncestorIteratorIds = useAncestorIteratorIds();
  const ancestorIterators = useMemo(() => {
    if (!selectedNodeId) return [];
    const ids = getAncestorIteratorIds(selectedNodeId);
    return ids.map((id) => nodes.find((n) => n.id === id)).filter((n) => n !== undefined);
  }, [nodes, selectedNodeId, getAncestorIteratorIds]);

  const ancestorQuerySpecs = useMemo(
    () =>
      ancestorIterators.map((anc) => {
        const q = getNodeResult(jobId, anc.id, []);
        return {
          queryKey: q.queryKey,
          queryFn: q.queryFn,
          enabled: !!jobId && !!anc.id,
        };
      }),
    [ancestorIterators, jobId]
  );

  const ancestorQueries = useQueries({ queries: ancestorQuerySpecs });

  const parentMaxIterations = useMemo(() => {
    if (selectedNodeResult?.maxIterations && selectedNodeResult.maxIterations.length > 0) {
      return selectedNodeResult.maxIterations;
    }
    const maxIters: number[] = ancestorQueries.map((q) => {
      const val = q.data?.output?.max_iterations;
      return val;
    });
    return maxIters;
  }, [selectedNodeResult?.maxIterations, ancestorQueries]);

  if (mode !== "run" || parentMaxIterations.length === 0) return null;

  return (
    <div className="space-y-2">
      {parentMaxIterations.map((currentMaxIteration: number, level: number) => {
        const currentNode = ancestorIterators[level] || null;
        if (!currentNode) return null;
        const parentPath = iteratorSelections.slice(0, level); // path of outer selected iterations for this iterator
        const currentSelectedIteration = iteratorSelections[level] || 1;
        return (
          <div className="relative">
            {isFetching  ? (
              <div className="p-3 space-y-4 border-b border-muted">
                <Skeleton className="h-4 w-48 rounded" />
                {currentMaxIteration > 10 && <Skeleton className="h-4 w-64 rounded" />}
                <Skeleton className="h-7 w-86 rounded" />
              </div>
            ) : (
              isFetched &&
              <PianoLevel
                key={currentNode.id}
                level={level}
                iteratorNode={currentNode}
                parentPath={parentPath}
                iteration={currentSelectedIteration > currentMaxIteration ? currentMaxIteration : currentSelectedIteration}
                onIterationChange={(val) => setIteratorSelectionAtLevel(level, val, currentMaxIteration)}
                jobId={jobId}
                totalIterations={currentMaxIteration}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
