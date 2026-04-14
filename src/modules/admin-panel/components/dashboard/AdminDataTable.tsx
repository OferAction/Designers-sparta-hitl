import { useState } from "react";

import { CaretDownIcon, CheckIcon, FoldersIcon, TreeStructureIcon, UsersFourIcon } from "@phosphor-icons/react";
import { ColumnDef, FilterFn } from "@tanstack/react-table";

import { FilterType } from "@/types/user";

import AdminPageTable from "./AdminPageTable";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: FilterType;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface AdminDataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  isLoading?: boolean;
  searchPlaceholder?: string;
  className?: string;
  showFilter?: boolean;
  showTitle?: boolean;
  filterOptions?: FilterOption[];
  defaultFilter?: FilterType;
  selectedFilter?: FilterType;
  onFilterChange?: (filter: FilterType) => void;
  loadingMessage?: string;
  noResultMessage?: string;
  globalFilterFn?: FilterFn<TData>;
  onRowClick?: (row: TData) => void;
}

const DEFAULT_FILTER_OPTIONS: FilterOption[] = [
  { value: "Users", label: "Users", icon: UsersFourIcon },
  { value: "Workflows", label: "Workflows", icon: TreeStructureIcon },
  { value: "Projects", label: "Projects", icon: FoldersIcon },
];

/** Reusable admin data table with optional search and view-switcher filter dropdown */
export const AdminDataTable = <TData,>({
  data = [],
  isLoading = false,
  searchPlaceholder = "Search users",
  className = "",
  columns,
  showFilter = false,
  showTitle = false,
  filterOptions = DEFAULT_FILTER_OPTIONS,
  defaultFilter = "Users",
  selectedFilter,
  onFilterChange,
  loadingMessage = "Loading...",
  noResultMessage = "No results found.",
  globalFilterFn,
  onRowClick,
}: AdminDataTableProps<TData>) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [internalFilter, setInternalFilter] = useState<FilterType>(defaultFilter);

  const requestTypeFilter = selectedFilter ?? internalFilter;

  /** Updates the active view-switcher filter */
  const handleFilterChange = (filter: FilterType) => {
    if (selectedFilter === undefined) {
      setInternalFilter(filter);
    }
    onFilterChange?.(filter);
  };

  return (
    <div className={cn(`h-full flex flex-col gap-6`, className)}>
      <div className="flex items-end justify-between mx-1">
        <div className="flex flex-1 flex-col gap-4 items-start">
          {showTitle && (
            <span className="text-base text-foreground">{filterOptions.find((o) => o.value === requestTypeFilter)?.label ?? requestTypeFilter}</span>
          )}
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mt-1 max-w-sm bg-background border-input focus-visible:ring-foreground focus-visible:ring-1  focus-visible:ring-offset-[1px]"
          />
        </div>

        {showFilter && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 min-w-[115px] justify-between mt-1">
                <span className="text-sm text-sidebar-foreground/70 leading-6">
                  {filterOptions.find((o) => o.value === requestTypeFilter)?.label ?? requestTypeFilter}
                </span>
                <CaretDownIcon size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-[135px]" align="end">
              {filterOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => handleFilterChange(option.value)}
                    className={cn(requestTypeFilter === option.value && "bg-accent/40")}
                  >
                    <Icon className="size-4" />
                    <span>{option.label}</span>
                    {requestTypeFilter === option.value && <CheckIcon size={16} className="ml-2" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <AdminPageTable
        tableHeaderClassName="bg-background sticky top-0 z-10"
        tableRowHeaderClassName="border-sidebar-border hover:bg-transparent"
        tableRowClassName="border-sidebar-border"
        tableCellClassName="py-2"
        columns={columns}
        data={data}
        isLoading={isLoading}
        LoadingMessage={loadingMessage}
        NoResultMessage={noResultMessage}
        globalFilter={searchQuery}
        globalFilterFn={globalFilterFn}
        onRowClick={onRowClick}
      />
    </div>
  );
};

export default AdminDataTable;
