import React from "react";

import { PlugIcon, XIcon, MagnifyingGlassIcon, CaretRightIcon } from "@phosphor-icons/react";

import { AzureConfigurationModal } from "./azure";
import { OutlookConfigurationModal } from "./outlook";
import { OutlookIcon } from "@/lib/icons";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { StartNodeTrigger } from "@/modules/flow/types/BaseNodeTypes";
import { TRIGGER_TYPES } from "@/services";
import { cn } from "@/utils";

interface StartEventConfigurationModalProps {
  id: string;
  onClose: () => void;
  initialTrigger?: StartNodeTrigger;
}

const sources = [
  {
    label: "Outlook",
    icon: <OutlookIcon />,
    value: "outlook",
  },
  {
    label: "Azure Blob Storage",
    icon: <PlugIcon />,
    value: "azure_blob",
  },
];

export default function StartEventConfigurationModal({ onClose, id, initialTrigger }: StartEventConfigurationModalProps) {
  const [search, setSearch] = React.useState("");
  const [selectedSource, setSelectedSource] = React.useState<string | null>(null);

  function getHighlightedLabel(label: string, search: string) {
    if (!search.trim()) return label;
    const lowerLabel = label.toLowerCase();
    const lowerSearch = search.toLowerCase().trim();
    const matchIndex = lowerLabel.indexOf(lowerSearch);
    if (matchIndex === -1) return label;
    return (
      <>
        {label.substring(0, matchIndex)}
        <span className="bg-primary/10 text-primary font-semibold">{label.substring(matchIndex, matchIndex + search.length)}</span>
        {label.substring(matchIndex + search.length)}
      </>
    );
  }

  const filteredSources = sources.filter((src) => src.label.toLowerCase().includes(search.toLowerCase().trim()));

  if (initialTrigger) {
    if (initialTrigger.type === TRIGGER_TYPES.EmailTrigger) {
      return <OutlookConfigurationModal id={id} onClose={onClose} initialTrigger={initialTrigger} />;
    }
    if (initialTrigger.type === TRIGGER_TYPES.AzureTrigger) {
      return <AzureConfigurationModal id={id} onClose={onClose} initialTrigger={initialTrigger} />;
    }
  }

  if (selectedSource === "outlook") {
    return <OutlookConfigurationModal id={id} onClose={onClose} />;
  } else if (selectedSource === "azure_blob") {
    return <AzureConfigurationModal id={id} onClose={onClose} />;
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "w-[416px] border-border block bg-ocr-modal-bg/30 backdrop-blur-[10px] left-auto translate-x-0 translate-y-0 origin-center top-80 right-[427px]",
          "data-[state=closed]:!slide-out-to-right-full data-[state=closed]:!slide-out-to-top-0 data-[state=open]:!slide-in-from-right-full data-[state=open]:!slide-in-from-top-0 data-[state=closed]:!zoom-out-100 data-[state=open]:!zoom-in-100 data-[state=open]:!animate-z-index-slide-in data-[state=closed]:z-[5] !duration-200 px-0 py-0"
        )}
        hideCloseButton={true}
        overlayProps={{ className: "bg-transparent" }}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Start Event Configuration</DialogTitle>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-base font-medium">Start Event Configuration</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <XIcon size={20} />
          </button>
        </div>
        <div className="px-5 pt-4 pb-2">
          <label className="block text-xs text-muted-foreground mb-2">Source</label>
          <div className="relative mb-4">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <MagnifyingGlassIcon size={16} />
            </span>
            <input
              type="text"
              className={cn("pl-9 pr-3 py-2 w-full  border-b bg-transparent text-sm focus:outline-none ", "placeholder:text-muted-foreground")}
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            {filteredSources.length === 0 && search.trim() !== "" ? (
              <div className="py-6 text-center text-muted-foreground">No Source Found</div>
            ) : (
              filteredSources.map((src) => (
                <button
                  key={src.value}
                  className="flex items-center w-full px-3 py-2 rounded-md hover:bg-accent  transition text-left border border-transparent  focus:outline-none"
                  onClick={() => setSelectedSource(src.value)}
                >
                  <span className="mr-3">{src.icon}</span>
                  <span className="text-sm font-medium flex-1">{getHighlightedLabel(src.label, search)}</span>
                  <span className="ml-auto text-muted-foreground hover:text-foreground">
                    <CaretRightIcon size={16} />
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
