import type { PropsWithChildren } from "react";

import { ArrowSquareInIcon, PlusIcon, SpinnerGapIcon } from "@phosphor-icons/react";
import { useParams } from "react-router-dom";

import { useParentFileId } from "@/hooks/useFileCache";

import { BranchItem } from "./BranchItem";
import { BranchOperationLoading } from "./BranchOperationLoading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarMenu } from "@/components/ui/sidebar";
import { CreateBranchDialog, BranchesOverviewDialog } from "@/modules/flow/components/BranchingDialogs";
import { useGetBranches, createBranch, publishBranch, unpublishBranch, branchPullLatestChanges } from "@/modules/flow/services";
import { useGetFileQuery } from "@/services";
import { useDialogStoreActions } from "@/store";

const Loaders: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <BranchOperationLoading containerId="react-flow-canvas" mutationKeyFn={createBranch} toastTitle="Creating branch..." />
      <BranchOperationLoading mutationKeyFn={(qc) => publishBranch("", qc)} toastTitle="Publishing branch..." />
      <BranchOperationLoading
        containerId="react-flow-canvas"
        mutationKeyFn={(qc) => unpublishBranch("", qc)}
        toastTitle="Unpublishing"
        toastDescription={
          <>
            We're taking your live version offline.
            <br /> This may take a few moments.
          </>
        }
      />
      <BranchOperationLoading
        containerId="react-flow-canvas"
        mutationKeyFn={(qc) => branchPullLatestChanges(qc, "")}
        toastTitle="Pulling latest changes..."
      />
      {children}
    </>
  );
};

export const LeftPanelBranches = () => {
  const { fileId = "" } = useParams();
  const { openDialog } = useDialogStoreActions();

  const [branchParentFileId] = useParentFileId(fileId);
  const { data: branches, isFetching } = useGetBranches(branchParentFileId);
  const { data: file } = useGetFileQuery(branchParentFileId);

  if (!file || file.status !== "Live") {
    return <Loaders />;
  }

  if (!branches || branches?.length === 0) {
    return <Loaders />;
  }

  return (
    <Loaders>
      <Separator />
      <SidebarMenu>
        <div className="flex items-center justify-between py-2.5 px-3">
          <span className="text-sm text-muted-foreground select-none">Live</span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="p-0"
              onClick={() => openDialog(({ id, onClose }) => <BranchesOverviewDialog id={id} onClose={onClose} />)}
            >
              <ArrowSquareInIcon className="text-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="p-0"
              onClick={() => openDialog(({ id, onClose }) => <CreateBranchDialog id={id} onClose={onClose} />)}
            >
              <PlusIcon className="text-foreground" />
            </Button>
          </div>
        </div>
        {branches?.map((branch) => <BranchItem key={branch.id} branch={branch} />)}
        {isFetching && (
          <div className="w-full flex items-center justify-center py-2.5">
            <SpinnerGapIcon className="animate-spin mr-2 inline-block" />
          </div>
        )}
      </SidebarMenu>
      <Separator />
    </Loaders>
  );
};
