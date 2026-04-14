import { useCallback } from "react";

import { PlugIcon } from "@phosphor-icons/react";

import { OCRProviderConfigModal } from "./OCRProviderConfigModal";
import { usePanelDialogContext } from "../../dialog";
import { PanelDialogWrapper } from "../../dialog/PanelDialogWrapper";
import { InputLabel } from "@/components/common/InputLabel";
import { useSelectedNode } from "@/modules/flow/hooks";
import { NodeVariant, OCRProviderConfig } from "@/modules/flow/types/BaseNodeTypes";
import { useFlowStore } from "@/store";

export const OCRHeaderConfig = () => {
  const { isOpen, openDialog, closeDialog } = usePanelDialogContext();
  const selectedNode = useSelectedNode<NodeVariant<"agent", "ocrAgent">>();
  const selectedNodeId = selectedNode?.id;
  const onChange = useFlowStore((state) => state.onChange);
  const handleSaveConfig = useCallback(
    (providerConfig: OCRProviderConfig) => {
      if (!selectedNodeId) return;

      const currentInputs = selectedNode?.data?.inputs || {};

      const newInputs = {
        ...currentInputs,
        provider_config: providerConfig,
      };

      onChange(selectedNodeId, "inputs", newInputs);
      closeDialog();
    },
    [selectedNodeId, onChange, selectedNode?.data?.inputs, closeDialog]
  );

  const handleCancel = useCallback(() => {
    closeDialog();
  }, [closeDialog]);

  const currentProviderConfig = selectedNode?.data?.inputs?.provider_config || {
    provider: "tesseract",
    api_key: "",
    endpoint_url: "",
    model_id: "",
    pages: "",
    reading_order: "left-to-right",
    language: "eng",
  };
  const getProviderDisplayName = (provider: string) => {
    const providerMap: Record<string, string> = {
      tesseract: "Tesseract",
      azure: "Azure Computer Vision OCR",
      google: "Google Vision API",
      aws: "AWS Textract",
    };
    return providerMap[provider] || provider;
  };
  const handleTriggerClick = () => {
    openDialog(
      <PanelDialogWrapper>
        <OCRProviderConfigModal initialConfig={currentProviderConfig} onSave={handleSaveConfig} onCancel={handleCancel} />
      </PanelDialogWrapper>
    );
  };

  return (
    <>
      <InputLabel
        variant={isOpen ? "active" : "emphasized"}
        size="sm"
        icon={<PlugIcon size={16} />}
        value={getProviderDisplayName(currentProviderConfig.provider) || "Configure OCR Provider"}
        onClick={handleTriggerClick}
      />
    </>
  );
};
