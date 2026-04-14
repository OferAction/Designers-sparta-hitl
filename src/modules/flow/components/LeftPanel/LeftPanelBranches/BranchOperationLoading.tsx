import { useLayoutEffect, useRef } from "react";

import * as Portal from "@radix-ui/react-portal";
import { useMutationState, useQueryClient, type QueryClient } from "@tanstack/react-query";

import { useToast } from "@/hooks/use-toast";

import { cn } from "@/lib/utils";

interface BranchOperationLoadingProps {
  mutationKeyFn: (queryClient: QueryClient) => { mutationKey?: readonly unknown[] };
  toastTitle: string;
  toastDescription?: React.ReactNode;
  containerId?: string;
}

export const BranchOperationLoading: React.FC<BranchOperationLoadingProps> = ({ mutationKeyFn, toastTitle, toastDescription, containerId }) => {
  const { toast } = useToast();
  const dismissRef = useRef<ReturnType<typeof toast>["dismiss"]>();
  const queryClient = useQueryClient();

  const mutationPending = useMutationState({
    filters: {
      mutationKey: mutationKeyFn(queryClient).mutationKey,
      status: "pending",
    },
  });

  useLayoutEffect(() => {
    if (mutationPending.length > 0 && !dismissRef.current) {
      const { dismiss } = toast({
        title: toastTitle,
        ...(toastDescription && { description: toastDescription }),
        position: "center",
        duration: Infinity,
      });
      dismissRef.current = dismiss;
    }
    if (mutationPending.length === 0) {
      dismissRef.current?.();
      dismissRef.current = undefined;
    }
  }, [mutationPending.length, toast, toastTitle, toastDescription]);

  const container = containerId ? document.getElementById(containerId) : undefined;
  const shouldRender = mutationPending.length > 0 && (containerId ? container : true);

  if (!shouldRender) {
    return null;
  }

  return (
    <Portal.Root {...(container && { container })}>
      <div className={cn("flex-grow z-50 absolute flex items-center justify-center bg-muted/40", container ? "size-full" : "inset-0")} />
    </Portal.Root>
  );
};
