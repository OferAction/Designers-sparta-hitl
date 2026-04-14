import { useMemo } from "react";

import moment from "moment";

import { Card, CardFooter, CardHeader, CardPreview } from "../card";
import { ItemDropdown } from "../ItemDropdown";
import { useSearch } from "@/modules/workspace/contexts";
import { FolderItemProps } from "@/modules/workspace/types";

import { getHighlightedParts } from "@/modules/workspace/utils/searchHighlight";

const users = [
  { image: "https://github.com/shadcn.png", name: "C N" },
  { image: "ng", name: "CN" },
];

export function FolderCard({ folder, dropdownItems, onClick, onContextMenu }: FolderItemProps) {
  const { files = [] } = folder;
  const filesCounts = files.length || 0;
  const lastFourFilesImgs = files.slice(0, 4).map((file) => file.thumbnailBase64);
  const { searchValue } = useSearch();
  const highlightParts = useMemo(() => getHighlightedParts(folder.name, searchValue), [folder.name, searchValue]);

  return (
    <Card variant="folder" onClick={onClick} onContextMenu={onContextMenu} className="flex-1 w-full gap-4 flex flex-col justify-between">
      <div className="p-4 flex-1 w-full gap-4 flex flex-col justify-between">
        <CardPreview thumbnail={lastFourFilesImgs} />
        <div className="flex flex-col gap-y-2 mt-auto">
          <CardHeader title={folder.name} id={folder.id} highlightParts={highlightParts}>
            <ItemDropdown items={dropdownItems} />
          </CardHeader>
          <CardFooter users={users}>
            <small className="text-xs text-muted-foreground font-normal leading-6">
              {filesCounts} files • Updated {moment(folder.updateTime).fromNow()}
            </small>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}
