import { ArrowSquareOutIcon } from "@phosphor-icons/react";
import { createColumnHelper } from "@tanstack/react-table";
import moment from "moment";
import { Link } from "react-router-dom";

import { getInitials } from "./utils";
import { SortDescIcon as ArrowUp, SortAscIcon as ArrowDown } from "@/lib/icons";
import { getColorIndex } from "@/components/common/Collaborators";
import { Loader } from "@/components/common/Loader";
import WithTooltip from "@/components/common/WithTooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ACCESS_REQUEST_STATUS } from "@/types/accessRequest";
import { cn } from "@/utils";

import type { AccessRequest } from "./types";

const columnHelper = createColumnHelper<AccessRequest>();

export interface AccessRequestsTableMeta {
  onApprove: (id: string) => void;
  onDecline: (id: string) => void;
  approveButtonTooltip?: string;
  pendingRequestIds?: string[];
  pendingStatus?: number | null;
  headerCellClassName?: string;
  bodyCellClassName?: string;
}

export function createAccessRequestColumns(meta: AccessRequestsTableMeta) {
  const { onApprove, onDecline, approveButtonTooltip, pendingRequestIds = [], pendingStatus } = meta;
  return [
    columnHelper.accessor("userName", {
      id: "name",
      header: ({ column }) => {
        const isSorted = column.getIsSorted() || false;
        return (
          <div
            className="inline-flex items-center gap-1 group/header cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span className="text-sm text-muted-foreground">Name</span>
            <span className="flex cursor-pointer items-center group-hover/header:opacity-100 opacity-0 ml-2 gap-0.5">
              <ArrowUp className={cn(" h-4", isSorted === "asc" ? "text-foreground" : "opacity-30")} />
              <ArrowDown className={cn("h-4", isSorted === "desc" ? "text-foreground" : "opacity-30")} />
            </span>
          </div>
        );
      },
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className={cn("text-sm font-normal leading-none text-white", getColorIndex(r.userName))}>
                {getInitials(r.userName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">{r.userName}</span>
              <span className="text-xs text-muted-foreground">{r.userEmail}</span>
            </div>
          </div>
        );
      },
      enableSorting: true,
      sortingFn: (rowA, rowB) => rowA.original.userName.localeCompare(rowB.original.userName),
    }),
    columnHelper.accessor("roleLabel", {
      id: "roleLabel",
      header: "Type",
      cell: ({ getValue }) => {
        const value = getValue();
        return (
          <span className="items-center -ml-1 gap-1.5 text-secondary-foreground bg-secondary  px-2.5 py-1 text-xs font-medium rounded-full">
            {value}
          </span>
        );
      },
      enableSorting: true,
      filterFn: (row, columnId, value) => (value ? row.getValue(columnId) === value : true),
    }),
    columnHelper.accessor("entityName", {
      id: "workflow",
      header: "Workflow",
      cell: ({ getValue, row }) => {
        const value = getValue();
        const r = row.original;
        return (
          <div className="flex items-center ">
            {value ? (
              // TODO: add link to workflow
              <Link to={r.entityLink} target="_blank">
                <Button variant="ghost" size="sm" className="group bg-transparent hover:bg-transparent pl-0 ml-0 text-xs">
                  <span className="text-xs text-muted-foreground max-w-[150px] truncate block">{value} </span>
                  <ArrowSquareOutIcon size={14} className="text-white/80 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </Link>
            ) : (
              <span className="text-muted-foreground">__</span>
            )}
          </div>
        );
      },
      enableSorting: true,
      filterFn: "includesString",
    }),
    columnHelper.accessor("createdAt", {
      id: "requested",
      header: "Requested",
      cell: ({ getValue }) => <span className="text-muted-foreground text-xs">{getValue() ? moment(getValue()).fromNow() : "__"}</span>,
    }),
    columnHelper.accessor("comment", {
      id: "note",
      header: "Note",
      cell: ({ getValue }) => <span className="text-muted-foreground text-xs max-w-[200px] truncate block">{getValue() ?? ""}</span>,
      enableSorting: true,
      filterFn: "includesString",
    }),
    columnHelper.display({
      id: "actions",
      header: () => null,
      cell: ({ row }) => {
        const requestId = row.original.id;
        const isThisRowPending = pendingRequestIds.includes(requestId);
        const isDeclinePending = isThisRowPending && pendingStatus === ACCESS_REQUEST_STATUS.Declined;
        const isApprovePending = isThisRowPending && pendingStatus === ACCESS_REQUEST_STATUS.Approved;
        const buttonsDisabled = isThisRowPending;
        return (
          <div className="flex justify-end gap-2 items-center min-h-9">
            <Button variant="secondary" size="sm" onClick={() => onDecline(requestId)} disabled={buttonsDisabled}>
              {isDeclinePending ? <Loader className="size-4" /> : "Decline"}
            </Button>
            {approveButtonTooltip ? (
              <WithTooltip tooltip={approveButtonTooltip}>
                <Button size="sm" className="min-w-[70px]" onClick={() => onApprove(requestId)} disabled={buttonsDisabled}>
                  {isApprovePending ? <Loader className="size-4" /> : "Approve"}
                </Button>
              </WithTooltip>
            ) : (
              <Button size="sm" className="min-w-[70px]" onClick={() => onApprove(requestId)} disabled={buttonsDisabled}>
                {isApprovePending ? <Loader className="size-4" /> : "Approve"}
              </Button>
            )}
          </div>
        );
      },
      enableSorting: false,
    }),
  ];
}
