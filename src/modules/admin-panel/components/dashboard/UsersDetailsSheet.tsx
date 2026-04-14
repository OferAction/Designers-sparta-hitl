import { useState } from "react";

import { UserDataRow } from "@/types/user";

import UsersProjectsList from "./UsersProjectsList";
import UsersWorkflowsList from "./UsersWorkflowsList";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetProjectsByUsers, useGetWorkflowsByUsers } from "@/services/securityService";
import { cn } from "@/utils";

type UserSheetTab = "Projects" | "Workflow";

interface UserDetailsSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRow?: UserDataRow;
  title?: string;
  subtitle?: string;
}

export const UsersDetailsSheet = ({ isOpen, onOpenChange, selectedRow, title, subtitle }: UserDetailsSheetProps) => {
  const [activeTab, setActiveTab] = useState<UserSheetTab>("Projects");

  const userId = selectedRow?.id ?? "";

  // Only fetch when the matching tab is active
  const { data: projectsData = [], isLoading: isProjectsLoading } = useGetProjectsByUsers(userId, activeTab === "Projects");
  const { data: workflowsData = [], isLoading: isWorkflowsLoading } = useGetWorkflowsByUsers(userId, activeTab === "Workflow");

  if (!selectedRow) return null;
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-2 bg-sidebar min-w-[452px]">
        <SheetHeader className="border-b border-sidebar-border py-3 overflow-x-hidden">
          <div className="px-4 gap-2 flex flex-col items-start py-3">
            <div className="flex flex-row items-center gap-3 max-w-full">
              <Avatar className="h-8 w-8 shrink-0">
                {selectedRow.profilePicture ? (
                  <AvatarImage src={selectedRow.profilePicture} alt={selectedRow.name} />
                ) : (
                  <AvatarFallback className="text-sm font-normal leading-none text-foreground" style={{ backgroundColor: selectedRow.avatarColor }}>
                    {selectedRow.avatarInitials}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex flex-col items-start justify-center min-w-0">
                <SheetTitle className="text-sm text-foreground">{title ? title : "__"}</SheetTitle>
                <SheetDescription className="w-full text-xs text-muted-foreground truncate">{subtitle ? subtitle : "__"}</SheetDescription>
              </div>
            </div>
            <div className="w-full flex gap-2 items-center">
              <Badge className="text-xs text-secondary-foreground font-semibold rounded-full" variant="secondary">
                {selectedRow.userRole}
              </Badge>
              <Badge
                className={cn(
                  "text-xs font-semibold rounded-full",
                  selectedRow.isActive ? "text-success bg-success/20" : "text-destructive bg-destructive/20"
                )}
                variant={selectedRow.isActive ? "secondary" : "destructive"}
              >
                {selectedRow.isActive ? "Active" : "Inactive"}
              </Badge>
              <Badge className="text-xs text-secondary-foreground font-semibold rounded-full border-border" variant="secondary">
                {selectedRow.projects} projects, {selectedRow.workflows} workflows
              </Badge>
            </div>
          </div>
        </SheetHeader>
        <div className="py-2 h-full overflow-hidden">
          <Tabs
            className="size-full p-1 flex flex-col items-end gap-2"
            value={activeTab}
            onValueChange={(value: string) => {
              if (value === "Projects" || value === "Workflow") {
                setActiveTab(value);
              }
            }}
          >
            <TabsList className="w-fit flex items-center p-1 rounded-lg bg-secondary">
              <TabsTrigger
                value="Projects"
                className="data-[state=active]:bg-background data-[state=active]:rounded-md py-1.5 px-3 text-sm data-[state=active]:text-foreground text-muted-foreground"
              >
                Projects
              </TabsTrigger>
              <TabsTrigger
                value="Workflow"
                className="data-[state=active]:bg-background data-[state=active]:rounded-md py-1.5 px-3 text-sm data-[state=active]:text-foreground text-muted-foreground"
              >
                Workflow
              </TabsTrigger>
            </TabsList>

            <TabsContent value="Projects" className="size-full">
              <UsersProjectsList items={projectsData} userId={selectedRow.id} isLoading={isProjectsLoading} onOpenChange={onOpenChange} />
            </TabsContent>

            <TabsContent value="Workflow" className="size-full">
              <UsersWorkflowsList items={workflowsData} userId={selectedRow.id} isLoading={isWorkflowsLoading} onOpenChange={onOpenChange} />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default UsersDetailsSheet;
