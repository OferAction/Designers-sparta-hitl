import { useCallback, useEffect, useMemo, useState } from "react";

import { DatabaseIcon } from "@phosphor-icons/react/Database";
import { useParams, useSearchParams } from "react-router-dom";
import { useShallow } from "zustand/shallow";

import { usePopulateFormFromData } from "./hooks";
import { LoadFromDatasetProps } from "./types";
import { SubsetIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { HierarchicalDropdownMenu } from "@/components/ui/HierarchicalDropdownMenu";
import { NonNullableOption, Option } from "@/components/ui/input-tag";
import { useGetDatasetSample, useGetFileDatasets } from "@/modules/dataset/services";
import { FlowStoreState, useFlowStore } from "@/store";

const selector = (state: FlowStoreState) => ({
  runDatasetSelection: state.runDatasetSelection,
  setRunDatasetSelection: state.setRunDatasetSelection,
  selectedDatasetId: state.selectedDatasetId,
});

export const LoadFromDataset = ({ inputs, scope }: LoadFromDatasetProps) => {
  const { fileId } = useParams();

  const [searchParams] = useSearchParams();
  const windowSubsetId = searchParams.get("subsetId");
  const windowSelectedIndex = parseInt(searchParams.get("subsetIndex") || "0", 10);

  const { data: datasets = [], isLoading: isLoadingDatasets, isFetching: isFetchingDatasets } = useGetFileDatasets(fileId || "");
  const { populateFormFromData } = usePopulateFormFromData(inputs, scope);
  const [shouldAutoFill, setShouldAutoFill] = useState(false);

  const { runDatasetSelection, setRunDatasetSelection, selectedDatasetId } = useFlowStore(useShallow(selector));
  const handleDatasetChange = (option: Option | null) => {
    if (!option) {
      setRunDatasetSelection({
        datasetId: null,
        mappingId: null,
        subsetId: null,
        datasetIndex: null,
        rowIndex: null,
      });
      return;
    }

    if ((option as NonNullableOption).isSubset) {
      const child = option as NonNullableOption;
      const count = child?.subsetJobCount ?? 0;
      const lastIndex = count > 0 ? count - 1 : null;
      setRunDatasetSelection({
        datasetId: child.datasetActiveVersionId ?? null,
        mappingId: child.mappingId ?? null,
        subsetId: child.value,
        datasetIndex: lastIndex !== null ? lastIndex : null,
        rowIndex: lastIndex,
      });
    } else {
      const dataset = datasets.find((d) => d.activeVersionId === option.value);
      const count = dataset?.samplesCount ?? 0;
      const lastIndex = count > 0 ? count - 1 : null;
      setRunDatasetSelection({
        datasetId: option.value,
        mappingId: dataset?.mappingId || null,
        subsetId: null,
        datasetIndex: lastIndex !== null ? lastIndex : null,
        rowIndex: lastIndex,
      });
    }
  };

  const handleItemChange = (option: Option | null) => {
    const indexValue = option?.value || null;
    const numericIndex = indexValue !== null ? (typeof indexValue === "number" ? indexValue : parseInt(indexValue, 10)) : null;
    setRunDatasetSelection({
      datasetIndex: numericIndex,
      rowIndex: numericIndex,
    });
  };

  const datasetOptions = useMemo(() => {
    return datasets.map((dataset) => ({
      label: dataset.name,
      value: dataset.activeVersionId,
      id: dataset.id,
      key: dataset.id,
      icon: DatabaseIcon,
      searchText: dataset.name.toLowerCase(),
      samplesCount: dataset.samplesCount,
      mappingId: dataset.mappingId,
      children: dataset.subsets.map((subset) => ({
        label: subset.name,
        value: subset.id,
        id: subset.id,
        key: subset.id,
        isSubset: true,
        subsetJobCount: subset.subsetJobCount,
        datasetActiveVersionId: dataset.activeVersionId,
        mappingId: dataset.mappingId,
        icon: SubsetIcon,
      })),
    }));
  }, [datasets]);

  const selectedDataset = useMemo(() => {
    if (runDatasetSelection.subsetId) {
      for (const dataset of datasetOptions) {
        const subset = dataset.children?.find((child) => child.value === runDatasetSelection.subsetId);
        if (subset) return subset;
      }
    }
    const explicit = datasetOptions.find((dataset) => dataset.value === runDatasetSelection.datasetId) || null;
    if (explicit) return explicit;
    if (selectedDatasetId) {
      return datasetOptions.find((dataset) => dataset.value === selectedDatasetId) || null;
    }
    return null;
  }, [datasetOptions, runDatasetSelection.datasetId, runDatasetSelection.subsetId, selectedDatasetId]);

  const availableItems = useMemo(() => {
    let count = 0;
    if (runDatasetSelection.subsetId) {
      const parent = datasetOptions.find((d) => d.children?.some((child) => child.value === runDatasetSelection.subsetId));
      const subset = parent?.children?.find((child) => child.value === runDatasetSelection.subsetId);
      count = subset?.subsetJobCount || 0;
    } else {
      const parentDataset = datasetOptions.find((d) => d.value === runDatasetSelection.datasetId);
      count = parentDataset?.samplesCount || 0;
    }
    return Array.from({ length: count }, (_, index) => ({
      label: `item ${index + 1}`,
      value: String(index),
    }));
  }, [runDatasetSelection.subsetId, runDatasetSelection.datasetId, datasetOptions]);

  const { refetch: refetchDatasetSample } = useGetDatasetSample(
    runDatasetSelection.mappingId || "",
    runDatasetSelection.datasetIndex !== null ? runDatasetSelection.datasetIndex : 0,
    runDatasetSelection.subsetId || "",
    { enabled: !!runDatasetSelection.mappingId && runDatasetSelection.datasetIndex !== null && !!runDatasetSelection.subsetId }
  );

  const handleFillFields = useCallback(async () => {
    const { data } = await refetchDatasetSample();
    if (data) {
      populateFormFromData(data.inputsDict);
    }
  }, [populateFormFromData, refetchDatasetSample]);

  const initializeFromWindowSubset = useCallback(() => {
    if (isLoadingDatasets || datasets.length === 0) return;
    if (!inputs || inputs.length === 0) return;
    if (!windowSubsetId) return;
    if (runDatasetSelection.subsetId === windowSubsetId) return;

    const sampleIndex = windowSelectedIndex !== undefined ? windowSelectedIndex - 1 : 0;
    const parentDataset = datasetOptions.find((d) => d.children?.some((child) => child.value === windowSubsetId));
    if (parentDataset) {
      setRunDatasetSelection({
        datasetId: parentDataset.value,
        mappingId: parentDataset.mappingId,
        subsetId: windowSubsetId,
        datasetIndex: sampleIndex,
        rowIndex: sampleIndex,
      });
      setShouldAutoFill(true);
    }
  }, [
    isLoadingDatasets,
    datasets,
    inputs,
    windowSubsetId,
    windowSelectedIndex,
    datasetOptions,
    runDatasetSelection.subsetId,
    setRunDatasetSelection,
  ]);

  useEffect(() => {
    initializeFromWindowSubset();
  }, [initializeFromWindowSubset]);

  useEffect(() => {
    if (isLoadingDatasets || datasets.length === 0) return;
    if (runDatasetSelection.subsetId) return;
    if (runDatasetSelection.datasetId) return;
    if (!selectedDatasetId) return;

    const parentDataset = datasets.find((d) => d.activeVersionId === selectedDatasetId);
    if (parentDataset) {
      const count = parentDataset?.samplesCount ?? 0;
      const lastIndex = count > 0 ? count - 1 : null;
      setRunDatasetSelection({
        datasetId: parentDataset.activeVersionId,
        mappingId: parentDataset.mappingId,
        subsetId: null,
        datasetIndex: lastIndex !== null ? lastIndex : null,
        rowIndex: lastIndex,
      });
    }
  }, [selectedDatasetId, isLoadingDatasets, datasets, runDatasetSelection.subsetId, runDatasetSelection.datasetId, setRunDatasetSelection]);

  useEffect(() => {
    if (!shouldAutoFill) return;
    if (!runDatasetSelection.mappingId || runDatasetSelection.datasetIndex === null || !runDatasetSelection.subsetId) return;

    setShouldAutoFill(false);
    handleFillFields();
  }, [shouldAutoFill, runDatasetSelection.mappingId, runDatasetSelection.datasetIndex, runDatasetSelection.subsetId, handleFillFields]);

  return (
    <div className="flex items-center gap-1 mt-2">
      <HierarchicalDropdownMenu
        value={selectedDataset}
        onChange={handleDatasetChange}
        options={datasetOptions}
        placeholder="Select a dataset"
        className=" flex-1 max-w-[10rem]"
        isLoading={isLoadingDatasets || isFetchingDatasets}
      />

      <Combobox
        value={availableItems.find((item) => item.value === String(runDatasetSelection.datasetIndex)) || null}
        onChange={handleItemChange}
        options={availableItems}
        placeholder="Item"
        className="flex-1 max-w-full"
        disabled={!runDatasetSelection.datasetId}
      />

      <div>
        <Button
          variant="default"
          type="button"
          onClick={handleFillFields}
          disabled={
            !runDatasetSelection.datasetId || isLoadingDatasets || !runDatasetSelection.mappingId || runDatasetSelection.datasetIndex === null
          }
        >
          Fill Fields
        </Button>
      </div>
    </div>
  );
};
