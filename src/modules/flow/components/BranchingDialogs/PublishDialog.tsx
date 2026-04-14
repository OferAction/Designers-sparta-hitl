import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

import { BaseBranchDialog } from "./BaseBranchDialog";
import { FormField } from "./FormField";
import { OwnerField } from "./OwnerField";
import { VersionFields } from "./VersionFields";
import { usePublishBranch } from "@/modules/flow/services";
import { useGetFileQuery } from "@/services";
import { useFlowStore } from "@/store";

interface PublishFormData {
  workflowName: string;
  owner: string[];
  currentVersion: string;
  willBeVersion: string;
  description: string;
}

interface PublishDialogProps {
  id: string;
  onClose: () => void;
}

const formFields = [
  () => {
    const { fileId = "" } = useParams();
    const { data } = useGetFileQuery(fileId);
    return <FormField name="workflowName" label="Workflow Name" placeholder="Enter workflow name" required defaultValue={data?.name} />;
  },
  () => <OwnerField />,
  () => {
    const { fileId = "" } = useParams();
    return <VersionFields fileId={fileId} />;
  },
  () => {
    const description = useFlowStore((state) => state.configDescription);
    return <FormField name="description" label="Description" placeholder="Enter description" defaultValue={description} />;
  },
];

export function PublishDialog({ onClose }: PublishDialogProps) {
  const formMethods = useForm<PublishFormData>();
  const navigate = useNavigate();
  const { fileId = "", folderId = "" } = useParams();
  const { mutateAsync } = usePublishBranch(fileId);

  const onSubmit = async (data: PublishFormData) => {
    onClose();
    const { id } = await mutateAsync({
      name: data.workflowName,
      description: data.description,
    });
    navigate(`/canvas/${folderId}/${fileId}/${id}`);
  };

  return (
    <BaseBranchDialog
      onClose={onClose}
      title="Publish to Production"
      description={
        <>
          You're about to make this <span className="font-bold">workflow live</span>.
          <br />
          Once published, this version will be executed in production environments.
        </>
      }
      formMethods={formMethods}
      onSubmit={onSubmit}
      submitButtonText="Publish"
      formFields={formFields}
    />
  );
}
