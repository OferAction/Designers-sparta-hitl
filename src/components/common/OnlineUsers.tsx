import { HTMLAttributes } from "react";

import WithTooltip from "./WithTooltip";
import { TooltipProvider } from "../ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCollaborativeStore } from "@/store";
import type { CollaborativeUser } from "@/store/slices/collaborativeSlice";
import { cn } from "@/utils";

interface OnlineUsersProps extends HTMLAttributes<HTMLDivElement> {
  truncate?: number;
}

const selectUserDisplay = (state: { collaborativeUsers: CollaborativeUser[] }) => {
  return state.collaborativeUsers.map((user) => ({
    clientId: user.clientId,
    userName: user.userName,
    initials: user.initials,
    color: user.color,
  }));
};

const areUserDisplaysEqual = (a: ReturnType<typeof selectUserDisplay>, b: ReturnType<typeof selectUserDisplay>) => {
  if (a.length !== b.length) return false;

  return a.every((userA, index) => {
    const userB = b[index];
    return userA.clientId === userB.clientId && userA.userName === userB.userName && userA.initials === userB.initials && userA.color === userB.color;
  });
};

export function OnlineUsers({ className = "", truncate = 4, ...props }: OnlineUsersProps) {
  const collaborativeUsers = useCollaborativeStore(selectUserDisplay, areUserDisplaysEqual);

  const visibleUsers = collaborativeUsers.slice(0, truncate);
  const remainingCount = collaborativeUsers.length - truncate;
  const hasMoreUsers = remainingCount > 0;

  return (
    <div className="flex items-center gap-2">
      <div className={cn("flex", className)} {...props}>
        <TooltipProvider>
          {visibleUsers.map((user) => (
            <WithTooltip key={user.clientId} tooltip={user.userName}>
              <Avatar className="size-6 text-xs leading-none text-secondary-foreground font-normal">
                <AvatarFallback
                  className={cn("text-secondary-foreground")}
                  style={{
                    backgroundColor: user.color || "#ffffff",
                  }}
                >
                  {user.initials}
                </AvatarFallback>
              </Avatar>
            </WithTooltip>
          ))}
        </TooltipProvider>
        {hasMoreUsers && (
          <Avatar className="size-6 text-xs leading-none text-secondary-foreground font-normal">
            <AvatarFallback className="bg-muted text-muted-foreground">+{remainingCount}</AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
}
