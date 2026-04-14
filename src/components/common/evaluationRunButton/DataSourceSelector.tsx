import { CaretDownIcon, CaretUpIcon, DatabaseIcon } from "@phosphor-icons/react";

import { DatasetCommandMenu } from "./DatasetCommandMenu";
import { Label } from "@/components/ui/label";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";

import type { SelectedDatasetSource } from "./DatasetCommandMenu";

interface DataSourceSelectorProps {
  datasetMenuOpen: boolean;
  onDatasetMenuOpenChange: (open: boolean) => void;
  selectedDatasetName: string | undefined;
  onSelect: (source: SelectedDatasetSource) => void;
  onConnectDataset: () => void;
}

/**
 * Data source section with label, description, and dataset selector dropdown.
 * Opens a nested popover to the left containing a command menu for dataset selection.
 */
export function DataSourceSelector({
  datasetMenuOpen,
  onDatasetMenuOpenChange,
  selectedDatasetName,
  onSelect,
  onConnectDataset,
}: DataSourceSelectorProps) {
  return (
    <div className="p-3">
      <div className="pb-1">
        <Label className="text-sm font-semibold">Data source</Label>
        <p className="text-xs text-muted-foreground mt-0.5">Select mapped dataset and range within it.</p>
      </div>

      {/* Dataset selector dropdown – opens command menu to the left */}
      <Popover open={datasetMenuOpen} onOpenChange={onDatasetMenuOpenChange}>
        <PopoverAnchor asChild>
          <button
            type="button"
            className="flex items-center gap-2 w-full rounded-lg border border-border-blue bg-blue-accent/10 px-3 py-2 hover:bg-blue-accent/20 transition-colors cursor-pointer"
            onClick={() => onDatasetMenuOpenChange(!datasetMenuOpen)}
          >
            <DatabaseIcon className="h-4 w-4 shrink-0" />
            <span className="text-sm truncate flex-1 text-left">{selectedDatasetName ?? "Select a dataset"}</span>
            {datasetMenuOpen ? <CaretUpIcon className="h-4 w-4 shrink-0" /> : <CaretDownIcon className="h-4 w-4 shrink-0" />}
          </button>
        </PopoverAnchor>

        <PopoverContent
          side="left"
          align="start"
          sideOffset={8}
          className="w-[320px] p-0 rounded-lg shadow-lg"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DatasetCommandMenu onSelect={onSelect} onConnectDataset={onConnectDataset} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
