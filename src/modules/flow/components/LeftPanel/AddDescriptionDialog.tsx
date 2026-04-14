import { useCallback, useRef, useState } from "react";

import { useParams } from "react-router-dom";

import { useParentFileId } from "@/hooks/useFileCache";

import { Terminal, TerminalHeader, TerminalControls, TerminalContent, CopyButton, ActOneButton } from "@/components/common/CodeTerminal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useGetFileQuery, useUpdateFileInsideCanvas } from "@/services/fileService/fileService";

interface AddDescriptionDialogProps {
  id: string;
  onClose: () => void;
}

/**
 * Dialog component for adding or editing workflow descriptions
 */
export function AddDescriptionDialog({ onClose }: AddDescriptionDialogProps) {
  const { fileId: paramsFileId = "" } = useParams();
  const [fileId] = useParentFileId(paramsFileId);

  const { data: file } = useGetFileQuery(fileId);
  const { mutate: updateFile, isPending } = useUpdateFileInsideCanvas(fileId);

  const [description, setDescription] = useState(file?.description ?? "");
  const [open, setOpen] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSave = useCallback(() => {
    if (!file) return;

    updateFile(
      {
        ...file,
        description,
      },
      {
        onSuccess: () => {
          setOpen(false);
          onClose();
        },
      }
    );
  }, [description, file, updateFile, onClose]);

  /** Updates local state only; persisted on Done */
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  }, []);

  /** Closes without saving */
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        setOpen(false);
        onClose();
      }
    },
    [onClose]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        overlayProps={{ className: "bg-transparent" }}
        className="min-w-[44vw] p-0 gap-0 overflow-hidden flex flex-col bg-sidebar"
        onInteractOutside={(e) => e.preventDefault()}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          textareaRef.current?.focus();
        }}
      >
        <DialogHeader className="p-4 space-y-1.5 text-left flex-shrink-0">
          <DialogTitle className="text-lg font-semibold text-foreground ml-2">Add a Workflow description</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2 px-4 pb-3">
          <Terminal variant="input" className="h-full flex flex-1 border-none bg-sidebar">
            <TerminalHeader className="px-0 flex items-end border-none">
              <TerminalControls className="ml-auto">
                <ActOneButton onResult={(generated) => setDescription(generated)} />
                <CopyButton value={description} />
              </TerminalControls>
            </TerminalHeader>
            <TerminalContent>
              <Textarea
                ref={textareaRef}
                value={description}
                onChange={handleChange}
                placeholder="Describe this orchestration's use case in your own words. This will be used as a baseline for GenSense AI calculations..."
                className="my-2 border-input border bg-background resize-none"
                rows={8}
              />
            </TerminalContent>
          </Terminal>

          <div className="flex justify-end gap-2">
            <Button onClick={handleOpenChange.bind(null, false)} disabled={isPending} variant="ghost">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isPending} loading={isPending} variant="secondary">
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
