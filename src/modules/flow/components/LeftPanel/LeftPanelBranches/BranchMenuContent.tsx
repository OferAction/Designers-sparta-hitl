import React, { SVGProps, useMemo } from "react";

import {
  ArrowCounterClockwiseIcon,
  CaretRightIcon,
  CopySimpleIcon,
  FlowArrowIcon,
  PencilSimpleIcon,
  ScrollIcon,
  TrashIcon,
  WarningCircleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

import { useHandleArchiveBranch } from "@/modules/flow/components/LeftPanel/LeftPanelBranches/useHandleArchiveBranch";
import { useHandleDuplicate } from "@/modules/flow/components/LeftPanel/LeftPanelBranches/useHandleDuplicate";

import { BranchIcon } from "@/lib/icons";
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import {
  PushBranchDialog,
  CreateBranchDialog,
  EditBranchDialog,
  EditLiveBranchDialog,
  UnpublishAlert,
} from "@/modules/flow/components/BranchingDialogs";
import { File } from "@/modules/workspace";
import { useDialogStoreActions } from "@/store";
import { cn } from "@/utils";

type MenuItem =
  | ({
      id: string;
      icon: React.FC<SVGProps<SVGSVGElement>>;
      label: string;
      showCaret?: boolean;
      isSeparator?: false;
      visible?: boolean;
    } & React.ComponentPropsWithoutRef<typeof DropdownMenuItem>)
  | { id: string; isSeparator: true };

type BranchMenuContentProps = {
  branch: File;
  isParentBranch?: boolean;
  onClose?: () => void;
  onRenameTrigger?: () => void;
} & React.ComponentPropsWithoutRef<typeof DropdownMenuContent>;

export function BranchMenuContent({ branch, isParentBranch, onClose, onRenameTrigger, ...props }: BranchMenuContentProps) {
  const { openDialog } = useDialogStoreActions();
  const duplicateFile = useHandleDuplicate(branch.id);
  const archiveBranch = useHandleArchiveBranch(branch);
  const navigate = useNavigate();

  const branchMenuItems = useMemo<MenuItem[]>(
    () => [
      {
        id: "duplicate",
        icon: CopySimpleIcon,
        label: "Duplicate",
        onClick: async (e) => {
          e.stopPropagation();
          duplicateFile(branch);
        },
      },
      {
        id: "push-to-live",
        icon: FlowArrowIcon,
        label: "Push to Live",
        onClick: (e) => {
          e.stopPropagation();
          openDialog(({ id, onClose }) => (
            <PushBranchDialog
              id={id}
              branch={branch}
              onClose={onClose}
              defaultValues={{
                sourceBranch: {
                  label: branch.name,
                  value: branch.id,
                },
              }}
            />
          ));
          onClose?.();
        },
      },
      // {
      //   id: "share",
      //   icon: ShareFatIcon,
      //   label: "Share",
      //   onClick: (e) => {
      //     e.stopPropagation();
      //     console.log("Share clicked");
      //   },
      //   disabled: true,
      // },
      {
        id: "rename",
        icon: PencilSimpleIcon,
        label: "Rename",
        onClick: (e) => {
          e.stopPropagation();
          onRenameTrigger?.();
          onClose?.();
        },
        visible: !!onRenameTrigger,
      },
      {
        id: "get-info",
        icon: WarningCircleIcon,
        label: "Info",
        onClick: (e) => {
          e.stopPropagation();
          openDialog(({ id, onClose }) => <EditBranchDialog id={id} onClose={onClose} branch={branch} />);
        },
      },
      { id: "separator" as const, isSeparator: true },
      {
        id: "version-history",
        icon: ScrollIcon,
        label: "Version History",
        onClick: (e) => {
          e.stopPropagation();
          navigate(`/canvas/${branch.projectId}/${branch.id}/history`);
          onClose?.();
        },
      },
      {
        id: "archive",
        icon: TrashIcon,
        label: "Archive",
        onClick: (e) => {
          e.stopPropagation();
          archiveBranch();
        },
      },
    ],
    [archiveBranch, branch, duplicateFile, navigate, onClose, onRenameTrigger, openDialog]
  );

  const parentMenuItems = useMemo<MenuItem[]>(
    () => [
      {
        id: "create-branch",
        icon: BranchIcon,
        label: "Create Branch",
        onClick: () => {
          openDialog(({ id, onClose }) => <CreateBranchDialog id={id} onClose={onClose} />);
          onClose?.();
        },
      },
      {
        id: "rename",
        icon: PencilSimpleIcon,
        label: "Rename",
        onClick: (e) => {
          e.stopPropagation();
          onRenameTrigger?.();
          onClose?.();
        },
        visible: !!onRenameTrigger,
      },
      {
        id: "get-info",
        icon: WarningCircleIcon,
        label: "Info",
        onClick: (e) => {
          e.stopPropagation();
          openDialog(({ id, onClose }) => <EditLiveBranchDialog id={id} onClose={onClose} branch={branch} />);
        },
      },
      { id: "separator", isSeparator: true },
      {
        id: "Rollback",
        icon: ArrowCounterClockwiseIcon,
        label: "Rollback",
        onClick: (e) => {
          e.stopPropagation();
          navigate(`/canvas/${branch.projectId}/${branch.id}/history`);
          onClose?.();
        },
      },
      {
        id: "unpublish",
        icon: ({ className, ...props }) => <XIcon {...props} className={cn("text-destructive", className)} />,
        label: "Unpublish",
        onClick: (e) => {
          e.stopPropagation();
          openDialog(({ id, onClose }) => <UnpublishAlert id={id} onClose={onClose} branchId={branch.parentFileId || branch.id} />);
          onClose?.();
        },
      },
    ],
    [onRenameTrigger, openDialog, onClose, branch, navigate]
  );

  const menuItems = (isParentBranch ? parentMenuItems : branchMenuItems).filter((item) => (item.isSeparator ? true : item.visible !== false));

  return (
    <DropdownMenuContent align="start" side="right" sideOffset={22} collisionPadding={8} className="w-56" {...props}>
      {menuItems.map((item) => {
        if (item.isSeparator) {
          return <DropdownMenuSeparator key={item.id} />;
        }

        const { icon: Icon, id, label, showCaret, className, ...rest } = item;
        return (
          <DropdownMenuItem key={id} className={cn("cursor-pointer", className)} {...rest}>
            <Icon className="mr-2 h-4 w-4" />
            <span>{label}</span>
            {showCaret && <CaretRightIcon className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        );
      })}
    </DropdownMenuContent>
  );
}
