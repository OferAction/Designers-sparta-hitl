import React, { useEffect, useMemo } from "react";

import { DatabaseIcon } from "@phosphor-icons/react/Database";
import { PlusIcon } from "@phosphor-icons/react/Plus";
import { useParams } from "react-router-dom";

import { Combobox, ComboboxProps } from "@/components/ui/combobox";
import { NonNullableOption } from "@/components/ui/input-tag";
import { useDataset, useSelectedDataset } from "@/modules/dataset/hooks";
import { useGetConfigurationDatasetMappingById, useGetDatasets } from "@/modules/dataset/services";
import { ConnectDatasetDialog } from "@/modules/flow/components";
import { useDialogStoreActions } from "@/store";

const ConnectedDataset: React.FC = () => {
  const { data: datasets = [], isLoading } = useGetDatasets();
  const { samplesCount, labelsCount, dataItemsCount } = useDataset();
  const { selectedDatasetId, setSelectedDatasetId } = useSelectedDataset();
  const { openDialog } = useDialogStoreActions();
  const { fileId } = useParams();
  const { data, isFetched, isSuccess } = useGetConfigurationDatasetMappingById(fileId ? fileId : "");

  useEffect(() => {
    if (isFetched && isSuccess) {
      setSelectedDatasetId(data?.datasetVersionId ?? null);
    }
  }, [data, isFetched, isSuccess, setSelectedDatasetId]);

  const handleDatasetChange = (option: NonNullableOption | null) => {
    setSelectedDatasetId(option?.value || null);
  };

  const handleAddNewDataset = () => {
    openDialog(({ id, onClose }) => <ConnectDatasetDialog id={id} onClose={onClose} />);
  };

  const newDatasetOption: ComboboxProps["stickyFooterAction"] = {
    label: "Add a new dataset",
    icon: <PlusIcon className="min-h-4 min-w-4 h-4 w-4 ml-1 text-white" />,
    onClick: handleAddNewDataset,
  };

  const datasetOptions = useMemo(() => {
    return datasets.map((dataset) => ({
      label: dataset.name,
      value: dataset.activeVersionId,
      id: dataset.id,
      key: dataset.id,
      icon: DatabaseIcon,
      searchText: dataset.name.toLowerCase(),
    }));
  }, [datasets]);

  const selectedDataset = useMemo(() => {
    return datasetOptions.find((dataset) => dataset.value === selectedDatasetId) || null;
  }, [datasetOptions, selectedDatasetId]);

  return (
    <div className="pb-4 -mx-4 px-4 border-b">
      <div className="flex flex-col gap-2">
        {/* Header */}
        <div className="text-sm font-normal text-foreground leading-5">Connected Dataset</div>

        {/* Dataset Selector */}
        <div className="w-full max-w-md">
          <Combobox
            value={selectedDataset}
            onChange={handleDatasetChange}
            options={datasetOptions}
            placeholder={isLoading ? "Loading datasets..." : "Select dataset..."}
            className="flex items-center self-stretch gap-0 bg-blue-background hover:bg-blue-background/90 rounded-md text-blue-foreground border-blue-foreground/20"
            disabled={isLoading}
            stickyFooterAction={newDatasetOption}
          />
        </div>
        {/* Stats and Actions */}
        <div className="flex items-center justify-between text-xs font-normal leading-5">
          <div className="text-muted-foreground gap-2 flex items-center">
            <span>
              <span>{labelsCount}</span> labels
            </span>
            <span>
              <span>{dataItemsCount}</span> data items
            </span>
            <span>
              <span>{samplesCount}</span> samples
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectedDataset;
