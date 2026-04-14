import { useState } from "react";

import { FlowArrowIcon } from "@phosphor-icons/react";
import moment from "moment";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileCreateRequest } from "@/modules/workspace";
import { useCreateSubflowMutation, useCreateSubflowVariables, useGetSubflowsProjectService } from "@/services/subflowConfiguratinService";
import { FlowStoreState, useFlowStore } from "@/store";

interface ConnectDatasetDialogProps {
  id: string;
  onClose: () => void;
}
const saveSelector = (state: FlowStoreState) => ({
  getCurrentConfig: state.getCurrentConfig,
});
export function CreateCustomSubflowDialog({ onClose }: ConnectDatasetDialogProps) {
  const [activeTab, setActiveTab] = useState<"In Current Workspace" | "Local device">("In Current Workspace");
  const [subflowName, setSubflowName] = useState<string>("");

  const { data: subflows, isLoading: isSubflowsLoading } = useGetSubflowsProjectService();
  const { mutate: createSubflowMutation } = useCreateSubflowMutation();
  const { getCurrentConfig } = useFlowStore(saveSelector);
  const { mutate: createConfiguration } = useCreateSubflowVariables();
  const navigate = useNavigate();

  const config = getCurrentConfig();
  const stringifiedConfig = JSON.stringify(config);
  const handleCreateSubflow = (projectId: string) => {
    const newSubflow: FileCreateRequest = {
      name: subflowName,
      description: "",
      projectId,
    };
    createSubflowMutation(newSubflow, {
      onSuccess: (subflowFileData) => {
        createConfiguration(
          {
            frontendConfigurationSerialized: stringifiedConfig,
            $fileId: subflowFileData.id,
          },
          {
            onSuccess: (subflowConfigData) => {
              navigate(`/canvas/${subflowFileData.projectId}/${subflowFileData.id}/${subflowConfigData.id}/subflow`, {
                replace: true,
              });
              onClose();
            },
          }
        );
      },
    });
  };
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-[722px] w-[722px] h-[656px] p-0 gap-0 overflow-hidden flex flex-col">
        {/* Header */}
        <DialogHeader className="p-6 space-y-1.5 text-left flex-shrink-0">
          <DialogTitle className="text-lg font-semibold text-foreground">New Custom Subflow</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {subflows && subflows.length > 0 ? subflows[0].description : "Publish a copy of this Action subflow to customize it as your own"}
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 px-6 py-2 pb-8 space-y-6 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={(value: string) => setActiveTab(value as "Local device" | "In Current Workspace")}
            className="flex flex-col h-full space-y-6"
          >
            {/* Tabs and Add New Button */}
            <div className="flex items-center justify-between gap-2 flex-shrink-0">
              <TabsList className="h-10 p-1 bg-secondary">
                <TabsTrigger
                  value="In Current Workspace"
                  className="px-3 py-1.5 text-sm font-medium h-8 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  In Current Workspace
                </TabsTrigger>
                <TabsTrigger
                  value="Local device"
                  className="px-3 py-1.5 text-sm font-medium h-8 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Local device
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Dataset List */}
            <TabsContent value="In Current Workspace" className="mt-0 flex-1 min-h-0 flex flex-col">
              <div className="border border-border overflow-y-auto rounded-lg flex-1 px-2 styled-scrollbar">
                {isSubflowsLoading ? (
                  <div className="py-4 text-center text-muted-foreground">Loading subflows...</div>
                ) : subflows && subflows.length > 0 ? (
                  subflows[0].files.map((file) => (
                    <div key={file.id} className="flex items-center py-1.5 gap-4">
                      <div className="p-2 border rounded">
                        <FlowArrowIcon className="text-foreground" />
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="text-foreground font-medium">{file.name}</span>
                        <span className="text-muted-foreground">1342 items</span>
                      </div>
                      <span className="text-muted-foreground"> {moment(file.updateTime).fromNow()}</span>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center text-muted-foreground">No subflows found</div>
                )}
              </div>
              <div className="pt-7">
                <Input
                  variant="tag"
                  type="text"
                  placeholder="Enter subflow name"
                  className="px-3 py-2.5"
                  value={subflowName}
                  onChange={(e) => setSubflowName(e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="Local device" className="mt-0 flex-1 overflow-hidden">
              <span>Local device</span>
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

          <Button onClick={() => handleCreateSubflow(subflows && subflows.length > 0 ? subflows[0].id : "")} variant="purple" size="default">
            Publish
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
