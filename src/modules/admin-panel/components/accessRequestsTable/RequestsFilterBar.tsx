import { CaretDownIcon, CheckIcon } from "@phosphor-icons/react";
import type { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils";

import type { AccessRequest } from "./types";

export type RequestTypeFilter = "all" | "Editor" | "Viewer";

const TYPE_FILTERS: { label: string; value: RequestTypeFilter }[] = [
  { label: "All", value: "all" },
  { label: "Editor", value: "Editor" },
  { label: "Viewer", value: "Viewer" },
];

const SORT_OPTIONS: { label: string; desc: boolean }[] = [
  { label: "Newest first", desc: true },
  { label: "Oldest first", desc: false },
];

interface RequestsFilterBarProps {
  table: Table<AccessRequest>;
  searchInputClassName?: string;
}

export function RequestsFilterBar({ table, searchInputClassName }: RequestsFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between mb-4">
      <Input
        placeholder="Search requests..."
        value={table.getState().globalFilter ?? ""}
        onChange={(e) => table.setGlobalFilter(e.target.value)}
        className={cn("max-w-sm bg-background border-input focus-visible:ring-foreground ", searchInputClassName)}
      />
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-10 min-w-[140px] justify-between">
              <span className="text-sm font-normal text-sidebar-foreground/70 leading-5">
                {(table.getState().columnFilters.find((f) => f.id === "type")?.value as string) ?? "Request type"}
              </span>
              <CaretDownIcon size={14} className="text-sidebar-foreground/70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {TYPE_FILTERS.map(({ label, value }) => {
              const typeFilter = table.getState().columnFilters.find((f) => f.id === "type");
              const isSelected = value === "all" ? !typeFilter : typeFilter?.value === value;
              return (
                <DropdownMenuItem
                  key={value}
                  onClick={() => table.setColumnFilters(value === "all" ? [] : [{ id: "type", value }])}
                  className={cn(isSelected && "bg-accent/40")}
                >
                  <span>{label}</span>
                  {isSelected && <CheckIcon size={16} className="ml-2" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-10 min-w-[140px] justify-between">
              <span className="text-sm font-normal text-sidebar-foreground/70 leading-5">
                {SORT_OPTIONS.find((o) => o.desc === table.getState().sorting[0]?.desc)?.label ?? SORT_OPTIONS[0].label}
              </span>
              <CaretDownIcon size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {SORT_OPTIONS.map(({ label, desc }) => {
              const isSelected = table.getState().sorting[0]?.desc === desc;
              return (
                <DropdownMenuItem
                  key={label}
                  onClick={() => table.setSorting([{ id: "requested", desc }])}
                  className={cn(isSelected && "bg-accent/40")}
                >
                  <span>{label}</span>
                  {isSelected && <CheckIcon size={16} className="ml-2" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
