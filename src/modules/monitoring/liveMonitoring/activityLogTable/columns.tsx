import { TrashIcon, ArrowsDownUpIcon as ArrowUpDown, DotsThreeIcon as MoreHorizontal } from "@phosphor-icons/react/dist/ssr";
import { ColumnDef } from "@tanstack/react-table";
import moment from "moment";

import { Activity, TriggerTypeKeys } from "../../services/types";
import { statusIconMapping, triggerIconMapping } from "../constants";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { formatDuration } from "@/utils/durationFormatting";

export const columns: ColumnDef<Activity>[] = [
  {
    accessorKey: "status",
    header: () => (
      <div className="w-full h-full group">
        <ArrowUpDown className="hidden group-hover:block cursor-pointer" size={16} />
      </div>
    ),
    cell: ({ getValue, row }) => {
      const statusIcon = statusIconMapping[getValue() as string] || null;

      if (row.original.hasFlags) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>{statusIcon}</div>
              </TooltipTrigger>
              <TooltipContent>
                {row.original.hasSystemExceptions && <p className="text-destructive">System_rule_name</p>}
                {row.original.hasAgenticExceptions && <p className="text-warning">Agentic_rule_name</p>}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }

      return statusIcon;
    },
    enableSorting: false,
    enableHiding: false,
    size: 30,
  },
  {
    accessorKey: "startDateTime",
    header: "Started",
    cell: ({ getValue }) => {
      const utcDate = getValue() as moment.MomentInput;
      const formattedDate = moment.utc(utcDate).format("MMMM D, YYYY h:mm:ss A");
      return <div className="truncate">{formattedDate}</div>;
    },
    size: 100,
  },
  {
    accessorKey: "jobId",
    header: "ID",
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="lowercase max-w-20 truncate">{row.getValue("jobId")}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="lowercase">{row.getValue("jobId")}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
    size: 70,
  },
  {
    accessorKey: "triggerType",
    header: "Trigger",
    cell: ({ getValue }) => {
      const triggerType = getValue() as TriggerTypeKeys;
      const IconComponent = triggerIconMapping[triggerType];
      return <>{IconComponent ? <IconComponent className="size-4" /> : null}</>;
    },
    size: 60,
  },

  {
    accessorKey: "executionTime",
    header: "Time",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("executionTime"));

      return <div>{formatDuration(amount)}</div>;
    },
    size: 50,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: () => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <TrashIcon className="size-4 inline-block" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 40,
  },
];
