import { useQueryClient } from "@tanstack/react-query";

import { VersionInfo } from "@/modules/workspace";
import { getFile } from "@/services";
import { cn } from "@/utils";

interface VersionLabelProps {
  index: number;
  item: VersionInfo;
}

export const VersionLabel: React.FC<VersionLabelProps> = ({ index, item }) => {
  const queryClient = useQueryClient();
  const fileQuery = queryClient.getQueryData(getFile(item.fileId).queryKey);

  if (!fileQuery) return null;

  const isLive = index === 0 && fileQuery.status === "Live" && !fileQuery.parentFileId;
  if (!isLive && !item.publishedFrom) return null;

  return (
    <>
      <div className="flex items-center gap-1">
        {isLive && (
          <div className="size-4 flex items-center justify-center">
            <div className="bg-success size-1.5 rounded-full" />
          </div>
        )}
        {item.publishedFrom && <span className={cn("text-foreground", isLive && "text-success")}>{item.publishedFrom}</span>}
      </div>
    </>
  );
};
