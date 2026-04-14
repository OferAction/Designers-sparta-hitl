import React from "react";

import { Collaborators } from "@/components/common/Collaborators";

interface CardFooterProps {
  users?: Array<{ image?: string; name: string }>;
  children: React.ReactNode;
}

export function CardFooter({ users = [], children }: CardFooterProps) {
  return (
    <div className="flex items-center justify-between">
      {children}
      <Collaborators users={users} />
    </div>
  );
}
