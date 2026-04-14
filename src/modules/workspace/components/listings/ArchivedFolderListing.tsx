import { useEffect } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { useToast } from "@/hooks/use-toast";

import { CardGrid } from "../card";
import { EmptyState } from "../EmptyState";
import { FileCard, FileRow } from "../files";
import { WorkspaceTable } from "../WorkspaceTable";
import { ArchivedFileItem } from "./ArchivedFileItem";
import { useGetArchivedFolderFiles } from "@/modules/workspace/services";
import { useWorkspaceStore } from "@/modules/workspace/store";

export function ArchivedFolderListing() {
  const { folderId = "" } = useParams();
  const navigate = useNavigate();

  const { toast } = useToast();

  const { data: folder, isError, isLoading, isStale } = useGetArchivedFolderFiles(folderId);
  const viewMode = useWorkspaceStore((state) => state.viewMode);

  useEffect(() => {
    if (isError && isStale) {
      toast({
        title: "Error",
        description: "Failed to load project workflows. Please try again later.",
        variant: "destructive",
      });
      if (isStale) {
        navigate("/");
      }
    }
  }, [navigate, folder, isError, isStale, toast]);

  if (!isLoading && (!folder?.files || folder.files.length === 0)) {
    return <EmptyState viewType="archive" />;
  }

  const [Listing, FileItemComponent] = viewMode === "CardView" ? [CardGrid, FileCard] : [WorkspaceTable, FileRow];

  return (
    <Listing loading={isLoading}>
      {folder?.files?.map((file) => <ArchivedFileItem key={file.id} file={file} component={FileItemComponent} isInsideFolder />)}
    </Listing>
  );
}
