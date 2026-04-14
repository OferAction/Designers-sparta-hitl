import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

import { useToast } from "@/hooks/use-toast";

import { BaseBranchDialog } from "./BaseBranchDialog";
import { FormField } from "./FormField";
import { OwnerField } from "./OwnerField";
import { ReplaceLiveVersionAlert } from "./ReplaceLiveVersionAlert";
import { SourceBranchField } from "./SourceBranchField";
import { VersionFields } from "./VersionFields";
import { usePublishBranch } from "@/modules/flow/services";
import { File } from "@/modules/workspace";
import { getFile } from "@/services";
import { useDialogStoreActions, useFlowStore } from "@/store";

interface PushBranchFormData {
  owner: string[];
  currentVersion: string;
  willBeVersion: string;
  description: string;
  sourceBranch: {
    label: string;
    value: string;
  };
}

interface PushBranchDialogProps {
  id: string;
  onClose: () => void;
  defaultValues?: Partial<PushBranchFormData>;
  branch: File;
}

const formFields: React.FC<{ branch: File }>[] = [
  ({ branch }) => <SourceBranchField id={branch.parentFileId || branch.id} />,
  () => <OwnerField />,
  ({ branch }) => {
    return <VersionFields fileId={branch.parentFileId || branch.id} />;
  },
  () => {
    const description = useFlowStore((state) => state.configDescription);
    return <FormField name="description" label="Description" placeholder="Enter description" defaultValue={description} />;
  },
];

export function PushBranchDialog({ onClose, defaultValues, branch }: PushBranchDialogProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const formMethods = useForm<PushBranchFormData>({
    defaultValues,
  });
  const { folderId = "" } = useParams();
  const { mutateAsync } = usePublishBranch();
  const { openDialog } = useDialogStoreActions();
  const { toast } = useToast();

  const onSubmit = async (data: PushBranchFormData) => {
    openDialog(({ id, onClose: closeAlert }) => (
      <ReplaceLiveVersionAlert
        id={id}
        onClose={closeAlert}
        onConfirm={async () => {
          try {
            await mutateAsync({
              description: data.description,
              projectId: folderId,
              name: data.sourceBranch.label,
              $fileId: data.sourceBranch.value,
            });
            const parentFile = await queryClient.ensureQueryData(getFile(branch.parentFileId || branch.id));
            navigate(`/canvas/${parentFile.projectId}/${parentFile.id}`);
            toast({
              title: "Published successfully",
              description: (
                <span className="font-bold text-foreground">
                  <span className="text-muted-foreground">{parentFile.name}</span> has been replaced with{" "}
                  <span className="text-muted-foreground">{data.sourceBranch.label}</span>.
                </span>
              ),
              position: "center",
            });
            onClose();
          } catch {
            toast({
              title: "Publishing Failed",
              description: (
                <span className="font-bold text-foreground">
                  <span className="text-muted-foreground">{data.sourceBranch.label}</span> has not been published.
                </span>
              ),
              position: "center",
            });
          }
        }}
      />
    ));
  };

  return (
    <BaseBranchDialog
      onClose={onClose}
      title="Replace Live Version"
      description="This version will be executed in production environment."
      formMethods={formMethods}
      onSubmit={onSubmit}
      submitButtonText="Replace"
      fieldProps={{ branch }}
      formFields={formFields}
    />
  );
}
