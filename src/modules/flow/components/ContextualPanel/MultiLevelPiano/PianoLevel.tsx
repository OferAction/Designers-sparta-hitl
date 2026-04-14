import PianoSection from "@/components/common/Piano/PianoSection";
import { useGetNodeResult } from "@/modules/flow/services";

interface PianoLevelProps {
  level: number;
  iteratorNode: any;
  parentPath: number[];
  iteration: number;
  totalIterations: number;
  onIterationChange: (v: number) => void;
  jobId: string;
}

export function PianoLevel({ iteratorNode, parentPath, iteration, onIterationChange, jobId, totalIterations }: PianoLevelProps) {
  const { data: iteratorNodeResult } = useGetNodeResult(jobId, iteratorNode.id, parentPath.length ? parentPath : undefined);
  const indicators = iteratorNodeResult?.output?.index_summary || [];
  return (
    <PianoSection
      nodeId={iteratorNode.id}
      totalIterations={totalIterations}
      indicators={indicators}
      iteration={iteration}
      onIterationChange={onIterationChange}
      className="mt-2"
      height={24}
      iterableName="iterations"
      headerText="preview iteration"
    />
  );
}

export default PianoLevel;
