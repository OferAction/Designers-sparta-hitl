import { FileItem } from "@/modules/workspace/types";

export function FileStatus({ status }: { status: FileItem["status"] }) {
  if (status === "Live") {
    return <span className="px-2.5 py-0.5 rounded text-xs text-neon-green bg-success/50 mr-1">Live</span>;
  }
  return <span className="px-2.5 py-0.5 rounded text-xs font-semibold text-warning bg-warning-hover/20 mr-1">Draft</span>;
}
