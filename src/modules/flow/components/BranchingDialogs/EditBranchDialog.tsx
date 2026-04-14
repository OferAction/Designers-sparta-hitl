import { useForm } from "react-hook-form";

import { BaseBranchDialog } from "./BaseBranchDialog";
import { BranchTypeField } from "./BranchTypeField";
import { createTypedFormField } from "./FormField";
import { OwnerField } from "./OwnerField";
import { useBranchNameValidation } from "./useBranchNameValidation";
import { useUpdateBranch } from "@/modules/flow/services";
import { File } from "@/modules/workspace";

import type { BranchFormData } from "./types";

interface EditBranchDialogProps {
  id: string;
  onClose: () => void;
  branch: File;
}

const BranchFormField = createTypedFormField<BranchFormData>();

const formFields: React.FC<{ branch: File }>[] = [
  () => <OwnerField />,
  ({ branch }) => {
    const validateBranchName = useBranchNameValidation(branch.id);
    return <BranchFormField name="branchName" label="Branch Name" placeholder="Enter branch name" required validate={validateBranchName} />;
  },
  () => <BranchTypeField />,
  () => <BranchFormField name="description" label="Description" placeholder="Enter description" />,
];

export function EditBranchDialog({ onClose, branch }: EditBranchDialogProps) {
  const formMethods = useForm<BranchFormData>({
    defaultValues: {
      branchName: branch.name,
      description: branch.description,
      branchType: branch.type,
    },
  });
  const { mutate } = useUpdateBranch(branch.id);

  const onSubmit = (data: BranchFormData) => {
    mutate({
      ...branch,
      name: data.branchName,
      description: data.description,
      type: data.branchType,
    });
    onClose();
  };

  return (
    <BaseBranchDialog
      onClose={onClose}
      title="Branch Information"
      formMethods={formMethods}
      onSubmit={onSubmit}
      submitButtonText="Save Changes"
      formFields={formFields}
      fieldProps={{ branch }}
    />
  );
}
