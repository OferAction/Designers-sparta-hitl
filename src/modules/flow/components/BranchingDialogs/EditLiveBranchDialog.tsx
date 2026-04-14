import { useForm } from "react-hook-form";

import { BaseBranchDialog } from "./BaseBranchDialog";
import { createTypedFormField } from "./FormField";
import { OwnerField } from "./OwnerField";
import { useBranchNameValidation } from "./useBranchNameValidation";
import { useUpdateBranch } from "@/modules/flow/services";
import { File } from "@/modules/workspace";

interface EditLiveBranchFormData {
  workflowName: string;
  owner: string[];
  currentVersion: string;
  description: string;
}

interface EditLiveBranchDialogProps {
  id: string;
  onClose: () => void;
  branch: File;
}

const BranchFormField = createTypedFormField<EditLiveBranchFormData>();

const formFields: React.FC<{ branch: File }>[] = [
  ({ branch }) => {
    const validateBranchName = useBranchNameValidation(branch.id);
    return (
      <BranchFormField
        name="workflowName"
        label="Workflow Name"
        placeholder="Enter workflow name"
        required
        defaultValue={branch?.name}
        validate={validateBranchName}
      />
    );
  },
  () => <OwnerField />,
  ({ branch }) => {
    const currentVersion = `V${branch.version?.major}.${branch.version?.minor}`;
    return <BranchFormField name="currentVersion" label="Current Version" disabled defaultValue={currentVersion} />;
  },
  ({ branch }) => {
    return <BranchFormField name="description" label="Description" placeholder="Enter description" defaultValue={branch.description} />;
  },
];

export function EditLiveBranchDialog({ onClose, branch }: EditLiveBranchDialogProps) {
  const formMethods = useForm<EditLiveBranchFormData>({
    defaultValues: {
      workflowName: branch.name,
      owner: [],
      currentVersion: `V${branch.version?.major}.${branch.version?.minor}`,
      description: branch.description,
    },
  });
  const { mutate } = useUpdateBranch(branch.id);

  const onSubmit = (data: EditLiveBranchFormData) => {
    mutate({
      ...branch,
      name: data.workflowName,
      description: data.description,
    });
    onClose();
  };

  return (
    <BaseBranchDialog
      onClose={onClose}
      title="Live Workflow Info"
      description={
        <>
          View and update details for this <span className="font-bold">live workflow</span>.
          <br />
          Changes to the name or description will be reflected for the current production version.
        </>
      }
      formMethods={formMethods}
      onSubmit={onSubmit}
      submitButtonText="Save Changes"
      formFields={formFields}
      fieldProps={{ branch }}
    />
  );
}
