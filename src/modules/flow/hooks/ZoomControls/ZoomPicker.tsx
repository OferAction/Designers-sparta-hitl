import React from "react";

import { ArrowFatUpIcon } from "@phosphor-icons/react";

import { MAX_ZOOM, MIN_ZOOM, PRESET_ZOOM_LABELS } from "./constants";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";

type Props = {
  zoomInput: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;

  presetZooms: readonly number[];
  onSelectPreset: (percent: number) => void;
  onFitView: () => void;

  onInputChange: (value: string) => void;
  onSubmit: (value: string) => void;
};

export const ZoomPicker = React.memo(function ZoomPicker({
  zoomInput,
  open,
  onOpenChange,
  presetZooms,
  onSelectPreset,
  onFitView,
  onInputChange,
  onSubmit,
}: Props) {
  return (
    <Popover open={open} onOpenChange={onOpenChange} modal={false}>
      <PopoverAnchor asChild>
        <div className="flex items-center" id="zoom-picker-trigger">
          <div className="relative">
            <input
              aria-label="Zoom percentage"
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-12 h-6 text-sm font-medium leading-6 bg-transparent outline-none rounded px-1 pr-4 border border-transparent focus:border-border"
              maxLength={3}
              min={MIN_ZOOM * 100}
              max={MAX_ZOOM * 100}
              value={zoomInput}
              onChange={(e) => onInputChange(e.target.value)}
              onFocus={() => onOpenChange(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onSubmit(zoomInput);
                  onOpenChange(false);
                  e.currentTarget.blur();
                }
              }}
            />
            <span className="absolute right-1 top-0 h-full flex items-center text-sm font-medium leading-6 pointer-events-none">%</span>
          </div>
        </div>
      </PopoverAnchor>

      <PopoverContent
        className="p-0 w-48"
        sideOffset={6}
        id="zoom-picker-command-list"
        onInteractOutside={(e) => {
          if (e.target instanceof HTMLElement && e.target.closest("#zoom-picker-trigger")) {
            e.preventDefault();
            return;
          }
        }}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command className="w-full" value={`${zoomInput}%`}>
          <CommandList>
            <CommandEmpty>No zoom found.</CommandEmpty>

            <CommandGroup>
              {presetZooms.map((p) => (
                <CommandItem
                  key={p}
                  value={`${p}%`}
                  onSelect={() => {
                    onSelectPreset(p);
                    onOpenChange(false);
                  }}
                >
                  {p}%
                  {PRESET_ZOOM_LABELS[p as keyof typeof PRESET_ZOOM_LABELS] && (
                    <span className="ml-auto flex items-center gap-1 text-xs tracking-widest text-muted-foreground whitespace-nowrap">
                      <ArrowFatUpIcon className="size-4" /> {PRESET_ZOOM_LABELS[p as keyof typeof PRESET_ZOOM_LABELS]}
                    </span>
                  )}
                </CommandItem>
              ))}

              <CommandSeparator />

              <CommandItem
                value="fit"
                onSelect={() => {
                  onFitView();
                  onOpenChange(false);
                }}
              >
                zoom to fit
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
});
