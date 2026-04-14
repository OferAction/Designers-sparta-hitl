import React from "react";

import { DownloadIcon, XIcon, FileIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

interface FilePreviewProps {
  files: File[];
  onRemoveFile?: (index: number) => void;
  className?: string;
  /** When "message", shows download + size instead of remove button (same style as input) */
  variant?: "input" | "message";
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const FilePreview: React.FC<FilePreviewProps> = ({ files, onRemoveFile, className, variant = "input" }) => {
  if (files.length === 0) return null;

  const isMessage = variant === "message";

  const handleDownload = (file: File) => {
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const truncateFileName = (name: string, maxLength: number = 20) => {
    if (name.length <= maxLength) return name;
    const extension = name.split(".").pop();
    const nameWithoutExt = name.substring(0, name.lastIndexOf("."));
    const truncatedName = nameWithoutExt.substring(0, maxLength - extension!.length - 4);
    return `${truncatedName}...${extension}`;
  };

  return (
    <div className={cn("space-y-2", className)}>

      <div className="flex flex-wrap gap-2 overflow-y-auto ">
        {files.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className="flex items-center gap-1 text-xs px-1 rounded-sm border border-border transition-colors duration-200 w-fit"
          >

            <FileIcon className="h-4 w-4 p-0.5 flex-shrink-0" />
            <span className="text-xs font-medium max-w-32 truncate text-foreground" title={file.name}>
              {truncateFileName(file.name)}
            </span>
            {isMessage ? (
              <>
                <span className="text-xs text-muted-foreground flex-shrink-0">{formatFileSize(file.size)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDownload(file)}
                  className="p-1  hover:text-foreground hover:bg-muted/50"
                  title="Download file"
                >
                  <DownloadIcon className="!h-4 !w-3" />
                </Button>
              </>
            ) : (
              onRemoveFile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveFile(index)}
                  className="p-1 text-foreground hover:text-foreground hover:bg-muted/50"
                >
                  <XIcon className="!h-4 !w-3" />
                </Button>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilePreview;
