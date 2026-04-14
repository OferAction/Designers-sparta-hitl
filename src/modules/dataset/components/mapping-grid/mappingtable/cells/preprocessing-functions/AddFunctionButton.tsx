import { PlusIcon } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

interface AddFunctionButtonProps {
  onClick: () => void;
}

/**
 * Plus button to trigger adding a new preprocessing function
 */
export const AddFunctionButton = ({ onClick }: AddFunctionButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-6 w-6 p-0 cursor-pointer flex-shrink-0",
        "opacity-0 group-hover/row:opacity-100"
      )}
      type="button"
    >
      <PlusIcon className="size-3" />
    </button>
  );
};
