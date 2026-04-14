import { useMemo } from "react";

import moment from "moment";

import { Card, CardFooter, CardHeader, CardPreview } from "../card";
import { ItemDropdown } from "../ItemDropdown";
import { FileStatus } from "./FileStatus";
import { FileVersion } from "./FileVersion";
import { useSearch } from "@/modules/workspace/contexts";
import { FileItemProps } from "@/modules/workspace/types";
import { cn } from "@/utils";

import { getHighlightedParts } from "@/modules/workspace/utils/searchHighlight";

export const FileCard = ({ cardRef, file, dropdownItems, onClick, onContextMenu, isInsideSubflow }: FileItemProps) => {
  const { searchValue } = useSearch();
  const highlightParts = useMemo(() => getHighlightedParts(file.name, searchValue), [file.name, searchValue]);
  const users = [
    { image: "https://github.com/shadcn.png", name: "C N" },
    { image: "ng", name: "C N" },
  ];
  return (
    <Card
      variant={isInsideSubflow ? "subflow" : "file"}
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={cn("flex-1 w-full gap-4 flex flex-col justify-between")}
    >
      <div ref={cardRef} className="flex-1 w-full gap-4 flex flex-col justify-between">
        <CardPreview thumbnail={file.thumbnailBase64} />
        <div className="flex flex-col gap-y-2 mt-auto px-4 pb-4">
          <CardHeader title={file.name} id={file.id} highlightParts={highlightParts}>
            <ItemDropdown items={dropdownItems} isInsideSubflow={isInsideSubflow} />
          </CardHeader>
          <CardFooter users={users}>
            <div className="flex items-center">
              <FileStatus status={file.status} />
              <small className="text-xs font-normal text-muted-foreground leading-6 whitespace-nowrap">
                <FileVersion version={file.version} /> • Edited {moment(file.updateTime).fromNow()}
              </small>
            </div>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
};
