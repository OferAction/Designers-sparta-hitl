import { useArchivedFileItem, useItemContextMenu } from "../../hooks";
import { ItemDropdownRefProvider } from "@/modules/workspace/contexts";
import type { File, FileItemProps } from "@/modules/workspace/types";

export const ArchivedFileItem = ({
  file,
  component: Component,
  isInsideFolder = false,
}: {
  file: File;
  component: React.ComponentType<FileItemProps>;
  isInsideFolder?: boolean;
}) => {
  const { dropdownItems } = useArchivedFileItem(file, isInsideFolder);
  const { triggerButtonRef, handleContextMenu } = useItemContextMenu();

  return (
    <ItemDropdownRefProvider value={{ triggerButtonRef }}>
      <Component file={file} dropdownItems={dropdownItems} onContextMenu={handleContextMenu} />
    </ItemDropdownRefProvider>
  );
};
