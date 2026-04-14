import { useRef } from "react";

import { UploadSimpleIcon } from "@phosphor-icons/react";

import { usePopulateFromFileUpload, usePopulateFormFromData } from "./hooks";
import { SourceFileProps } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const SourceFile = ({ inputs, scope }: SourceFileProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { populateFormFromData } = usePopulateFormFromData(inputs, scope);
  const { handleFileChange } = usePopulateFromFileUpload({
    onDataParsed: populateFormFromData,
  });

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-sidebar-foreground/70 pt-2">import structured files</span>
      <div className="flex flex-col gap-2">
        <Input className="w-full bg-background h-[unset] py-2.5 px-3" variant="tag" type="text" placeholder="from Url (JSON or XML)" />
        <span className="text-xs text-sidebar-foreground/70">or</span>
        <Button variant="secondary" className="w-fit" type="button" onClick={handleFileSelect}>
          <UploadSimpleIcon className="h-4 w-4" />
          upload from device
        </Button>
      </div>
      <span className="text-xs text-sidebar-foreground/70 pt-3">
        Every file uploaded directly from device will not be saved for future use. you can either import it via url from a FTP or uploading it again.
      </span>
      <input ref={fileInputRef} type="file" accept=".json,.xml" onChange={handleFileChange} style={{ display: "none" }} />
    </div>
  );
};
