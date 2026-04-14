import React, { useCallback } from "react";

import { UploadSimple } from "@phosphor-icons/react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const iconVariants = cva("h-4 w-4 cursor-pointer text-primary hover:text-muted-foreground");

interface UploadButtonProps {
  className?: string;
  onClick?: () => void;
  value?: string | object;
}

export const UploadButton: React.FC<UploadButtonProps> = ({ className, value }) => {
  const handleUpload = useCallback(() => {
    if (!value) return;

    const content = typeof value === "string" ? value : JSON.stringify(value, null, 2);
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "code.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [value]);

  return <UploadSimple className={cn(iconVariants(), className)} onClick={handleUpload} />;
};
