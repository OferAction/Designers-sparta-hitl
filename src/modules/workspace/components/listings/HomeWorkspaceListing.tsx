import React, { useMemo } from "react";

import { useInfiniteScrollTrigger } from "@/hooks/useInfiniteScrollTrigger";

import { CardGrid } from "../card/CardGrid";
import { EmptyState } from "../EmptyState";
import { FileItem } from "./FileItem";
import { useTemplateItem } from "../../hooks/items/useTemplateItem";
import { FileCard, FileRow } from "../files";
import { FolderCard, FolderRow } from "../folders";
import { WorkspaceTable } from "../WorkspaceTable";
import { EditableFieldProvider } from "@/components/common/EditableField";
import { DEFAULT_SHORTCUT_SETTINGS, KEYBOARD_SHORTCUTS } from "@/constants";
import { ItemDropdownRefProvider, LastCreatedItemProvider, useSearch } from "@/modules/workspace/contexts";
import { useFileActions, useFolderCard, useItemContextMenu } from "@/modules/workspace/hooks";
import { useGetFoldersPageQuery } from "@/modules/workspace/services/folderService";
import { useWorkspaceStore } from "@/modules/workspace/store";
import type { ProjectResponse, FolderItemProps, FileItemProps, Project, File } from "@/modules/workspace/types";

import Shortcut, { type ShortcutDefinition } from "@/utils/Shortcut";

const FolderItem = ({ folder, component: Component }: { folder: Project; component: React.ComponentType<FolderItemProps> }) => {
  const { dropdownItems, isEditing: isFolderEditing, handleNameChange, handleClick, handleEditingChange } = useFolderCard(folder);
  const { dropdownItems: subflowFolderDropdownItems } = useTemplateItem(folder);

  const { triggerButtonRef, handleContextMenu } = useItemContextMenu();

  return (
    <EditableFieldProvider
      value={{
        onEditEnd: handleNameChange,
        isEditing: isFolderEditing,
        onEditingChange: handleEditingChange,
      }}
    >
      <ItemDropdownRefProvider value={{ triggerButtonRef }}>
        <Component
          folder={folder}
          dropdownItems={folder?.isSubflow ? subflowFolderDropdownItems : dropdownItems}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
        />
      </ItemDropdownRefProvider>
    </EditableFieldProvider>
  );
};

const FileItemWrapper = ({ file, component }: { file: File; component: React.ComponentType<FileItemProps> }) => {
  return <FileItem file={file} component={component} />;
};

export function WorkspaceListing() {
  const viewMode = useWorkspaceStore((state) => state.viewMode);
  const { searchValue } = useSearch();
  const pageSize = 10;
  const sortDirection = 1;
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useGetFoldersPageQuery(pageSize, searchValue, sortDirection);

  const items: ProjectResponse[] = data?.pages?.flat() ?? [];

  const { addUntitledFile } = useFileActions();
  const shortcuts = useMemo<ShortcutDefinition[]>(
    () => [
      {
        id: "workspace-new-workflow",
        keys: KEYBOARD_SHORTCUTS.NEW_WORKFLOW.keys,
        handler: addUntitledFile,
        options: DEFAULT_SHORTCUT_SETTINGS,
      },
    ],
    [addUntitledFile]
  );

  const { sentinelRef, canLoadMore } = useInfiniteScrollTrigger({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    itemsLength: items.length,
  });

  if (status === "success" && items.length === 0) {
    return <EmptyState viewType="folder" />;
  }

  const [Listing, FileItemComponent, FolderItemComponent] =
    viewMode === "CardView" ? [CardGrid, FileCard, FolderCard] : [WorkspaceTable, FileRow, FolderRow];

  return (
    <>
      <Shortcut shortcuts={shortcuts} />
      <Listing loading={status === "pending"}>
        {items.map((item) => {
          if (item.isFile && !item.files[0]) return null;
          return (
            <LastCreatedItemProvider key={item.id} id={item.isFile ? item.files[0].id : item.id}>
              {item.isFile ? (
                <FileItemWrapper key={`file${item.id}`} file={item.files[0]} component={FileItemComponent} />
              ) : (
                <FolderItem key={`folder${item.id}`} folder={item} component={FolderItemComponent} />
              )}
            </LastCreatedItemProvider>
          );
        })}
      </Listing>
      {canLoadMore && <div ref={sentinelRef} aria-hidden="true" id="observer" className="w-full h-px" />}
    </>
  );
}
