import { useMemo } from "react";

import moment from "moment";

import { ItemDropdown } from "../ItemDropdown";
import { FileStatus } from "./FileStatus";
import { FileVersion } from "./FileVersion";
import { Collaborators } from "@/components/common/Collaborators";
import { EditableField } from "@/components/common/EditableField";
import { TableCell, TableRow } from "@/components/ui/table";
import { useSearch } from "@/modules/workspace/contexts";
import { FileItemProps } from "@/modules/workspace/types";
import { cn } from "@/utils";

import { getHighlightedParts } from "@/modules/workspace/utils/searchHighlight";

export function FileRow({ file, dropdownItems, onClick, onContextMenu }: FileItemProps) {
  const { searchValue } = useSearch();
  const highlightParts = useMemo(() => getHighlightedParts(file.name, searchValue), [file.name, searchValue]);
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
      <TableCell className="font-medium py-3.5 px-4">
        <EditableField currentValue={file.name} highlightParts={highlightParts} />
      </TableCell>
      <TableCell className="font-medium py-3.5 px-4 text-muted-foreground">{moment(file.updateTime).fromNow()}</TableCell>
      <TableCell className="font-medium py-3.5 px-4">
        <FileStatus status={file.status} /> <FileVersion version={file.version} />
      </TableCell>
      <TableCell className="font-medium py-3.5 px-4">
        <Collaborators users={users} />
      </TableCell>
      <TableCell className="font-medium py-3.5 px-4" title={file.name} id={file.id}>
        <ItemDropdown items={dropdownItems} />
      </TableCell>
    </TableRow>
  );
}
