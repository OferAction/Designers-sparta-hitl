import { ToastActionProps } from "@radix-ui/react-toast";

import { buttonVariants } from "@/components/ui/button";
import { ToastAction } from "@/components/ui/toast";
import { AddDatasetDialog } from "@/modules/flow/components";
import { useDialogStore } from "@/store";

export const ToastActionDatasetFailed = ({
  onRetry,
  onUploadNew,
  ...props
}: { onRetry: () => void; onUploadNew: () => void } & Omit<ToastActionProps, "altText">) => {
  return (
    <div className="flex gap-3 self-end mt-3">
      <ToastAction
        altText="Connect now"
        {...props}
        onClick={() => {
          useDialogStore.getState().openDialog(({ id, onClose }) => <AddDatasetDialog id={id} onClose={onClose} onSubmit={onClose} />);
          onUploadNew();
        }}
        className={buttonVariants({
          variant: "destructive",
          className: "border-none",
        })}
      >
        Upload new
      </ToastAction>
      <ToastAction
        altText="Retry"
        {...props}
        className={buttonVariants({
          className: "border-none",
        })}
        onClick={onRetry}
      >
        Retry
      </ToastAction>
    </div>
  );
};
