import { Fragment } from "react";

import { ClockCounterClockwiseIcon, CopyIcon, CursorTextIcon, HexagonIcon, ListPlusIcon, ShareNetworkIcon, ArchiveIcon, CaretDownIcon as ChevronDown } from "@phosphor-icons/react";
import moment from "moment";
import { useNavigate, useParams } from "react-router-dom";

import { useParentFileId } from "@/hooks/useFileCache";

import { AddDescriptionDialog } from "./AddDescriptionDialog";
import { EditableFileName } from "./EditableFileName";
import { useSubflowContext, useViewSubflowContext } from "../../contexts";
import { CreateCustomSubflowDialog } from "../ContextualPanel/Subflow/CreateCustomSubflowDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { PublishDialog } from "@/modules/flow/components/BranchingDialogs";
import { ShareDialog } from "@/modules/workspace/components/card-dialogs";
import { useGetFileQuery } from "@/services/fileService/fileService";
import { useDialogStoreActions } from "@/store";
import { ENTITY_TYPE } from "@/types/accessRequest";
import { cn } from "@/utils";

function PublishBadge() {
  const { openDialog } = useDialogStoreActions();
  const { fileId: paramsFileId = "" } = useParams();
  const isSubflowNode = useSubflowContext();

  const [fileId] = useParentFileId(paramsFileId);

  const { data: file, isSuccess } = useGetFileQuery(fileId);

  const handlePublish = () => {
    openDialog(({ id, onClose }) => <PublishDialog id={id} onClose={onClose} />);
  };

  if (isSubflowNode) {
    return (
      <Button variant="secondary" className={cn("min-w-20 py-1.5 px-2 h-full rounded-l-md rounded-r-none border border-border bg-background shadow")}>
        Publish
      </Button>
    );
  }

  if (!isSuccess) {
    return null;
  }

  if (file.status === "Live") {
    return <span className="text-xs text-sidebar-foreground/70 px-2">Last published on {moment(file.updateTime).format("MMM. D, YYYY h:mm A")}</span>;
  }

  return (
    <Badge onClick={handlePublish} variant="outline" className="rounded-full cursor-pointer hover:text-primary-foreground hover:bg-primary">
      Publish
    </Badge>
  );
}

export function OrchestrationSettings() {
  const { folderId = "", fileId: paramsFileId = "", configId = "" } = useParams();
  const navigate = useNavigate();
  const isSubflowNode = useSubflowContext();
  const isViewOnly = useViewSubflowContext();
  const { openDialog } = useDialogStoreActions();

  const [fileId] = useParentFileId(paramsFileId);
  const { data: file } = useGetFileQuery(fileId);

  const handleShare = () => {
    if (!file) return;
    openDialog(({ onClose }) => (
      <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
        <ShareDialog entityType={ENTITY_TYPE.File} entityId={file.id} entityName={file.name} entityLink={`/canvas/${folderId}/${file.id}`} />
      </Dialog>
    ));
  };
  const handleNewSubflow = () => {
    openDialog(({ id, onClose }) => <CreateCustomSubflowDialog id={id} onClose={onClose} />);
  };

  const handleAddDescription = () => {
    openDialog(({ id, onClose }) => <AddDescriptionDialog id={id} onClose={onClose} />);
  };

  const OrchestrationSettingsList = [
    [
      {
        title: "Rename",
        icon: <CursorTextIcon size={16} />,
        action: () => {},
      },
      {
        title: "Duplicate File",
        icon: <CopyIcon size={16} />,
        action: () => {},
      },
      {
        title: "Share",
        icon: <ShareNetworkIcon size={16} />,
        action: handleShare,
      },
    ],
    ...(isViewOnly
      ? []
      : [
          [
            {
              title: "Show version history",
              icon: <ClockCounterClockwiseIcon size={16} />,
              action: () => {
                if (isSubflowNode) {
                  navigate(`/canvas/${folderId}/${paramsFileId}/${configId}/subflowhistory`);
                } else {
                  navigate(`/canvas/${folderId}/${paramsFileId}/${configId}/history`);
                }
              },
            },
            {
              title: "Add description",
              icon: <ListPlusIcon size={16} />,
              action: handleAddDescription,
            },
          ],
        ]),
    [
      {
        title: "Move to archive",
        icon: <ArchiveIcon size={16} />,
        action: () => {},
      },
    ],
  ];

  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex flex-col mt-2">
        <div className="px-2 pt-2 pb-0.5 flex flex-col gap-1.5">
          <DropdownMenu>
            <div className="flex items-center gap-1 justify-between">
              <EditableFileName />
              <DropdownMenuTrigger asChild className="py-5">
                <SidebarMenuButton className="flex justify-center items-center w-4 h-4 p-0 rounded-none">
                  <div>
                    <ChevronDown width={14} />
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
            </div>
            <DropdownMenuContent className="w-fit" align="start" side="bottom">
              {OrchestrationSettingsList.map((group, i) => (
                <Fragment key={i}>
                  <DropdownMenuGroup>
                    {group.map((item) => (
                      <DropdownMenuItem key={item.title} onClick={item.action}>
                        {item.icon}
                        {item.title}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                  {i < OrchestrationSettingsList.length - 1 && <DropdownMenuSeparator />}
                </Fragment>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center pb-2">
          <PublishBadge />
          <DropdownMenu>
            <DropdownMenuTrigger asChild className={cn(!isSubflowNode && "hidden")}>
              <Button variant="outline" className={"rounded-l-none border-l-0 px-2"}>
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleNewSubflow} className="py-1.5 px-2 flex gap-2 items-center">
                <HexagonIcon />
                <span>As new Subflow</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
