import { useCallback } from "react";

import { ChatDotsIcon, ListDashesIcon, UsersFourIcon } from "@phosphor-icons/react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { ShieldUserIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sidebar, SidebarContent, SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SidebarHeader } from "@/modules/dataset/components/mapping-sidebar";
import { useGetAccessRequestsQuery } from "@/services/securityService";
import { cn } from "@/utils";

const AdminSettingsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: accessRequests = [] } = useGetAccessRequestsQuery();
  const hasPendingRequests = accessRequests.length > 0;

  const handleBack = useCallback(() => {
    navigate("/settings");
  }, [navigate]);

  const isActive = (path: string) => {
    if (path === "/settings/admin" && location.pathname === "/settings/admin") {
      return true;
    }
    return location.pathname.startsWith(path) && path !== "/settings/admin";
  };

  return (
    <SidebarProvider open>
      <SidebarInset>
        <div className="flex h-screen">
          <Sidebar>
            <SidebarHeader onBackClick={handleBack} title="Admin" className="border-b-0" />
            <ScrollArea className="flex-1">
              <SidebarContent className="flex flex-col pt-2 mx-1">
                <Button
                  asChild
                  variant="ghost"
                  className={cn(
                    "flex px-4 py-2 items-center justify-start transition-colors",
                    isActive("/settings/admin/dashboard") || isActive("/settings/admin")
                      ? "bg-accent text-accent-foreground shadow-inner"
                      : "text-primary"
                  )}
                  onClick={() => navigate("/settings/admin/dashboard")}
                >
                  <div className="flex gap-2 items-center">
                    <ListDashesIcon size={16} weight="duotone" />
                    <span className="ml-2">Dashboard</span>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  className={cn(
                    "flex px-4 py-2 items-center justify-start transition-colors",
                    isActive("/settings/admin/members") ? "bg-accent text-accent-foreground shadow-inner" : "text-primary"
                  )}
                  onClick={() => navigate("/settings/admin/members")}
                >
                  <UsersFourIcon size={16} weight="duotone" />
                  <span className="ml-2">Members</span>
                </Button>
                <Button
                  variant="ghost"
                  className={cn(
                    "flex px-4 py-2 items-center justify-start transition-colors",
                    isActive("/settings/admin/requests") ? "bg-accent text-accent-foreground shadow-inner" : "text-primary"
                  )}
                  onClick={() => navigate("/settings/admin/requests")}
                >
                  <div className="flex gap-2 items-center">
                    <span className="relative inline-flex shrink-0">
                      <ChatDotsIcon size={16} weight="duotone" />
                      {hasPendingRequests && (
                        <span className="absolute -top-0 right-0 size-1.5 rounded-full bg-primary border border-muted/50" aria-hidden />
                      )}
                    </span>
                    <span className="ml-2">Requests</span>
                  </div>
                  {hasPendingRequests && <span className="text-xs font-medium opacity-80">({accessRequests.length})</span>}
                </Button>
                <Button
                  variant="ghost"
                  className={cn(
                    "flex px-4 py-2 items-center justify-start transition-colors",
                    isActive("/settings/admin/roles-permissions") ? "bg-accent text-accent-foreground shadow-inner" : "text-primary"
                  )}
                  onClick={() => navigate("/settings/admin/roles-permissions")}
                >
                  <ShieldUserIcon className="size-4" />
                  <span className="ml-2">Roles & Permissions</span>
                </Button>
              </SidebarContent>
            </ScrollArea>
          </Sidebar>

          <div className="w-full flex flex-col justify-between overflow-hidden">
            <div className="px-3 h-full overflow-hidden">
              <Outlet />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminSettingsPage;
