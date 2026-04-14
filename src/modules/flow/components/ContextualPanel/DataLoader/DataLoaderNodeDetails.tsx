import useDataLoaderRightPanelInputs from "@/modules/flow/hooks/useDataLoaderRightPanelInputs";

import { Option } from "@/components/ui/input-tag";
import { DataLoaderInputRowList } from "@/modules/flow/components/ContextualPanel/DataLoader/DataLoaderDynamicInputsSection";
import DataLoaderRightPanelDropdown from "@/modules/flow/components/ContextualPanel/DataLoader/DataLoaderRightPanelDropdown";
import { SectionContainer } from "@/modules/flow/components/ContextualPanel/SectionContainer";
import { SectionTitle } from "@/modules/flow/components/ContextualPanel/SectionTitle";
import { useSelectedNode } from "@/modules/flow/hooks";
import { NodeVariant } from "@/modules/flow/types";

export const DataLoaderNodeDetails = () => {
  const { onKeyChange, onValueChange, onOutputKeyChange, handleRemoveInputOutput } = useDataLoaderRightPanelInputs();

  const selectedNode = useSelectedNode<NodeVariant<"dataLoader">>();

  const handleInputKeyChange = (id: string, label: string) => {
    if (!selectedNode) return;
    const newInputs = onKeyChange(id, label);
    if (newInputs) {
      onOutputKeyChange(newInputs);
    }
  };
  const handleInputValueChange = (id: string, inputData: NonNullable<Option>) => {
    if (!selectedNode) return;
    onValueChange(id, inputData);
  };

  return (
    <SectionContainer>
      <SectionTitle title="Load on execution">
        <DataLoaderRightPanelDropdown />
      </SectionTitle>
      <DataLoaderInputRowList
        inputs={selectedNode?.data.inputs || []}
        onInputKeyChange={handleInputKeyChange}
        onInputValueChange={handleInputValueChange}
        handleRemoveInputOutput={handleRemoveInputOutput}
      />
    </SectionContainer>
  );
};

export default DataLoaderNodeDetails;
