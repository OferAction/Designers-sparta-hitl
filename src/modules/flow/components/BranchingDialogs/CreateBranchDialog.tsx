import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

import { useGetParentFileId, useParentFileId } from "@/hooks/useFileCache";

import { BaseBranchDialog } from "./BaseBranchDialog";
import { BranchTypeField } from "./BranchTypeField";
import { createTypedFormField } from "./FormField";
import { OwnerField } from "./OwnerField";
import { useBranchNameValidation } from "./useBranchNameValidation";
import { useCreateBranch } from "@/modules/flow/services";
import { useGetFileQuery } from "@/services";
import { useFlowStore } from "@/store";

import type { BranchFormData } from "./types";

const BranchFormField = createTypedFormField<BranchFormData>();

interface CreateBranchDialogProps {
  id: string;
  onClose: () => void;
}

const formFields = [
  () => <OwnerField />,
  () => {
    const { fileId = "" } = useParams();
    const [parentBranchId] = useParentFileId(fileId);
    const { data: file } = useGetFileQuery(parentBranchId);
    const validateBranchName = useBranchNameValidation();

    return (
      <BranchFormField
        name="branchName"
        label="Branch Name"
        placeholder="Enter branch name"
        required
        defaultValue={file?.name}
        validate={validateBranchName}
      />
    );
  },
  () => <BranchTypeField />,
  () => {
    const description = useFlowStore((state) => state.configDescription);
    return <BranchFormField name="description" label="Description" placeholder="Enter description" defaultValue={description} />;
  },
];

export function CreateBranchDialog({ onClose }: CreateBranchDialogProps) {
  const formMethods = useForm<BranchFormData>();
  const { fileId = "" } = useParams();
  const { mutateAsync } = useCreateBranch();
  const getParentFileId = useGetParentFileId();
  const navigate = useNavigate();

  const onSubmit = async (data: BranchFormData) => {
    onClose();

    const parentFileId = await getParentFileId(fileId);
    const newBranch = await mutateAsync({
      name: data.branchName,
      description: data.description,
      type: data.branchType,
      parentFileId: parentFileId,
    });
    navigate(`/canvas/${newBranch.projectId!}/${newBranch.id}`);
  };

  return (
    <BaseBranchDialog
      onClose={onClose}
      title="Create a new branch"
      description={
        <>
          You're about to make this <span className="font-bold">workflow live</span>.
          <br />
          Once published, this version will be executed in production environments.
        </>
      }
      formMethods={formMethods}
      onSubmit={onSubmit}
      submitButtonText="Create Branch"
      formFields={formFields}
    />
  );
}
