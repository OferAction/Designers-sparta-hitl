import { useEffect, useState } from "react";

import { EyeIcon } from "@phosphor-icons/react";
import moment from "moment";

import { VersionHistorySkeleton } from "./VersionHistorySkeleton";
import { Collaborators } from "@/components/common/Collaborators";
import VHFilteration from "@/components/common/VHFilteration";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { RecentEdit, File } from "@/modules/workspace/types";
import { useGetConfigurationHistoryQuery } from "@/services";
import { cn } from "@/utils";
import { getHumanizedDate } from "@/utils";

interface Props {
  file: File;
  isSubflowFile?: boolean;
}

const recentEdits = [
  {
    user: "Mahmoud Rizk",
  },
  {
    user: "Ahmed Fayed",
  },
  {
    user: "Ahmed Elsharkawy",
  },
  {
    user: "Hassan Mohamed",
  },
];

const UserEdits = ({ recentEdits }: { recentEdits: RecentEdit[] }) => {
  return (
    <Collaborators truncate={3} users={recentEdits.map((edit) => ({ name: edit.user }))} displayName={true}>
      <span className="text-xs font-normal text-sidebar-foreground leading-5 overflow-hidden text-ellipsis whitespace-nowrap">
        {recentEdits.length === 1 ? recentEdits[0].user : `${recentEdits.length} Persons`}
      </span>
    </Collaborators>
  );
};

export function VersionHistoryModal({ file: { id, projectId }, isSubflowFile }: Props) {
  const [showAll, setShowAll] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const { data: configurationHistory, isPlaceholderData } = useGetConfigurationHistoryQuery(id,isSubflowFile);

  // TODO-debt: when BE supports pagination
  const initialCount = Infinity;

  useEffect(() => {
    setSelectedVersion(null);
  }, [configurationHistory]);

  const handleViewClick = (configId: string) => {
    setSelectedVersion(configId);
    if(isSubflowFile){
      window.open(`/canvas/${projectId}/${id}/${configId}/subflowhistory`, "_blank");
      return;
    }
    window.open(`/canvas/${projectId}/${id}/${configId}/history`, "_blank");
  };

  return (
    <DialogContent className="w-[50vw] min-w-[700px] max-w-[893px]">
      <DialogHeader className="p-6">
        <DialogTitle>Version History</DialogTitle>
        <DialogDescription>Review and restore previous versions of your dataset.</DialogDescription>
      </DialogHeader>

      <VHFilteration />
      <div className="rounded-md border-0.5 h-[440px] border-ring border-opacity-50 overflow-y-auto">
        {isPlaceholderData && <VersionHistorySkeleton />}

        {!isPlaceholderData && !configurationHistory?.length && (
          <div className="p-4 text-center text-muted-foreground">No version history available.</div>
        )}

        {!isPlaceholderData &&
          configurationHistory?.map(({ version: { major, minor, patch, timestamp }, id }) => (
            <div
              key={id}
              className={cn("flex items-stretch cursor-pointer justify-between px-6 py-3 group hover:bg-accent hover:bg-opacity-50", {
                "bg-accent hover:bg-opacity-100": selectedVersion === id,
              })}
              onClick={() => handleViewClick(id)}
            >
              <div className="flex flex-1 items-center text-foreground text-base font-medium gap-2">
                <div className="grid grid-cols-4 w-full gap-4 items-center">
                  <span className="text-left">{getHumanizedDate(timestamp)}</span>
                  <span className="text-left">{moment(timestamp).format("hh:mm A")}</span>
                  <span className="text-left">
                    {major}.{minor}.{patch}
                  </span>
                  <UserEdits recentEdits={recentEdits} />
                </div>
                <Button className="ml-auto invisible group-hover:visible" variant="secondary">
                  View
                  <EyeIcon className="size-4" />
                </Button>
              </div>
            </div>
          ))}

        {!showAll && !isPlaceholderData && configurationHistory && configurationHistory.length > initialCount && (
          <div className="px-4 py-3">
            <Button variant="outline" onClick={() => setShowAll(true)}>
              Show More
            </Button>
          </div>
        )}
      </div>
    </DialogContent>
  );
}
