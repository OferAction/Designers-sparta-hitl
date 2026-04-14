import { useEffect } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { useToast } from "@/hooks/use-toast";

import { CardGrid } from "../card";
import { EmptyState } from "../EmptyState";
import { FileItem } from "./FileItem";
import { FileCard, FileRow } from "../files";
import { WorkspaceTable } from "../WorkspaceTable";
import { LastCreatedItemProvider } from "@/modules/workspace/contexts";
import { useGetFolderFilesQuery } from "@/modules/workspace/services";
import { useWorkspaceStore } from "@/modules/workspace/store";

export function HomeFolderListing() {
  const { folderId } = useParams();
  const navigate = useNavigate();

  const { toast } = useToast();

  const { data: folder, isError, isLoading, isStale } = useGetFolderFilesQuery(folderId);

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
    return <EmptyState viewType="file" />;
  }

  const [Listing, FileItemComponent] = viewMode === "CardView" ? [CardGrid, FileCard] : [WorkspaceTable, FileRow];
  return (
    <Listing loading={isLoading}>
      {folder?.files?.map((file) => (
        <LastCreatedItemProvider key={`${file.id}`} id={file.id}>
          <FileItem key={`file${file.id}`} file={file} component={FileItemComponent} isInsideFolder />
        </LastCreatedItemProvider>
      ))}
    </Listing>
  );
}
