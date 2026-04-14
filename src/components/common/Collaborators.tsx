import { HTMLAttributes } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/utils";

interface CollaboratorsProps extends HTMLAttributes<HTMLDivElement> {
  users?: { image?: string | undefined; name: string }[];
  displayName?: boolean;
  truncate?: number;
}

const fallback = (userName: string) => {
  const words = userName ? userName.split(" ") : "";
  return (words[0]?.[0] || "").concat(words[1]?.[0] || "").toUpperCase();
};

const colors = ["bg-border-purple", "bg-purple-accent-hover", "bg-success", "bg-border-blue"];
export const getColorIndex = (userName: string) => {
  const hash = userName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export function Collaborators({ users = [], className = "", displayName = false, truncate = 4, children, ...props }: CollaboratorsProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn("flex -space-x-2", className)} {...props}>
        {users.slice(0, truncate).map((user, index) => (
          <Avatar key={index} className="size-6 text-xs leading-none text-secondary-foreground font-normal">
            <AvatarImage src={user.image} alt="User avatar" />
            <AvatarFallback className={cn("text-secondary-foreground", getColorIndex(user.name))}>{fallback(user.name)}</AvatarFallback>
          </Avatar>
        ))}
      </div>
      {children ||
        (displayName && (
          <p className="text-xs leading-5 text-sidebar-foreground">
            {users[0].name.split(" ")[0]}
            {users.length > 1 && ` and ${users.length - 1} more`}
          </p>
        ))}
    </div>
  );
}
