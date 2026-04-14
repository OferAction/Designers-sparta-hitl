import { useEffect, useMemo, useState } from "react";

import moment from "moment";
import { useNavigate, useParams } from "react-router-dom";

import { VersionLabel } from "./VersionLabel";
import VHSideContentMenuSkeleton from "./VHSideMenuContentSkeleton";
import { useSubflowContext } from "../../contexts";
import { Collaborators } from "@/components/common/Collaborators";
import { VHRestoreButton } from "@/modules/flow/components/VersionHistory/VHRestoreButton";
import { VHViewButton } from "@/modules/flow/components/VersionHistory/VHViewButton";
import { VersionInfo } from "@/modules/workspace";
import { useGetConfigurationHistoryQuery } from "@/services";
import { useGetUsersQuery } from "@/services/securityService";
import { cn, getHumanizedDate } from "@/utils";

const groupByDate = <T extends { version: { timestamp: string } }>(items: T[]): Record<string, T[]> => {
  return items.reduce((acc: Record<string, T[]>, item) => {
    const dateKey = moment(item.version.timestamp).startOf("day").format("YYYY-MM-DD");
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(item);
    return acc;
  }, {});
};

const VHSideMenuContent: React.FC = () => {
  const { folderId = "", fileId = "", configId = "" } = useParams();
  const isSubflowFile = useSubflowContext();
  const { data: versionHistory = [], isPlaceholderData } = useGetConfigurationHistoryQuery(fileId, isSubflowFile);
  const { data: users } = useGetUsersQuery();
  const navigate = useNavigate();

  const [selected, setSelected] = useState<string | null>(null);

  const versionHistoryWithUserNames = useMemo(
    () =>
      versionHistory.map(
        (version) => {
          const user = users?.find((u) => u.externalId === version.savedBy);
          return {
            ...version,
            users: [
              {
                name: user ? user.name : "Unknown User",
              },
            ],
          };
        },
        [versionHistory, users]
      ),
    [versionHistory, users]
  );

  const groupedItems = groupByDate(versionHistoryWithUserNames);

  const handleViewVersion = (configId: string) => {
    if (isSubflowFile) {
      navigate(`/canvas/${folderId}/${fileId}/${configId}/subflowhistory`, { state: { shouldFit: true } });
      return;
    }
    navigate(`/canvas/${folderId}/${fileId}/${configId}/history`, { state: { shouldFit: true } });
  };

  const handleRowClick = (item: VersionInfo) => {
    setSelected(item.id);
    handleViewVersion(item.id);
  };

  useEffect(() => {
    if (configId) {
      setSelected(configId);
    }
  }, [configId]);

  if (isPlaceholderData) {
    return <VHSideContentMenuSkeleton />;
  }

  return (
    <div className="py-3 px-4 relative">
      <ul className="overflow-y-auto h-[calc(100vh-180px)] flex flex-col gap-2">
        {Object.entries(groupedItems).map(([date, items], index: number) => (
          <li key={date} data-date={date}>
            <h3 className="bg-sidebar w-full sticky top-0 z-10 p-[6px] text-center text-xs leading-5 text-sidebar-foreground/70">
              {getHumanizedDate(date)}
            </h3>
            <ol className="flex flex-col">
              {items.map((item, i) => (
                <li
                  key={item.id}
                  className="[&:not(:last-child)]:pb-1 [&:not(:last-child)]:mb-1 [&:not(:last-child)]:border-border [&:not(:last-child)]:border-b"
                  onClick={() => handleRowClick(item)}
                >
                  <div
                    className={cn(
                      "flex items-center justify-between p-[6px] border-2 border-transparent rounded-sm hover:bg-accent/50 group/item cursor-pointer",
                      {
                        "border-sidebar-ring": selected === item.id,
                      }
                    )}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-1.5 font-semibold text-xs leading-5">
                        <VersionLabel index={i} item={item} />
                        <span className="text-muted-foreground">
                          {index === 0 && i === 0 ? "Current" : moment(item.version.timestamp).format("h:mm A")}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Collaborators users={item.users} displayName className="-space-x-4" />
                        {item.version && (
                          <div className="flex items-center gap-2">
                            <div className="bg-sidebar-foreground rounded-full size-1" />
                            <span className="text-xs leading-5 text-muted-foreground">
                              V{item.version.major}.{item.version.minor}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {selected === item.id ? (
                      (index !== 0 || i !== 0) && <VHRestoreButton configId={item.id} onSuccess={(id: string) => setSelected(id)} />
                    ) : (
                      <VHViewButton onClick={() => handleViewVersion(item.id)} />
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VHSideMenuContent;
