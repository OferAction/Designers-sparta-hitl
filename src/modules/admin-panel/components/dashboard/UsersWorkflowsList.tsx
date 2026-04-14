import { useState, useMemo, useCallback } from "react";

import { useToast } from "@/hooks/use-toast";

import { WorkflowPerProject } from "@/types/user";

import { Loader } from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useUpdatePermissionsBatch } from "@/services/securityService";

function filterByQuery<T>(items: T[], query: string, fields: (keyof T)[]): T[] {
  if (!query.trim()) return items;
  const q = query.toLowerCase();
  return items.filter((item) =>
    fields.some((field) =>
      String(item[field] ?? "")
        .toLowerCase()
        .includes(q)
    )
  );
}

export const UsersWorkflowsList = ({
  items,
  userId,
  isLoading,
  onOpenChange,
}: {
  items: WorkflowPerProject[];
  userId: string;
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [toggledIds, setToggledIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => filterByQuery(items, searchQuery, ["entityName"]), [items, searchQuery]);

  const isChecked = useCallback((workflow: WorkflowPerProject) => toggledIds.has(workflow.id) !== workflow.isActive, [toggledIds]);

  const allSelected = filtered.length > 0 && filtered.every(isChecked);
  const someSelected = filtered.some(isChecked);

  const toggleItem = useCallback((workflow: WorkflowPerProject) => {
    setToggledIds((prev) => {
      const next = new Set(prev);
      if (next.has(workflow.id)) next.delete(workflow.id);
      else next.add(workflow.id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setToggledIds((prev) => {
      const next = new Set(prev);
      const allChecked = filtered.every((workflow) => prev.has(workflow.id) !== workflow.isActive);
      filtered.forEach((workflow) => {
        if (allChecked) {
          if (workflow.isActive) next.add(workflow.id);
          else next.delete(workflow.id);
        } else {
          if (!workflow.isActive) next.add(workflow.id);
          else next.delete(workflow.id);
        }
      });
      return next;
    });
  }, [filtered]);
  const { mutate } = useUpdatePermissionsBatch(userId);
  const { toast } = useToast();

  const revokeAllAccess = useCallback(() => {
    mutate(
      items.map((p) => ({ id: p.id, isDeleted: true })),
      {
        onSuccess: () => {
          toast({
            description: "All workflow access has been revoked for this user.",
            variant: "default",
          });
        },
      }
    );
  }, [items, mutate, toast]);
  /** Sends only the toggled workflows with their flipped active state */
  const changeAccess = useCallback(() => {
    const updates = items
      .filter((p) => toggledIds.has(p.id))
      .map((p) => ({
        id: p.id,
        isDeleted: p.isActive,
      }));

    if (updates.length === 0) {
      onOpenChange(false);
      return;
    }

    mutate(updates, {
      onSuccess: () => {
        toast({
          description: "User workflow permissions have been updated.",
          variant: "default",
        });
      },
    });
  }, [items, toggledIds, mutate, toast, onOpenChange]);

  if (isLoading)
    return (
      <div className="h-full flex items-center justify-center py-8">
        <Loader />
      </div>
    );

  return (
    <div className="size-full flex flex-col gap-2">
      <Input
        placeholder="Search workflows..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="bg-background border-input"
      />

      {!filtered.length ? (
        <span className="flex items-center justify-center size-full text-sm text-muted-foreground text-center py-8">No workflows found.</span>
      ) : (
        <div className="h-full flex flex-col py-1">
          <div className="flex items-center justify-between py-3 px-4 border-b">
            <span className="text-sm text-muted-foreground">Workflow access</span>
            <Checkbox checked={allSelected ? true : someSelected ? "indeterminate" : false} onCheckedChange={toggleAll} />
          </div>
          {filtered.map((workflow) => (
            <div key={workflow.id} className="flex items-center justify-between py-3 px-4 border-b">
              <span className="text-sm text-foreground">{workflow.entityName}</span>
              <Checkbox checked={isChecked(workflow)} onCheckedChange={() => toggleItem(workflow)} />
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center">
        <Button
          variant="destructive"
          className="justify-start text-xs font-inter font-normal bg-destructive/10 text-destructive hover:bg-destructive/20"
          onClick={revokeAllAccess}
        >
          Revoke all access
        </Button>
        <div className="flex items-center justify-end gap-4">
          <Button variant="secondary" className="text-primary text-xs font-inter font-normal" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="default" className="text-primary-foreground text-xs font-inter font-normal" onClick={changeAccess}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UsersWorkflowsList;
