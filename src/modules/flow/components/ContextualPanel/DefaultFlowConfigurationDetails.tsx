import { DatabaseIcon, OpenAiLogoIcon, PlusIcon } from "@phosphor-icons/react";
import { useParams } from "react-router-dom";

import { ExecutionPathSection } from "./RunFlow/ExecutionPath";
import { IconSelectTag, SelectTag } from "@/components/common/input-tags";
import { InputTag } from "@/components/ui/input-tag";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetDatasets } from "@/modules/dataset/services";
import { ConnectDatasetDialog } from "@/modules/flow/components";
import { SectionContainer } from "@/modules/flow/components/ContextualPanel/SectionContainer";
import { SectionTitle, SectionTitleButton } from "@/modules/flow/components/ContextualPanel/SectionTitle";
import { WorkflowPathSection } from "@/modules/flow/components/ContextualPanel/WorkflowPath";
import { DatasetIndicator } from "@/modules/flow/components/Dataset/DatasetIndicator";
import { useGetConfiguration } from "@/services";
import { FlowStoreState, useDialogStoreActions, useFlowStore } from "@/store";

const DATASET_ICONS = () => {
  return () => <DatabaseIcon weight="fill" />;
};
const selector = (state: FlowStoreState) => ({
  selectedDatasetId: state.selectedDatasetId,
  nodes: state.nodes,
  mode: state.mode,
});

export const DefaultFlowConfigurationDetails = () => {
  const { configId = "", subflowConfigId = "" } = useParams();
  const { data, isLoading } = useGetConfiguration(subflowConfigId || configId);
  const { data: datasets } = useGetDatasets();
  const { major, minor, patch } = data?.version || {};
  const { nodes, selectedDatasetId, mode } = useFlowStore(selector);
  const { openDialog } = useDialogStoreActions();
  const connectedDataset = datasets?.find((dataset) => dataset.activeVersionId === selectedDatasetId);
  const handleDatasetClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();
    openDialog(({ id, onClose }) => <ConnectDatasetDialog id={id} onClose={onClose} />);
  };

  return (
    <>
      {mode === "build" && (
        <SectionContainer>
          <SectionTitle title="Workflow path" />
          <WorkflowPathSection />
        </SectionContainer>
      )}

      {mode === "run" && (
        <SectionContainer>
          <SectionTitle title="Execution path" />
          <ExecutionPathSection />
        </SectionContainer>
      )}

      <SectionContainer>
        <SectionTitle title="Workflow details" />
        <div className="flex items-center gap-2">
          <span className="text-foreground font-inter text-sm leading-5">Workflow Version</span>
          <span className="text-muted-foreground font-inter text-sm leading-5">
            {isLoading ? (
              <Skeleton className="w-1/2 h-5 self-stretch" />
            ) : (
              <>
                {major}.{minor}.{patch}
              </>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2 [&_[tag-root='true']]:min-w-0">
          <span className="text-foreground font-inter text-sm leading-5 shrink-0">
            {connectedDataset ? "Dataset connected" : "No Dataset connected"}
          </span>
          <InputTag.Root variant="flat" readonly className="pointer-events-auto h-6" onClick={handleDatasetClick}>
            <IconSelectTag iconClassName="text-muted-foreground" disabled ICONS={DATASET_ICONS} defaultValue={{ label: "object", value: "Object" }} />
            <SelectTag
              selectedOption={{
                label: connectedDataset?.name || "Click here to connect",
                value: connectedDataset?.activeVersionId || "",
              }}
              onOptionChange={() => {}}
              className="text-muted-foreground"
            />
          </InputTag.Root>
          <DatasetIndicator showWhenAutoConnected />
        </div>
        <span className="text-foreground font-inter text-sm leading-5">{nodes?.filter((n) => n.type === "subflow").length} Subflows in file</span>
      </SectionContainer>
      <SectionContainer>
        <SectionTitle title="LLM providers">
          <SectionTitleButton>
            <PlusIcon />
          </SectionTitleButton>
        </SectionTitle>
        <div className="flex items-center gap-2 py-1.5">
          <OpenAiLogoIcon className="text-sidebar-foreground size-5" weight="regular" />
          <span className="text-sidebar-foreground font-inter text-sm leading-5">OpenAI</span>
          <span className="text-muted-foreground font-inter text-xs leading-5">GPT 4.5</span>
        </div>
        <div className="flex items-center gap-2 py-1.5">
          <OpenAiLogoIcon className="text-sidebar-foreground size-5" weight="regular" />
          <span className="text-sidebar-foreground font-inter text-sm leading-5">OpenAI</span>
          <span className="text-muted-foreground font-inter text-xs leading-5">GPT 4o</span>
        </div>
      </SectionContainer>
    </>
  );
};
