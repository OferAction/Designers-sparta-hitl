import { useState, useEffect } from "react";

import { Step1JsonlUpload } from "./Step1JsonlUpload";
import { Step2ZipUpload } from "./Step2ZipUpload";
import { validateJsonlFile } from "./utils/validateJsonl";
import { apiClients } from "@/api/axios-clients";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import API_CONFIG from "@/config/api.config";
import { useDatasetUpload } from "@/modules/dataset/services/datasetService";
interface AddDatasetDialogProps {
  id: string;
  onClose: () => void;
  onSubmit?: () => void;
}

export function AddDatasetDialog({ onClose, onSubmit }: AddDatasetDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [selectedZipFile, setSelectedZipFile] = useState<File | null>(null);
  const [autoConnect, setAutoConnect] = useState(true);
  const [datasetName, setDatasetName] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const { uploadDataset } = useDatasetUpload(autoConnect);

  // Generate dataset name from files
  useEffect(() => {
    if (selectedFile || selectedZipFile) {
      const baseName = selectedFile?.name.replace(".jsonl", "") || selectedZipFile?.name.replace(".zip", "") || "dataset";
      setDatasetName(baseName);
    }
  }, [selectedFile, selectedZipFile]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedFile(null);
      setValidationError(null);
      return;
    }

    // Validate the JSONL file
    setIsValidating(true);
    setValidationError(null);

    const validation = await validateJsonlFile(file);

    setIsValidating(false);

    if (!validation.valid) {
      setValidationError(validation.error || "Invalid JSONL file");
      setSelectedFile(null);
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    setValidationError(null);
  };

  const handleZipFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedZipFile(file || null);
  };

  const handleNext = () => {
    if (selectedFile && currentStep === 1) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      onClose();
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !selectedZipFile) {
      console.error("No files selected for upload");
      return;
    }

    uploadDataset({
      datasetName,
      jsonlFile: selectedFile,
      zipFile: selectedZipFile,
    });

    onClose();

    // Reset form
    setSelectedFile(null);
    setSelectedZipFile(null);
    setCurrentStep(1);
    setAutoConnect(true);
    setDatasetName("");
    onSubmit?.();
  };

  const handleDownloadExample = async () => {
    const file = await apiClients["DEFAULT"].get<File>(API_CONFIG.DEFAULT.ENDPOINTS.DATASET_JSONL_SAMPLE, {
      responseType: "blob",
    });
    const arrayBuffer = await file.data.arrayBuffer();
    const blob = new Blob([arrayBuffer]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "example.jsonl";
    a.click();
    a.remove();
  };

  const handleAutoConnectChange = (checked: boolean) => {
    setAutoConnect(checked);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-[720px] w-[720px] h-[650px] p-0 gap-0 overflow-hidden flex flex-col">
        {/* Header */}
        <DialogHeader className="p-6 space-y-1.5 text-left flex-shrink-0">
          <DialogTitle className="text-lg font-semibold text-foreground">Add new dataset to workspace</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Import JSONL and ZIP files formatted according to these instructions
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 px-7 pb-4 overflow-hidden flex flex-col">
          {currentStep === 1 ? (
            <Step1JsonlUpload
              selectedFile={selectedFile}
              onFileChange={handleFileChange}
              onDownloadExample={handleDownloadExample}
              validationError={validationError}
              isValidating={isValidating}
            />
          ) : (
            <Step2ZipUpload
              selectedZipFile={selectedZipFile}
              onZipFileChange={handleZipFileChange}
              autoConnect={autoConnect}
              onAutoConnectChange={handleAutoConnectChange}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 pt-4 border-t border-border flex-shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          </div>

          {currentStep === 1 ? (
            <Button variant="default" onClick={handleNext} disabled={!selectedFile} className="disabled:opacity-50">
              Next
            </Button>
          ) : (
            <Button variant="default" onClick={handleUpload} disabled={!selectedFile && !selectedZipFile} className="disabled:opacity-50">
              Upload
            </Button>
          )}
        </div>

        {/* Step Indicator */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="bg-secondary/75 px-2 py-1 rounded-md">
            <span className="text-xs font-medium text-foreground">{currentStep} / 2</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
