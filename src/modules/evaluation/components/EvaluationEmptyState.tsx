import { useNavigate, useParams } from "react-router-dom";

import { TableIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";

export default function EvaluationEmptyState() {
  const { fileId = "", configId = "", folderId = "" } = useParams();
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center pt-[180px]">
      <div className="flex flex-col items-center gap-4 max-w-lg text-center px-4">
        <div className="w-[100px] h-[100px] rounded-[60px] p-9 bg-muted/50 flex items-center justify-center gap-8">
          <TableIcon width={56} height={48} />
        </div>
        <h1 className="tracking-[-0.9px] text-4xl font-semibold text-primary text-center gap-4">No evaluation results yet</h1>
        <p className="text-lg text-primary font-normal leading-7 max-w-[400px] text-center gap-8">
          Evaluate from the canvas to see workflow and node-level metrics here
        </p>
        <Button
          variant="blue"
          className="flex justify-center items-center gap-1 mt-4 rounded-md px-3 py-2 text-blue-accent-foreground leading-6 font-normal text-sm"
          onClick={() => navigate(`/canvas/${folderId}/${fileId}/${configId}`)}
        >
          Back to Canvas
        </Button>
      </div>
    </div>
  );
}
