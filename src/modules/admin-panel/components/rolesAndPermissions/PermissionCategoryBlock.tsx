import { CaretUpIcon } from "@phosphor-icons/react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import { type PermissionsFormValues } from "./utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { PermissionGroup } from "@/modules/admin-panel/types";
import { cn } from "@/utils";

interface PermissionCategoryBlockProps {
  group: PermissionGroup;
  roleId: string;
  searchQuery?: string;
}

export default function PermissionCategoryBlock({ group, roleId, searchQuery = "" }: PermissionCategoryBlockProps) {
  const { control, setValue } = useFormContext<PermissionsFormValues>();

  const matchesSearch = (text: string) => !searchQuery.trim() || text.toLowerCase().includes(searchQuery.trim().toLowerCase());

  const groupMatches = group.permissions.some(
    (p) =>
      matchesSearch(p.permissionDisplayName) ||
      matchesSearch(p.permissionDescription) ||
      matchesSearch(p.permissionName) ||
      matchesSearch(group.groupName)
  );
  const categoryMatches = matchesSearch(group.groupName);

  const visible = groupMatches || categoryMatches;

  const rolePermissions = useWatch({
    control,
    name: roleId,
    defaultValue: {},
  });
  const allChecked = group.permissions.every((permission) => rolePermissions?.[permission.permissionId] === true);

  if (!visible) return null;

  const handleToggle = (permissionId: string, checked: boolean) => {
    setValue(`${roleId}.${permissionId}`, checked, { shouldDirty: true });
  };

  return (
    <div className="border border-sidebar-border rounded-lg overflow-hidden">
      <Collapsible defaultOpen={true}>
        <CollapsibleTrigger asChild>
          <div className="group cursor-pointer hover:bg-muted/70 border-sidebar-border border-t first:border-t-0 py-3 align-top bg-muted/40">
            <div className="flex flex-row w-full justify-between pl-2 gap-4 pr-4 items-center ">
              <div onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  id={`cat-${group.groupName.replace(/\s+/g, "-")}`}
                  checked={allChecked}
                  onCheckedChange={(checked) => {
                    const next = checked === true;
                    group.permissions.forEach((p) => handleToggle(p.permissionId, next));
                  }}
                  className="shrink-0 ml-3"
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <span className="font-semibold text-base text-muted-foreground">{group.groupName}</span>
                {group.permissions.length > 0 && <p className="text-xs text-muted-foreground ">{group.permissions[0].permissionDescription}</p>}
              </div>
              <div className="flex items-center justify-center self-center">
                <CaretUpIcon className="group-data-[state=open]:rotate-180 size-4 shrink-0 text-muted-foreground" aria-hidden />
              </div>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent asChild>
          <div className="hover:bg-transparent border-0">
            <div>
              {group.permissions.map((perm) => {
                if (
                  searchQuery.trim() &&
                  !matchesSearch(perm.permissionDisplayName) &&
                  !matchesSearch(perm.permissionDescription) &&
                  !matchesSearch(perm.permissionName)
                )
                  return null;

                return (
                  <div key={perm.permissionId} className="hover:bg-muted/30 items-start flex-row flex border-t border-sidebar-border py-3 pl-6">
                    <div className="flex-1 flex flex-row items-center gap-4">
                      <Controller
                        name={`${roleId}.${perm.permissionId}`}
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            id={field.name}
                            checked={field.value ?? false}
                            onCheckedChange={(c) => {
                              field.onChange(c === true);
                            }}
                            onBlur={field.onBlur}
                            ref={field.ref}
                            className="shrink-0 mx-2"
                          />
                        )}
                      />
                      <div className="flex flex-col gap-1">
                        <label htmlFor={`perm-${perm.permissionId}`} className="text-sm text-foreground cursor-pointer">
                          {perm.permissionDisplayName}
                        </label>
                        <p className="text-xs text-muted-foreground ">{perm.permissionDescription}</p>
                      </div>
                    </div>

                    <div className=" flex-1 flex self-center ">
                      <span
                        className={cn("inline-flex text-xs leading-4 font-roboto-mono text-foreground border  border-sidebar-border px-2 py-0.5 rounded-xl")}
                      >
                        {perm.permissionName}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
