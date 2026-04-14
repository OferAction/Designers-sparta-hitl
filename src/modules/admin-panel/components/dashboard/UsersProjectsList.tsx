import { useState, useMemo, useCallback } from "react";

import { useToast } from "@/hooks/use-toast";

import { UserPerProject } from "@/types/user";

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

export const UsersProjectsList = ({
  items,
  userId,
  isLoading,
  onOpenChange,
}: {
  items: UserPerProject[];
  userId: string;
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [toggledIds, setToggledIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => filterByQuery(items, searchQuery, ["entityName"]), [items, searchQuery]);

  const isChecked = useCallback((project: UserPerProject) => toggledIds.has(project.id) !== project.isActive, [toggledIds]);

  const allSelected = filtered.length > 0 && filtered.every(isChecked);
  const someSelected = filtered.some(isChecked);

  const toggleItem = useCallback((project: UserPerProject) => {
    setToggledIds((prev) => {
      const next = new Set(prev);
      if (next.has(project.id)) next.delete(project.id);
      else next.add(project.id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setToggledIds((prev) => {
      const next = new Set(prev);
      const allChecked = filtered.every((p) => prev.has(p.id) !== p.isActive);
      filtered.forEach((p) => {
        if (allChecked) {
          if (p.isActive) next.add(p.id);
          else next.delete(p.id);
        } else {
          if (!p.isActive) next.add(p.id);
          else next.delete(p.id);
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
            description: "All project and workflow access has been revoked for this user.",
            variant: "default",
          });
        },
      }
    );
  }, [items, mutate, toast]);
  
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
          description: "User permissions have been updated.",
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
        placeholder="Search projects..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="bg-background border-input"
      />

      {!filtered.length ? (
        <span className="flex items-center justify-center size-full text-sm text-muted-foreground text-center py-8">No projects found.</span>
      ) : (
        <div className="h-full flex flex-col py-1">
          <div className="flex items-center justify-between py-3 px-4 border-b">
            <span className="text-sm text-muted-foreground">Project access</span>
            <Checkbox checked={allSelected ? true : someSelected ? "indeterminate" : false} onCheckedChange={toggleAll} />
          </div>
          {filtered.map((project) => (
            <div key={project.id} className="flex items-center justify-between py-3 px-4 border-b">
              <span className="text-sm text-foreground">{project.entityName}</span>
              <Checkbox checked={isChecked(project)} onCheckedChange={() => toggleItem(project)} />
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

export default UsersProjectsList;
