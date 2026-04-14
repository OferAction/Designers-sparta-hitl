import { useFileItem, useItemContextMenu } from "../../hooks";
import { EditableFieldProvider } from "@/components/common/EditableField";
import { ItemDropdownRefProvider } from "@/modules/workspace/contexts";
import type { File, FileItemProps } from "@/modules/workspace/types";

export const FileItem = ({
  file,
  component: Component,
  isInsideFolder = false,
}: {
  file: File;
  component: React.ComponentType<FileItemProps>;
  isInsideFolder?: boolean;
}) => {
  const { dropdownItems, isEditing: isFileEditing, handleNameChange, cardRef, handleClick, handleEditingChange } = useFileItem(file, isInsideFolder);
  const { triggerButtonRef, handleContextMenu } = useItemContextMenu();

  return (
    <EditableFieldProvider
      value={{
        onEditEnd: handleNameChange,
        isEditing: isFileEditing,
        onEditingChange: handleEditingChange,
      }}
    >
      <ItemDropdownRefProvider value={{ triggerButtonRef }}>
        <Component cardRef={cardRef} file={file} dropdownItems={dropdownItems} onClick={handleClick} onContextMenu={handleContextMenu} />
      </ItemDropdownRefProvider>
    </EditableFieldProvider>
  );
};
