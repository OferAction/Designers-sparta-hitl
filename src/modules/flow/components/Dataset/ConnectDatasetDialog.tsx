import { useState } from "react";

import { PlusIcon } from "@phosphor-icons/react";

import { AddDatasetDialog } from "./AddDatasetDialog";
import { DatasetListItem } from "./DatasetListItem";
import { Loader } from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useGetDatasets } from "@/modules/dataset/services";
import { useDialogStoreActions, useFlowStore } from "@/store";

interface ConnectDatasetDialogProps {
  id: string;
  onClose: () => void;
}

export function ConnectDatasetDialog({ onClose }: ConnectDatasetDialogProps) {
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("workspace");
  const { data: datasets, isLoading } = useGetDatasets();
  const { openDialog } = useDialogStoreActions();

  const handleConnect = () => {
    if (selectedDataset) {
      useFlowStore.getState().connectDataset(selectedDataset);
      onClose();
    }
  };

  const handleAddNew = () => {
    openDialog(({ id, onClose: onAddDatasetClose }) => <AddDatasetDialog id={id} onClose={onAddDatasetClose} onSubmit={onClose} />);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-[722px] w-[722px] h-[656px] p-0 gap-0 overflow-hidden flex flex-col">
        {/* Header */}
        <DialogHeader className="p-6 space-y-1.5 text-left flex-shrink-0">
          <DialogTitle className="text-lg font-semibold text-foreground">Select Dataset to connect</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Associate a dataset to this orchestration for testing and evaluating purposes
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 px-6 py-2 pb-8 space-y-6 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full space-y-6">
            {/* Tabs and Add New Button */}
            <div className="flex items-center justify-between gap-2 flex-shrink-0">
              <TabsList className="h-10 p-1 bg-secondary">
                <TabsTrigger
                  value="workspace"
                  className="px-3 py-1.5 text-sm font-medium h-8 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Datasets in Workspace
                </TabsTrigger>
                <TabsTrigger
                  value="api"
                  className="px-3 py-1.5 text-sm font-medium h-8 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Connect with API
                </TabsTrigger>
              </TabsList>

              <Button variant="default" size="sm" onClick={handleAddNew} className="gap-1">
                Add new
                <PlusIcon size={16} />
              </Button>
            </div>

            {/* Dataset List */}
            <TabsContent value="workspace" className="mt-0 flex-1 overflow-hidden">
              <div className="border border-border overflow-y-auto rounded-lg h-full styled-scrollbar">
                {isLoading ? (
                  <Loader />
                ) : (
                  datasets?.map((dataset) => (
                    <DatasetListItem
                      key={dataset.id}
                      dataset={dataset}
                      isSelected={selectedDataset === dataset.activeVersionId}
                      onClick={setSelectedDataset}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="api" className="mt-0 flex-1 overflow-hidden">
              <div className="border border-border rounded-lg p-8 text-center h-full flex items-center justify-center">
                <div className="text-muted-foreground">API connection functionality coming soon...</div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 pt-0 border-t-0 flex-shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>

          <Button variant="purple" onClick={handleConnect} disabled={!selectedDataset} className="disabled:opacity-50">
            Connect
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
