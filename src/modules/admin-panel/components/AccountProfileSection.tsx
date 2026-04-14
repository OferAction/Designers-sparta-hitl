import { PencilSimpleIcon } from "@phosphor-icons/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface AccountProfileSectionProps {
  name: string;
  email: string;
  roleBio?: string;
  avatar?: string;
  initials?: string;
  onEditPicture?: () => void;
  className?: string;
  showRoleBio?: boolean;
}

export const AccountProfileSection = ({
  name,
  email,
  roleBio,
  avatar,
  initials,
  onEditPicture,
  className,
  showRoleBio = true,
}: AccountProfileSectionProps) => {
  return (
    <div className={cn("w-full flex flex-col gap-8", className)}>
      <div className="flex items-center gap-2">
        <Avatar className="h-14 w-14 rounded-full">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
        </Avatar>
        <Button variant="ghost" className="h-10 flex items-center justify-start transition-colors" onClick={onEditPicture}>
          <PencilSimpleIcon size={32} />
          <span className="ml-2">Edit picture</span>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div className="flex-1 flex-col gap-2">
          <Label htmlFor="account-name" className="text-foreground text-sm font-medium">
            Name
          </Label>
          <Input disabled placeholder="Name" className="text-muted-foreground" variant="tag" value={name} />
        </div>
        <div className="flex-1 flex-col gap-2">
          <Label htmlFor="account-email" className="text-foreground text-sm font-medium">
            Email
          </Label>
          <Input disabled placeholder="Email" className="text-muted-foreground" variant="tag" value={email} />
        </div>
        {showRoleBio && (
          <div className="flex-1 flex-col gap-2">
            <Label htmlFor="account-role" className="text-foreground text-sm font-medium">
              Role / Bio
            </Label>
            <Input disabled placeholder="Role / Bio" className="text-muted-foreground" variant="tag" value={roleBio} />
          </div>
        )}
      </div>
    </div>
  );
};
