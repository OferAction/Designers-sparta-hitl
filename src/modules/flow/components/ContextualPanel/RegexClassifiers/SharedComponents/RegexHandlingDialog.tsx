import { useState } from "react";

import { XIcon, CaretDownIcon, CaretRightIcon } from "@phosphor-icons/react";
import { DialogTitle } from "@radix-ui/react-dialog";

import RegexAdvancedSettings from "./RegexAdvancedSettings";
import RegexPatternsList from "./RegexPatternsList";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { PanelDialogWrapper } from "@/modules/flow/components/dialog/PanelDialogWrapper";
import type { RegexClass } from "@/modules/flow/types";

type RegexHandlingDialogProps = {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  regexClass?: RegexClass | null;
  onUpdate?: (next: RegexClass) => void;
};

export function RegexHandlingDialog({ open, onOpenChange, regexClass, onUpdate }: RegexHandlingDialogProps) {
  const classLabel = regexClass?.key?.trim() || "Regex class";
  const regexPatterns = regexClass?.regex_patterns ? regexClass!.regex_patterns.map((r) => r.value) : [];
  const unwantedRegexPatterns = regexClass?.unwanted_regex_patterns ? regexClass!.unwanted_regex_patterns.map((r) => r.value) : [];
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [unwantedOpen, setUnwantedOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <PanelDialogWrapper
        position="none"
        className={cn("border-border bg-ocr-modal-bg/30 backdrop-blur-[10px] left-auto translate-x-0 translate-y-0 origin-center")}
        resizable={{
          enabled: true,
          directions: ["left", "bottom"],
          defaultSize: { width: 320, height: 420 },
          minWidth: 300,
          minHeight: 320,
          maxHeight: "76vh" ,
        }}
        observeLeftPanel={true}
      >
        <DialogTitle className="sr-only">{classLabel}</DialogTitle>
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
          <div className="flex-1 min-w-0 mr-2">
            <div className="flex items-center w-fit border rounded-md hover:border-border border-muted">
              <input
                value={regexClass?.key || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (regexClass && onUpdate) {
                    onUpdate({ ...regexClass, key: val });
                  }
                }}
                placeholder="Class name"
                className="h-7 p-1 text-sm w-full bg-transparent outline-none placeholder:text-muted-foreground/50"
              />
            </div>
          </div>
          <button onClick={() => onOpenChange(false)} className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-sm p-1">
            <XIcon size={16} />
          </button>
        </div>

        <div className="py-3 flex flex-col gap-3 overflow-y-scroll  max-h-[70vh]">
          <div className="flex flex-col gap-3 px-4  pt-4 pb-3 border-b border-border">
            <span className="text-xs font-medium text-sidebar-foreground/70">Regex Patterns</span>
            <div className="pl-1.5">
              <RegexPatternsList
                items={regexPatterns}
                onChange={(next) => {
                  if (regexClass && onUpdate) {
                    const nextItems = next.map((v, i) => ({ id: String(i), value: v }));
                    onUpdate({ ...regexClass, regex_patterns: nextItems });
                  }
                }}
                addPlaceholder="add regex pattern"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 px-4  pt-4 pb-3 border-b border-border">
            <button
              className="flex items-center gap-2 text-xs font-medium text-sidebar-foreground/70 hover:text-foreground"
              onClick={() => setUnwantedOpen((v) => !v)}
            >
              {unwantedOpen ? <CaretDownIcon weight="fill" size={12} /> : <CaretRightIcon weight="fill" size={12} />}
              Unwanted Regex Patterns
            </button>
            {unwantedOpen && (
              <div className="pl-1.5">
                <RegexPatternsList
                  items={unwantedRegexPatterns}
                  onChange={(next) => {
                    if (regexClass && onUpdate) {
                      const nextItems = next.map((v, i) => ({ id: String(i), value: v }));
                      onUpdate({ ...regexClass, unwanted_regex_patterns: nextItems });
                    }
                  }}
                  addPlaceholder="add unwanted regex pattern"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 px-4 pt-4 pb-3">
            <button
              className="flex items-center gap-2 text-xs font-medium text-sidebar-foreground/70 hover:text-foreground"
              onClick={() => setAdvancedOpen((v) => !v)}
            >
              {advancedOpen ? <CaretDownIcon weight="fill" size={12} /> : <CaretRightIcon weight="fill" size={12} />}
              Advanced settings
            </button>
            {advancedOpen && regexClass && (
              <RegexAdvancedSettings
                value={regexClass}
                onChange={(partial) => {
                  if (!onUpdate) return;
                  onUpdate({ ...regexClass, ...partial });
                }}
              />
            )}
          </div>
        </div>
      </PanelDialogWrapper>
    </Dialog>
  );
}
