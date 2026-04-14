import { useMemo, useState } from "react";

import { DotsThreeIcon, ArrowsDownUpIcon as ArrowUpDown } from "@phosphor-icons/react";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import moment from "moment";
import { useNavigate, useParams } from "react-router-dom";

import { useParentFileId } from "@/hooks/useFileCache";

import { BranchesDialogTable } from "./BranchesDialogTable";
import { BRANCH_TYPES } from "./BranchTypeField";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { BranchMenuContent } from "@/modules/flow/components/LeftPanel/LeftPanelBranches/BranchMenuContent";
import { useGetBranches } from "@/modules/flow/services";
import { File } from "@/modules/workspace/types";

type BranchesOverviewDialogProps = {
  id: string;
  onClose: () => void;
};

const genColumns: (onClose?: () => void) => ColumnDef<File>[] = (onClose) => [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "owner",
    header: "Owner",
    maxSize: 40,
  },
  {
    id: "type",
    accessorFn: (row) => BRANCH_TYPES.find((type) => type.value === row.type)?.label || "Fix",
    header: ({ column }) => {
      return (
        <div className="flex items-center gap-1 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Type
          <ArrowUpDown className="size-4" />
        </div>
      );
    },
  },
  {
    header: "Date",
    accessorFn: (row) => moment(row.updateTime),
    cell: ({ getValue }) => {
      return (
        <span>
          {getValue<moment.Moment>().format("MMM. D, YYYY")}
          <br />
          {getValue<moment.Moment>().format("h:mm A")}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="size-8 p-0.5">
              <DotsThreeIcon weight="regular" />
            </Button>
          </DropdownMenuTrigger>
          <BranchMenuContent
            onClose={onClose}
            branch={row.original}
            side="right"
            align="start"
            sideOffset={0}
            isParentBranch={!row.original.parentFileId}
          />
        </DropdownMenu>
      );
    },
    maxSize: 0,
  },
];

export function BranchesOverviewDialog({ onClose }: BranchesOverviewDialogProps) {
  const [selectedRow, setSelectedRow] = useState<File | null>(null);
  const navigate = useNavigate();
  const { fileId = "" } = useParams();
  const [branchParentFileId] = useParentFileId(fileId);
  const { data: branches, isLoading } = useGetBranches(branchParentFileId);

  const handleOpen = () => {
    onClose();
    const isActive = fileId === selectedRow?.id;
    if (isActive) return;
    navigate(`/canvas/${selectedRow?.projectId}/${selectedRow?.id}`);
  };

  const columns = useMemo(() => genColumns(onClose), [onClose]);

  return (
    <Dialog modal={false} open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-muted/40 backdrop-blur-[20px] p-4 gap-0 h-4/5 flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-sm">Branches Overview</DialogTitle>
        </DialogHeader>
        <div className="bg-border h-px -mx-4" />
        <BranchesDialogTable onRowSelect={setSelectedRow} data={branches} columns={columns} isLoading={isLoading} />
        <DialogFooter className="gap-2 sm:gap-0 mt-6">
          <DialogClose className="max-w-[138px] w-full" type="button">
            Close
          </DialogClose>
          <Button onClick={handleOpen} className="max-w-[138px] w-full" variant="secondary" type="submit" disabled={!selectedRow}>
            Open
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
