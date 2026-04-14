import { CardGrid } from "../card";
import { EmptyState } from "../EmptyState";
import { ArchivedFileItem } from "./ArchivedFileItem";
import { FileCard, FileRow } from "../files";
import { FolderCard, FolderRow } from "../folders";
import { WorkspaceTable } from "../WorkspaceTable";
import { ItemDropdownRefProvider } from "@/modules/workspace/contexts";
import { useArchivedFolderItem, useItemContextMenu } from "@/modules/workspace/hooks";
import { useGetArchivedFolders } from "@/modules/workspace/services";
import { useWorkspaceStore } from "@/modules/workspace/store";
import type { FolderItemProps, Project } from "@/modules/workspace/types";

const FolderItem = ({ folder, component: Component }: { folder: Project; component: React.ComponentType<FolderItemProps> }) => {
  const { dropdownItems, handleClick } = useArchivedFolderItem(folder);
  const { triggerButtonRef, handleContextMenu } = useItemContextMenu();

  return (
    <ItemDropdownRefProvider value={{ triggerButtonRef }}>
      <Component folder={folder} dropdownItems={dropdownItems} onClick={handleClick} onContextMenu={handleContextMenu} />
    </ItemDropdownRefProvider>
  );
};

export function ArchiveListing() {
  const viewMode = useWorkspaceStore((state) => state.viewMode);
  const { data: archivedItems, isPlaceholderData } = useGetArchivedFolders();

  if (!isPlaceholderData && (!archivedItems || archivedItems.length === 0)) {
    return <EmptyState viewType="archive" />;
  }

  const [Listing, FileItemComponent, FolderItemComponent] =
    viewMode === "CardView" ? [CardGrid, FileCard, FolderCard] : [WorkspaceTable, FileRow, FolderRow];

  return (
    <Listing loading={isPlaceholderData}>
      {archivedItems.map((item) =>
        item.isFile ? (
          <ArchivedFileItem key={`file-${item.id}`} file={item.files[0]} component={FileItemComponent} />
        ) : (
          <FolderItem key={`folder-${item.id}`} folder={item} component={FolderItemComponent} />
        )
      )}
    </Listing>
  );
}
