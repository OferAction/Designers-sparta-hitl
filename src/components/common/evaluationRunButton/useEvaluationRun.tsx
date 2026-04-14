import { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { useToast } from "@/hooks/use-toast";

import { useGetConfigurationDatasetMappingById, useGetDatasetVersion, useGetDatasets, useGetSubsetsByDatasetId } from "@/modules/dataset/services";
import type { Dataset, Subset } from "@/modules/dataset/types";
import { useStartEvaluation } from "@/modules/evaluation/services";
import { ConnectDatasetDialog } from "@/modules/flow/components";
import { useDialogStoreActions } from "@/store";
import useEvaluationRunStore, { computeDefaultAmount, FULL_DATASET } from "@/store/evaluationRunStore";

import type { SelectedDatasetSource } from "./DatasetCommandMenu";

const createSelector = (fileId: string | undefined) => (state: ReturnType<typeof useEvaluationRunStore.getState>) => ({
  settings: fileId ? (state.settingsByFileId[fileId] ?? null) : null,
  setAmount: state.setAmount,
  setDescription: state.setDescription,
  selectDataset: state.selectDataset,
  selectRadio: state.selectRadio,
  setSelectedDatasetId: state.setSelectedDatasetId,
});

/**
 * Encapsulates all business logic for the evaluation run popover:
 * dataset auto-selection, subset derivation, sample counting, and evaluation submission.
 */
export function useEvaluationRun() {
  const [open, setOpen] = useState(false);
  const [datasetMenuOpen, setDatasetMenuOpen] = useState(false);

  const { folderId, fileId, configId } = useParams();

  const { settings, setAmount, setDescription, selectDataset, selectRadio, setSelectedDatasetId } = useEvaluationRunStore(
    useShallow(createSelector(fileId))
  );

  const selectedDatasetId = settings?.selectedDatasetId ?? null;
  const radioValue = settings?.radioValue ?? FULL_DATASET;
  const amount = settings?.amount ?? 0;
  const description = settings?.description ?? "";

  const navigate = useNavigate();
  const { mutate, isPending, data: evaluationResponse } = useStartEvaluation();
  const { data: configurationDatasetMapping } = useGetConfigurationDatasetMappingById(fileId!);
  const { data: datasetVersion } = useGetDatasetVersion(configurationDatasetMapping?.datasetVersionId || "");
  const { data: datasets = [] } = useGetDatasets(fileId || "");
  const { data: datasetSubsets = [] } = useGetSubsetsByDatasetId(selectedDatasetId || "");
  const { toast } = useToast();
  const { openDialog } = useDialogStoreActions();

  /** Derive the active dataset from the configuration mapping and available datasets. */
  const activeDataset = useMemo<Dataset | null>(() => {
    if (!configurationDatasetMapping?.datasetVersionId || datasets.length === 0) return null;
    return datasets.find((d) => d.activeVersionId === configurationDatasetMapping.datasetVersionId) ?? null;
  }, [configurationDatasetMapping?.datasetVersionId, datasets]);

  /** Auto-select the active dataset when it becomes available and no dataset is selected yet. */
  useEffect(() => {
    if (activeDataset && !selectedDatasetId && fileId) {
      setSelectedDatasetId(fileId, activeDataset.id);
    }
  }, [activeDataset, selectedDatasetId, setSelectedDatasetId, fileId]);

  /** Derived selected dataset from datasets list and selectedDatasetId. */
  const selectedDataset = useMemo<Dataset | null>(() => {
    if (!selectedDatasetId) return null;
    return datasets.find((d) => d.id === selectedDatasetId) ?? null;
  }, [selectedDatasetId, datasets]);

  /** Active (non-deleted) subsets for the selected dataset. */
  const activeSubsets = useMemo<Subset[]>(() => {
    return datasetSubsets.filter((subset) => !subset.isDeleted);
  }, [datasetSubsets]);

  /** Derived selected subset from the radio value. */
  const selectedSubset = useMemo<Subset | null>(() => {
    if (radioValue === FULL_DATASET) return null;
    return activeSubsets.find((subset) => subset.id === radioValue) ?? null;
  }, [radioValue, activeSubsets]);

  const hasMappingErrors = evaluationResponse?.withoutMissingValues === false;

  /** Total sample count depending on whether a subset or full dataset is selected. */
  const totalSamples = useMemo(() => {
    if (selectedSubset) return selectedSubset.subsetJobCount;
    return selectedDataset?.samplesCount ?? 0;
  }, [selectedDataset, selectedSubset]);

  /** Number of samples to display in the evaluate button label. */
  const evaluateSamplesCount = useMemo(() => {
    if (amount > 0) return amount;
    return totalSamples;
  }, [totalSamples, amount]);

  /** Opens the connect-dataset dialog. */
  const handleConnectDataset = useCallback(() => {
    openDialog(({ id, onClose }) => <ConnectDatasetDialog id={id} onClose={onClose} />);
  }, [openDialog]);

  /** Called when a dataset is chosen from the command menu. */
  const handleDatasetSourceSelect = useCallback(
    (source: SelectedDatasetSource) => {
      if (fileId) {
        selectDataset(fileId, source.dataset.id, computeDefaultAmount(source.dataset.samplesCount));
      }
      setDatasetMenuOpen(false);
    },
    [selectDataset, fileId]
  );

  /** Handle radio change for subset / all-data selection. */
  const handleRadioChange = useCallback(
    (value: string) => {
      if (!fileId) return;

      const isFullDataset = value === FULL_DATASET;
      const totalForSelection = isFullDataset
        ? (selectedDataset?.samplesCount ?? 0)
        : (activeSubsets.find((s) => s.id === value)?.subsetJobCount ?? 0);

      selectRadio(fileId, value, computeDefaultAmount(totalForSelection));
    },
    [selectRadio, fileId, selectedDataset, activeSubsets]
  );

  /** Navigate to the dataset mapping page. */
  const handleViewMapping = useCallback(() => {
    if (configId) {
      navigate(`/canvas/${folderId}/${fileId}/${configId}/dataset`);
    }
  }, [navigate, folderId, fileId, configId]);

  /** Submit evaluation with the full API payload. */
  const handleEvaluate = useCallback(() => {
    if (!configId) return;
    if (datasetVersion?.status !== "Completed") {
      toast({ title: "Dataset Extraction is Not Completed", variant: "destructive" });
      return;
    }

    mutate({
      configurationDatasetMappingId: selectedDataset?.mappingId || "",
      subsetId: selectedSubset?.id,
      configurationId: configId,
      evaluationSamplesCount: amount > 0 ? amount : undefined,
      description,
      runFastTest: false,
    });
  }, [configId, datasetVersion, toast, mutate, selectedDataset, selectedSubset, amount, description]);

  /** Update the sample amount for the current file. */
  const handleSetAmount = useCallback(
    (value: number) => {
      if (fileId) {
        setAmount(fileId, value);
      }
    },
    [fileId, setAmount]
  );

  /** Update the evaluation description for the current file. */
  const handleSetDescription = useCallback(
    (value: string) => {
      if (fileId) {
        setDescription(fileId, value);
      }
    },
    [fileId, setDescription]
  );

  return {
    open,
    setOpen,
    datasetMenuOpen,
    setDatasetMenuOpen,
    selectedDataset,
    activeSubsets,
    radioValue,
    amount,
    setAmount: handleSetAmount,
    description,
    setDescription: handleSetDescription,
    evaluateSamplesCount,
    hasMappingErrors,
    isPending,
    handleConnectDataset,
    handleDatasetSourceSelect,
    handleRadioChange,
    handleViewMapping,
    handleEvaluate,
  };
}
