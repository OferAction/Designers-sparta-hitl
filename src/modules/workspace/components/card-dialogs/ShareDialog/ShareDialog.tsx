import { useRef } from "react";

import { ShareDialogHeader } from "./ShareDialogHeader";
import { getColorIndex } from "@/components/common/Collaborators";
import { Loader } from "@/components/common/Loader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useGetEntityUsers } from "@/services/securityService";
import { getInitials } from "@/services/securityService/utils";
import type { ENTITY_TYPE } from "@/types/accessRequest";

interface Props {
  entityType: ENTITY_TYPE;
  entityId: string;
  entityName: string;
  entityLink: string;
}

export function ShareDialog({ entityType, entityId, entityName, entityLink }: Props) {
  const { data: entityUsers = [], isLoading } = useGetEntityUsers(entityId);

  const dialogRef = useRef<HTMLDivElement>(null);
  return (
    <DialogContent
      ref={dialogRef}
      className="w-[600px] bg-background border-sidebar-border h-[660px] overflow-hidden flex flex-col pt-8"
      hideCloseButton
    >
      <ShareDialogHeader entityType={entityType} entityId={entityId} entityName={entityName} entityLink={entityLink} dialogRef={dialogRef} />

      <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-hidden border-t border-border pt-4 -mx-6 px-6">
        <span className="text-sm text-foreground">Who has access</span>
        <div className="flex-1 min-h-0 overflow-y-auto styled-scrollbar rounded-lg border border-sidebar-border px-6 py-0.5">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader />
            </div>
          ) : entityUsers.length === 0 ? (
            <div className="flex items-center justify-center pt-[45%] text-sm text-muted-foreground">No one has access yet</div>
          ) : (
            <div>
              {entityUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between py-4 pl-4 pr-1 hover:bg-muted/50 transition-colors border-b border-border last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className={cn("text-sm font-normal leading-none text-white", getColorIndex(user.userName ?? ""))}>
                        {getInitials(user.userName ?? "")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium">{user.userName}</span>
                      <span className="text-xs text-muted-foreground">{user.userEmail}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs font-medium shrink-0 rounded-full w-14 text-center">
                    {user.roleName ?? "—"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DialogContent>
  );
}
