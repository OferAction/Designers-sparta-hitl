import { useQueryClient } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";

import { type PermissionsFormValues } from "./utils";
import { Button } from "@/components/ui/button";
import { getRoleById, useUpdateRole } from "@/services/securityService";
import { cn } from "@/utils";

interface PermissionsFooterProps {
  className?: string;
}

export default function PermissionsFooter({ className }: PermissionsFooterProps) {
  const queryClient = useQueryClient();
  const { formState, reset, handleSubmit } = useFormContext<PermissionsFormValues>();

  const { mutateAsync: updateRole, isPending: isPublishing } = useUpdateRole();

  const hasChanges = formState.isDirty;

  const onSubmit = handleSubmit((values: PermissionsFormValues) => {
    const promises: Promise<unknown>[] = [];
    Object.keys(values).forEach((roleId) => {
      const role = queryClient.getQueryData(getRoleById(roleId).queryKey);
      if (role) {
        const permissionIds = Object.entries(values[roleId] ?? {})
          .filter(([, v]) => v)
          .map(([k]) => k);

        promises.push(
          updateRole({
            id: roleId,
            name: role.name,
            description: role.description ?? "",
            permissionIds,
          })
        );
      }
    });

    Promise.all(promises).then(() => {
      reset();
    });
  });

  const handleReset = () => {
    reset();
  };

  return (
    <footer
      className={cn(
        "absolute bottom-0 flex shrink-0 items-center justify-end gap-3 border-t border-sidebar-border bg-card px-6 h-[72px] ",
        className
      )}
    >
      <Button
        variant="outline"
        className="border-sidebar-border bg-background/80 text-foreground"
        onClick={handleReset}
        type="button"
        disabled={!hasChanges || isPublishing}
      >
        Reset
      </Button>
      <Button variant="purple" onClick={onSubmit} disabled={!hasChanges || isPublishing}>
        {isPublishing ? "Publishing…" : "Publish changes"}
      </Button>
    </footer>
  );
}
