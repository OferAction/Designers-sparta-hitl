import { useState } from "react";

import { ArrowsCounterClockwiseIcon, DotsThreeIcon } from "@phosphor-icons/react";
import { useNavigate, useParams } from "react-router-dom";

import { BranchMenuContent } from "./BranchMenuContent";
import { EditBranchName } from "./EditBranchName";
import { useStaleBranchNotification } from "./useStaleBranchNotification";
import { WorkflowUpdatePopover } from "./WorkflowUpdatePopover";
import { BranchIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { BranchStatus } from "@/modules/flow/components/BranchStatus";
import { File } from "@/modules/workspace";

export function BranchItem({ branch }: { branch: File }) {
  const navigate = useNavigate();
  const { fileId = "" } = useParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const { dismissed, handleIgnore, handleUpdate } = useStaleBranchNotification(branch);
  const [isEditing, setIsEditing] = useState(false);

  const { name, version, id, projectId, parentFileId } = branch;

  const isActive = fileId === id;
  const notificationOpen = !dismissed && !menuOpen && isActive && branch.isLatestVersion === false;

  const handleBranchClick = (e: React.MouseEvent) => {
    if (isEditing) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (isActive) return;
    navigate(`/canvas/${projectId}/${id}`);
  };

  const handleRenameCancel = () => {
    setIsEditing(false);
  };

  const isParentBranch = !parentFileId;

  const renderStatusIcon = () => {
    if (isParentBranch) {
      return <BranchStatus isPublished={true} />;
    }

    if (branch.isLatestVersion === false) {
      return <ArrowsCounterClockwiseIcon className="text-blue-accent" />;
    }

    return <BranchIcon />;
  };

  return (
    <WorkflowUpdatePopover open={notificationOpen} onIgnore={handleIgnore} onUpdate={handleUpdate}>
      <SidebarMenuItem className="mx-2" onClick={handleBranchClick}>
        <SidebarMenuButton className="group-has-[[data-active=false]]/menu-item:group-hover/menu-item:bg-muted/40 pr-11" isActive={isActive}>
          {renderStatusIcon()}
          {!isEditing && <span>{name}</span>}
          {isEditing && <EditBranchName branch={branch} onCancel={handleRenameCancel} />}
        </SidebarMenuButton>
        {version && (
          <SidebarMenuBadge className="font-roboto-mono text-xs text-right text-muted-foreground group-hover/menu-item:hidden group-has-[[data-state=open]]/menu-item:hidden">
            V{version.major}.{version.minor}
          </SidebarMenuBadge>
        )}
        <DropdownMenu onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuBadge className="pointer-events-auto size-fit cursor-pointer font-roboto-mono text-xs text-right min-w-[unset] text-muted-foreground hidden group-hover/menu-item:flex group-has-[[data-state=open]]/menu-item:flex">
              <Button variant="secondary" className="size-5 p-0.5">
                <DotsThreeIcon weight="regular" />
              </Button>
            </SidebarMenuBadge>
          </DropdownMenuTrigger>
          {menuOpen && <BranchMenuContent onRenameTrigger={() => setIsEditing(true)} isParentBranch={isParentBranch} branch={branch} />}
        </DropdownMenu>
      </SidebarMenuItem>
    </WorkflowUpdatePopover>
  );
}
