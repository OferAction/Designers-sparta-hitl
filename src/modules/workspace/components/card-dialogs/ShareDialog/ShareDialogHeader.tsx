import { useState } from "react";

import { CaretDownIcon, LinkSimpleIcon, XIcon } from "@phosphor-icons/react";

import { useToast } from "@/hooks/use-toast";

import type { InvitableUser } from "@/types/user";

import { MultiSelectInput } from "@/components/common/Multi-select-input";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCreateInvitation, useGetLowerRankRolesQuery, useGetUsersWithNoAccessQuery } from "@/services/securityService";
import type { ENTITY_TYPE } from "@/types/accessRequest";
import { Role } from "@/types/role";

export function ShareDialogHeader({
  entityType,
  entityId,
  entityName,
  entityLink,
  dialogRef,
}: {
  entityType: ENTITY_TYPE;
  entityId: string;
  entityName: string;
  entityLink: string;
  dialogRef: React.RefObject<HTMLDivElement>;
}) {
  const { toast } = useToast();
  const { data: roles } = useGetLowerRankRolesQuery(entityType, entityId);
  const { data: invitableUsers } = useGetUsersWithNoAccessQuery(entityType, entityId);
  const { mutate: invite, isPending } = useCreateInvitation(entityType, entityId);

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<InvitableUser[]>([]);

  const defaultRole = roles?.[0] ?? null;
  const activeRole = selectedRole ?? defaultRole;

  const fullLink = typeof window !== "undefined" ? `${window.location.origin}${entityLink}` : entityLink;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullLink);
    toast({ title: "Link copied", description: "The link has been copied to your clipboard.", position: "center" });
  };

  const handleInvite = () => {
    if (!activeRole || selectedUsers.length === 0) return;
    invite(
      {
        userIds: selectedUsers.map((u) => u.externalId),
        entityTypeId: entityId,
        entityType,
        entityLink,
        roleId: activeRole.id,
      },
      {
        onSuccess: () => {
          setSelectedUsers([]);
          setSelectedRole(null);
        },
      }
    );
  };
  return (
    <div>
      <div className="absolute right-4 top-6 flex items-center gap-1">
        <Button variant="ghost" size="icon" className="size-8" onClick={handleCopyLink} title="Copy link">
          <LinkSimpleIcon className="h-4 w-4" />
          <span className="sr-only">Copy link</span>
        </Button>
        <DialogClose asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <XIcon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogClose>
      </div>
      <DialogHeader className="font-base">
        <DialogTitle>Invite members to {entityName}</DialogTitle>
        <DialogDescription className="sr-only">Invite members to collaborate and share access.</DialogDescription>
      </DialogHeader>
      <div className="flex flex-row gap-2 py-4 ">
        <MultiSelectInput
          items={invitableUsers}
          value={selectedUsers}
          onValueChange={setSelectedUsers}
          renderChip={(u) => <span className="text-xs font-medium m-0 p-0.5">{u.name.split(" ")[0]}</span>}
          getItemValue={(u) => `${u.email}-${u.name}`}
          renderItem={(u) => (
            <div className="flex flex-col">
              <span className="text-sm font-medium">{u.name}</span>
              <span className="text-xs text-muted-foreground">{u.email}</span>
            </div>
          )}
          placeholder="Enter member's email here"
          container={dialogRef}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={!activeRole} className="w-24 flex justify-between">
              <span className="text-sm truncate">{activeRole?.name || "Select Role"}</span>
              <CaretDownIcon className="size-4 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {roles?.map((role) => (
              <DropdownMenuItem key={role.id} onSelect={() => setSelectedRole(role)}>
                {role.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button disabled={selectedUsers.length === 0 || !activeRole || isPending} onClick={handleInvite}>
          <span>{"Invite"}</span>
        </Button>
      </div>
    </div>
  );
}
