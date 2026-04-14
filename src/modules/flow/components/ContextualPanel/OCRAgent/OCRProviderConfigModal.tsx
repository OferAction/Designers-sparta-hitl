import { useState, useCallback } from "react";

import { DialogClose } from "@radix-ui/react-dialog";

import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Option } from "@/components/ui/input-tag/old-deprecated/InputTag/types";
import { Label } from "@/components/ui/label";
import { OCRProviderConfig } from "@/modules/flow/types/BaseNodeTypes";
import { cn } from "@/utils";

interface OCRProviderConfigModalProps {
  initialConfig: OCRProviderConfig;
  onSave: (config: OCRProviderConfig) => void;
  onCancel: () => void;
}

const providerOptions: Option[] = [
  { value: "tesseract", label: "Tesseract" },
  { value: "azure_document_intelligence", label: "Azure Computer Vision" },
  { value: "google", label: "Google Vision API" },
  { value: "aws", label: "AWS Textract" },
];

const readingOrderOptions: Option[] = [
  { value: "left-to-right", label: "Left to Right" },
  { value: "right-to-left", label: "Right to Left" },
  { value: "top-to-bottom", label: "Top to Bottom" },
];

const languageOptions: Option[] = [
  { value: "en", label: "English" },
  { value: "ar", label: "Arabic" },
  { value: "sp", label: "Spanish" },
  { value: "fr", label: "French" },
];

export const OCRProviderConfigModal = ({ initialConfig, onSave, onCancel }: OCRProviderConfigModalProps) => {
  const [config, setConfig] = useState<OCRProviderConfig>(initialConfig);

  const handleChange = useCallback((field: keyof OCRProviderConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  }, []);
  return (
    <div>
      <div className={cn("grid grid-cols-[120px_1fr] gap-1 items-center mb-4")}>
        <Label className="text-lg">Provider</Label>
        <Combobox
          options={providerOptions}
          value={providerOptions.find((o) => o.value === config.provider) || providerOptions[0]}
          onChange={(opt) => opt && handleChange("provider", opt.value)}
          placeholder="Select provider..."
        />
      </div>
      <div className={cn("border-t border-border")}></div>
      <div className="p-3">
        <div className={cn("text-xs font-medium text-muted-foreground my-6")}>Provider settings</div>

        <div className={cn("space-y-4")}>
          <div className={cn("grid grid-cols-[120px_1fr] gap-4 items-center")}>
            <Label className={cn("text-sm font-medium text-white")}>API Key</Label>
            <Input
              className={cn(
                "bg-background text-white placeholder:text-slate-400 h-9 focus:ring-0 focus:border-primary border border-border rounded-md px-3"
              )}
              type="password"
              value={config.api_key}
              onChange={(e) => handleChange("api_key", e.target.value)}
              placeholder="Enter your Azure API key"
            />
          </div>
          <div className={cn("grid grid-cols-[120px_1fr] gap-4 items-center")}>
            <Label className={cn("text-sm font-medium text-white")}>Endpoint URL</Label>
            <Input
              className={cn(
                "bg-background text-white placeholder:text-slate-400 h-9 focus:ring-0 focus:border-primary border border-border rounded-md px-3"
              )}
              value={config.endpoint_url}
              onChange={(e) => handleChange("endpoint_url", e.target.value)}
              placeholder="https://<your-resource-name>.cognitiveservices.azure.com/"
            />
          </div>
          <div className={cn("grid grid-cols-[120px_1fr] gap-4 items-center")}>
            <Label className={cn("text-sm font-medium text-white")}>Model ID</Label>
            <Combobox
              options={[
                { value: "prebuilt-read", label: "prebuilt-read" },
                { value: "prebuilt-layout", label: "prebuilt-layout" },
                { value: "prebuilt-document", label: "prebuilt-document" },
              ]}
              value={{ value: config.model_id, label: config.model_id || "choose from the list..." }}
              onChange={(opt) => opt && handleChange("model_id", opt.value)}
              placeholder="choose from the list..."
            />
          </div>
          <div className={cn("grid grid-cols-[120px_1fr] gap-4 items-center")}>
            <Label className={cn("text-sm font-medium text-white")}>Pages</Label>
            <div className="space-y-1">
              <Input
                className={cn(
                  "bg-background text-white placeholder:text-slate-400 h-9 focus:ring-0 focus:border-primary border border-border rounded-md px-3"
                )}
                type="text"
                value={config.pages}
                onChange={(e) => handleChange("pages", e.target.value)}
                placeholder="e.g. 1, 2, 3, 5-7, 10-12"
              />
            </div>
          </div>
          <div className={cn("grid grid-cols-[120px_1fr] gap-4 items-center")}>
            <Label className={cn("text-sm font-medium text-white")}>Reading Order</Label>
            <Combobox
              options={readingOrderOptions}
              value={readingOrderOptions.find((o) => o.value === config.reading_order) || readingOrderOptions[0]}
              onChange={(opt) => opt && handleChange("reading_order", opt.value)}
              placeholder="Select reading order strategy..."
            />
          </div>
          <div className={cn("grid grid-cols-[120px_1fr] gap-4 items-center")}>
            <Label className={cn("text-sm font-medium text-white")}>Languages</Label>
            <Combobox
              options={languageOptions}
              value={languageOptions.find((o) => o.value === config.language) || languageOptions[0]}
              onChange={(opt) => opt && handleChange("language", opt.value)}
              placeholder="Select..."
            />
          </div>
        </div>
      </div>
      <div className="border-t border-border -mx-6"></div>
      <DialogFooter className="flex flex-row pt-4 justify-between">
        <DialogClose asChild>
          <Button variant="outline" onClick={onCancel} className="mr-auto">
            Cancel
          </Button>
        </DialogClose>
        <Button onClick={() => onSave(config)}>Save changes</Button>
      </DialogFooter>
    </div>
  );
};
