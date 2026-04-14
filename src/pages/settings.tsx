import { CaretRightIcon, UserCircleGearIcon, UserIcon } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sidebar, SidebarContent, SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SidebarHeader } from "@/modules/dataset/components/mapping-sidebar";
import { AccountTab } from "@/modules/workspace/components";

const Settings = () => {
  const navigate = useNavigate();

  return (
    <SidebarProvider open>
      <SidebarInset>
        <div className="flex h-screen">
          <Sidebar>
            <SidebarHeader onBackClick={() => navigate("/")} title="Settings" />
            <ScrollArea className="flex-1">
              <SidebarContent className="flex pt-5 mx-1 flex-col">
                <Button variant="ghost" className="flex items-center justify-start transition-colors bg-accent text-accent-foreground shadow-inner">
                  <UserIcon size={32} />
                  <span className="ml-2">Account</span>
                </Button>

                <Button
                  variant="ghost"
                  className="flex items-center justify-between transition-colors text-primary"
                  onClick={() => navigate("/settings/admin")}
                >
                  <div className="flex gap-2 items-center">
                    <UserCircleGearIcon size={32} />
                    <span className="ml-2">Admin</span>
                  </div>
                  <CaretRightIcon />
                </Button>
              </SidebarContent>
            </ScrollArea>
          </Sidebar>

          <div className="w-full flex flex-col justify-between overflow-hidden">
            <div className="px-3 h-full overflow-hidden">
              <AccountTab handleBack={() => navigate("/")} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Settings;
