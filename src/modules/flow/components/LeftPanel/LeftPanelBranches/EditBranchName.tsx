import { useRef } from "react";

import { useForm } from "react-hook-form";

import useClickOutside from "@/hooks/useClickOutside";

import { useBranchNameValidation } from "@/modules/flow/components/BranchingDialogs/useBranchNameValidation";

import { useUpdateBranch } from "@/modules/flow/services";
import { File } from "@/modules/workspace";
import { cn } from "@/utils";

interface EditBranchNameProps {
  branch: File;
  onCancel: () => void;
}

export function EditBranchName({ branch, onCancel }: EditBranchNameProps) {
  const containerRef = useRef<HTMLFormElement>(null);
  const validateBranchName = useBranchNameValidation(branch.id);
  const { mutate } = useUpdateBranch(branch.id);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ branchName: string }>({
    defaultValues: {
      branchName: branch.name,
    },
    mode: "onChange",
  });

  const onSubmit = (data: { branchName: string }) => {
    const trimmedValue = data.branchName.trim();
    if (trimmedValue && trimmedValue !== branch.name) {
      mutate({
        ...branch,
        name: trimmedValue,
      });
    }
    onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(onSubmit)();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  useClickOutside(containerRef, () => {
    handleSubmit(onSubmit, onCancel)();
  });

  const { ref, ...rest } = register("branchName", {
    required: "Branch name is required",
    validate: validateBranchName,
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onCancel)}
      ref={containerRef}
      className="flex-1 min-w-0"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <input
        {...rest}
        ref={(e) => {
          ref(e);
          e?.focus();
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full bg-transparent border-none outline-none p-0 m-0 text-inherit font-inherit",
          errors.branchName && "ring-1 ring-offset-4 ring-offset-sidebar-accent ring-destructive rounded"
        )}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      />
    </form>
  );
}
