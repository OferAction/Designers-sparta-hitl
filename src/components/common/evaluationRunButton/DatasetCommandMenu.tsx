import { DatabaseIcon, PlusIcon } from "@phosphor-icons/react";
import { useParams } from "react-router-dom";

import { Loader } from "@/components/common/Loader";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useGetDatasets } from "@/modules/dataset/services";
import type { Dataset } from "@/modules/dataset/types";

export interface SelectedDatasetSource {
  dataset: Dataset;
  subset: null;
}

interface DatasetCommandMenuProps {
  onSelect: (source: SelectedDatasetSource) => void;
  onConnectDataset: () => void;
}

/**
 * Command menu for browsing and selecting a dataset to evaluate against.
 * Displays a searchable list of available datasets with a sticky "connect dataset" action at the top.
 */
export function DatasetCommandMenu({ onSelect, onConnectDataset }: DatasetCommandMenuProps) {
  const { fileId } = useParams();
  const { data: datasets = [], isLoading } = useGetDatasets(fileId || "");

  return (
    <Command className="bg-popover border-border">
      <CommandInput placeholder="Connected Dataset..." className="border-none focus:ring-0" />
      <CommandList className="max-h-[220px] overflow-y-auto thin-scrollbar">
        <div className="border-b border-border sticky top-0 bg-background z-10 opacity-100">
          <button
            type="button"
            onClick={onConnectDataset}
            className="w-full flex items-center gap-2 px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
          >
            <PlusIcon className="size-4" />
            <span>connect dataset to workflow</span>
          </button>
        </div>
        <CommandGroup className="w-full">
          {isLoading && (
            <div className="flex items-center justify-center py-6">
              <Loader />
            </div>
          )}

          {!isLoading &&
            datasets.map((dataset) => {
              const isDisabled = dataset.hasMapping === false;

              return (
                <CommandItem
                  key={dataset.id}
                  value={`${dataset.name} ${dataset.id}`}
                  disabled={isDisabled}
                  onSelect={() => {
                    if (isDisabled) return;
                    onSelect({ dataset, subset: null });
                  }}
                  className="cursor-pointer hover:bg-accent hover:text-accent-foreground w-full flex items-center gap-2 truncate data-[disabled=true]:opacity-50 data-[disabled=true]:cursor-not-allowed"
                >
                  <DatabaseIcon className="size-4" weight="fill" />
                  <span className="truncate flex-1">{dataset.name}</span>
                </CommandItem>
              );
            })}
        </CommandGroup>
        {!isLoading && <CommandEmpty>No results found.</CommandEmpty>}
      </CommandList>
    </Command>
  );
}
