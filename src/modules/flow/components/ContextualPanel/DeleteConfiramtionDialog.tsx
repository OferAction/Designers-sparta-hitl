import { ConfirmationDialog } from "./ConfirmationDialog";

export default function DeleteConfiramtionDialog({
    isOpen,
    onClose,
    onConfirm,
    loading,
    description,
    title,
    label = "Delete",
}:
{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading?: boolean;
    description: string;
    title: string;
    label?: string;
}) {
  return (
    <ConfirmationDialog
      isOpen={isOpen}
      description={description}
      onClose={onClose}
      onConfirm={onConfirm}
      title={title}
      confirmLabel={label}
      confirmVariant="destructive"
      loading={loading}
    />
  );
}
