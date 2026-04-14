import React, { useState, useCallback, useMemo, useEffect } from "react";

import { XIcon } from "@phosphor-icons/react";
import { cva } from "class-variance-authority";
import debounce from "lodash.debounce";

import { useToast } from "@/hooks/use-toast";

import { ControlledFileInput } from "@/components/common/ControlledFileInput";
import InputField from "@/components/common/InputField/InputField";
import { NonNullableOption as Option } from "@/components/ui/input-tag";
import { DataLoaderInputs } from "@/modules/flow/types";
import { useUploadFile } from "@/services/";
import { cn } from "@/utils";

interface FileUploadProps {
  onUploadSuccess?: (fileNames: string[]) => void;
  onUploadError?: (error: Error) => void;
  className?: string;

  onInputValueChange?: (inputId: string, value: Option) => void;
  input: DataLoaderInputs;
  hasExternalError?: boolean;
}

const inputVariants = cva("", {
  variants: {
    hasValue: {
      true: "",
      false: "",
    },
    hasError: {
      true: "border-red-500",
      false: "",
    },
  },
  defaultVariants: {
    hasValue: false,
    hasError: false,
  },
});

export const FileUpload: React.FC<FileUploadProps> = ({
  className,
  onUploadSuccess,
  onUploadError,
  onInputValueChange,
  input,
  hasExternalError = false,
}) => {
  const { toast } = useToast();
  const [urlInput, setUrlInput] = useState("");

  const isMatch = useCallback((url: string): boolean => {
    const urlRegex = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(:\d+)?(\/[^\s]*)?$/;
    return urlRegex.test(url);
  }, []);

  const { mutate: uploadFile, reset } = useUploadFile({
    onSuccess: onUploadSuccess,
    onError: onUploadError,
  });

  const handleFileUpload = (files: FileList) => {
    if (!files || files.length === 0) return;

    const allowedExts = ["pdf", "csv", "png", "jpg", "jpeg", "txt", "docx", "xlsx", "json"];
    const maxSizeBytes = 30 * 1024 * 1024; // 30 MB

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";

      if (!allowedExts.includes(ext)) {
        toast({
          title: "Unsupported file type",
          description: `${file.name} is not a supported file type. Supported: ${allowedExts.join(", ")}`,
          variant: "destructive",
        });
        return;
      }

      if (file.size > maxSizeBytes) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the 30 MB size limit.`,
          variant: "destructive",
        });
        return;
      }
    }

    uploadFile(
      { files: Array.from(files) },
      {
        onSuccess: (data) => {
          handleChange(data);
        },
      }
    );
  };

  const handleChange = useCallback(
    (value?: string[] | string) => {
      // Handle array format (from file upload)
      if (Array.isArray(value) && value.length !== 0) {
        onInputValueChange?.(input.id, { label: value[0], value: value[0] });
        return;
      }

      // Handle string format (from URL input)
      if (typeof value === "string" && value) {
        // Always update parent with value (even if invalid) so validation can run
        onInputValueChange?.(input.id, { label: value, value });
        return;
      }

      // Clear value
      onInputValueChange?.(input.id, {
        label: "",
        value: "",
      });
    },
    [input.id, onInputValueChange]
  );

  const debouncedHandleChange = useMemo(
    () =>
      debounce((url: string) => {
        handleChange(url);
      }, 500),
    [handleChange]
  );

  useEffect(() => {
    return () => {
      debouncedHandleChange.cancel();
    };
  }, [debouncedHandleChange]);

  const handleClear = useCallback(() => {
    reset();
    setUrlInput("");
    debouncedHandleChange.cancel();
    onInputValueChange?.(input.id, {
      label: "",
      value: "",
    });
  }, [reset, debouncedHandleChange, onInputValueChange, input.id]);

  // Sync with input value changes (for external resets)
  useEffect(() => {
    if (!input.value.value) {
      setUrlInput("");
    }
  }, [input.value.value]);

  const handleUrlChange = (url: string) => {
    setUrlInput(url);
    // Immediately notify parent for real-time validation
    onInputValueChange?.(input.id, { label: url, value: url });
    // Also debounce for node updates
    debouncedHandleChange(url);
  };

  const hasValue = urlInput.length > 0 || (input.value.value?.length ?? 0) > 0;

  const isValidValue = (val: string) => {
    if (!val) return false;

    // Check if it's a valid URL
    const isValidUrl = isMatch(val);

    // Check if it's a valid file path (must have path separator AND file extension)
    const hasPathSeparator = val.includes("/") || val.includes("\\");
    const hasFileExtension = /[^/\\]+\.[^/\\]+$/.test(val);
    const isValidFilePath = hasPathSeparator && hasFileExtension;

    return isValidUrl || isValidFilePath;
  };

  const hasError = !!(
    hasExternalError ||
    (urlInput.length > 0 && !isValidValue(urlInput)) ||
    (input.value.value && !urlInput && !isValidValue(input.value.value))
  );

  return (
    <div className={className}>
      <div className="relative">
        <div className={inputVariants({ hasValue, hasError })}>
          <InputField
            value={urlInput || input.value.value || ""}
            onChange={handleUrlChange}
            placeholder={hasValue ? "Paste URL" : "Paste URL or"}
            label=""
            helperText=""
            error={hasError ? "URL is corrupt" : ""}
            className={cn("w-full h-9 placeholder:text-[7px] placeholder:sm:text-[8px] placeholder:lg:text-[9px] placeholder:xl:text-[13px]")}
            disabled={!!input.value.value && !urlInput}
          />
        </div>
        {!hasValue && (
          <div className={cn("absolute top-2.5 lg:top-3 sm:top-3 xl:top-3 right-0 lg:right-4 xl:right-11 z-10")}>
            <ControlledFileInput
              className={cn("min-w-0 border-0 bg-transparent p-0  ")}
              onFileUpload={handleFileUpload}
              data={input.value.value ? { value: [input.value.value] } : null}
              onChange={(data) => {
                handleChange(data?.value);
                setUrlInput("");
              }}
              onClear={handleClear}
              label="Choose file"
              labelClassName={cn("text-[2px] sm:text-[5px] lg:text-[5px] xl:text-[11px]")}
            />
          </div>
        )}
        {(urlInput || input.value.value) && (
          <div className={cn("absolute top-2.5 right-3 z-10")}>
            <button
              type="button"
              onClick={handleClear}
              className={cn("text-muted-foreground hover:text-foreground transition-colors")}
              aria-label="Clear"
            >
              <XIcon size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
