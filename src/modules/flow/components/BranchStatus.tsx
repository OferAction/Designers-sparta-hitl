import { useSubflowContext } from "@/modules/flow/contexts";
import { cn } from "@/utils";

export const BranchStatus = ({ isPublished }: { isPublished: boolean }) => {
  const isSubflow = useSubflowContext();
  if (isSubflow) return null;
  return (
    <div className="size-4 flex items-center justify-center">
      <div className={cn("size-1.5 rounded-full", isPublished ? "bg-success" : "bg-warning")} />
    </div>
  );
};
