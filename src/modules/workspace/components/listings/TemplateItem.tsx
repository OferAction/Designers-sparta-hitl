import { useItemContextMenu } from "../../hooks";
import { useTemplateItem } from "../../hooks/items/useTemplateItem";
import { EditableFieldProvider } from "@/components/common/EditableField";
import { ItemDropdownRefProvider } from "@/modules/workspace/contexts";
import type { File, FileItemProps } from "@/modules/workspace/types";

export const TemplateItem = ({
  file,
  component: Component,
  isInsideSubflow,
}: {
  file: File;
  component: React.ComponentType<FileItemProps>;
  isInsideFolder?: boolean;
  isInsideSubflow?: boolean;
}) => {
  const { dropdownItems, isEditing: isFileEditing, handleNameChange, cardRef, handleClick, handleEditingChange } = useTemplateItem(file);
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
        <Component
          cardRef={cardRef}
          file={file}
          dropdownItems={dropdownItems}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
          isInsideSubflow={isInsideSubflow}
        />
      </ItemDropdownRefProvider>
    </EditableFieldProvider>
  );
};
