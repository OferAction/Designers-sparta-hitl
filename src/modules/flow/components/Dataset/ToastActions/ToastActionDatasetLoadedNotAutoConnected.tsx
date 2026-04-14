import { ToastActionProps } from "@radix-ui/react-toast";

import { buttonVariants } from "@/components/ui/button";
import { ToastAction } from "@/components/ui/toast";
import { useFlowStore } from "@/store";

export const ToastActionDatasetLoadedNotAutoConnected = ({ datasetId, ...props }: { datasetId: string } & Omit<ToastActionProps, "altText">) => {
  return (
    <div className="flex gap-3 flex-1 justify-end w-full mt-3">
      <ToastAction
        altText="Connect now"
        {...props}
        className={buttonVariants({
          variant: "ghost",
        })}
      >
        Go to dataset
      </ToastAction>
      <ToastAction
        altText="Connect now"
        {...props}
        onClick={() => {
          useFlowStore.getState().connectDataset(datasetId);
        }}
        className={buttonVariants({
          className: "border-none",
        })}
      >
        Connect now
      </ToastAction>
    </div>
  );
};
