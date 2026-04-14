import { useRef } from "react";

import { XCircleIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

type Data = { value: string[] } & Record<string, any>;

interface ControlledFileInputProps extends Omit<React.HTMLAttributes<HTMLInputElement>, "onChange"> {
  id?: string;
  multiple?: boolean;
  className?: string;
  placeholder?: string;
  data?: Data | null;
  onChange: (value: Data | null) => void;
  onFileUpload: (files: FileList) => void;
  onClear?: () => void;
  disabled?: boolean;
  directory?: string;
  webkitdirectory?: string;
  label?: string;
  labelClassName?: string;
}

export const ControlledFileInput = ({
  className,
  data,
  onChange,
  onFileUpload,
  onClear,
  disabled = false,
  id,
  label = "Choose File",
  labelClassName = "",
  ...props
}: ControlledFileInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files || files.length === 0) {
      onChange(null);
      return;
    }

    onFileUpload(files);
  };

  const handleClearFiles = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClear?.();
  };

  const displayText = () => {
    if (data?.value && data.value.length > 0) {
      if (data.value.length === 1) {
        return data.value[0];
      }
      return `${data.value.length} files selected`;
    }
    return "";
  };

  const hasFiles = data?.value && data.value.length > 0;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleButtonClick}
        className={cn(
          "relative border rounded-md bg-background px-1.5 py-0.5 w-full min-w-0 has-[:hover]:border-input border-muted focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        title="Choose File"
        type="button"
      >
        <input id={id} ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" disabled={disabled} {...props} />

        <div className="flex items-center rounded-md gap-3">
          <div className={cn("text-sm w-max font-medium  text-foreground] ", labelClassName, hasFiles && "hidden")}>{label}</div>

          <div className="flex-1 text-sm flex items-center justify-between truncate">
            <span className={cn("truncate", hasFiles ? "text-foreground" : "text-muted-foreground")}>{displayText()}</span>
          </div>
        </div>
      </button>
      {hasFiles && (
        <Button
          type="button"
          onClick={handleClearFiles}
          variant="ghost"
          className="text-muted-foreground cursor-pointer hover:text-foreground text-xs p-0 shrink-0"
          title="Clear files"
          asChild
        >
          <XCircleIcon className="size-4" />
        </Button>
      )}
    </div>
  );
};
