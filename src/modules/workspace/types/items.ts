import { File } from "./files";
import { Project } from "./folders";

export type DropdownItem = {
  label?: string;
  onClick?: React.MouseEventHandler;
  separator?: boolean;
  onCloseAutoFocus?: () => void;
  disabled?: boolean;
};

export interface FileItemProps {
  cardRef?: React.RefObject<HTMLDivElement>;
  file: File;
  folderId?: string;
  dropdownItems: DropdownItem[];
  onClick?: React.MouseEventHandler;
  onContextMenu?: React.MouseEventHandler;
  isInsideSubflow?: boolean;
}

export interface FolderItemProps {
  folder: Project;
  dropdownItems: DropdownItem[];
  onClick?: React.MouseEventHandler;
  onContextMenu?: React.MouseEventHandler;
}
