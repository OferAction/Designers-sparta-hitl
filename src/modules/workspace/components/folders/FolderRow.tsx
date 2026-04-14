import { useMemo } from "react";

import moment from "moment";

import { ItemDropdown } from "../ItemDropdown";
import { Collaborators } from "@/components/common/Collaborators";
import { EditableField } from "@/components/common/EditableField";
import { TableRow, TableCell } from "@/components/ui/table";
import { useSearch } from "@/modules/workspace/contexts";
import { FolderItemProps } from "@/modules/workspace/types";
import { cn } from "@/utils";

import { getHighlightedParts } from "@/modules/workspace/utils/searchHighlight";

export function FolderRow({ folder, dropdownItems, onClick, onContextMenu }: FolderItemProps) {
  const files = folder.files;
  const { searchValue } = useSearch();
  const highlightParts = useMemo(() => getHighlightedParts(folder.name, searchValue), [folder.name, searchValue]);
  const users = [{ image: "https://github.com/shadcn.png", name: "C N" }, { name: "C N" }];
  // const isNewItem = useLastCreatedItem();

  return (
    <TableRow
      className={cn(
        "cursor-pointer py-2 has-[[data-card-dropdown=open]]:bg-secondary"
        // isNewItem && "bg-gradient-to-r from-teal-600/10 via-green-600/10 to-yellow-600/10  "
      )}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      <TableCell className="font-medium py-[1.375rem] px-4">
        <div className="flex items-baseline">
          <EditableField className="flex-[0_0_1] w-fit" currentValue={folder.name} highlightParts={highlightParts} />
          <span className="ms-[1ch] text-muted-foreground font-sans font-normal text-sm leading-5">({files?.length || 0})</span>
        </div>
      </TableCell>
      <TableCell className="font-medium py-[1.375rem] px-4 text-muted-foreground">{moment(folder.updateTime).fromNow()}</TableCell>
      <TableCell className="font-medium py-[1.375rem] px-4">--</TableCell>
      <TableCell className="font-medium py-[1.375rem] px-4">
        <Collaborators users={users} />
      </TableCell>
      <TableCell className="font-medium py-[1.375rem] px-4" title={folder.name} id={folder.id}>
        <ItemDropdown items={dropdownItems} />
      </TableCell>
    </TableRow>
  );
}
