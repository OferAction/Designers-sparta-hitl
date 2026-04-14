import { CheckIcon, CodesandboxLogoIcon, PlusIcon, SlidersHorizontalIcon, CaretUpDownIcon as ChevronsUpDown, SignOutIcon as LogOut } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

import { Collaborators } from "./Collaborators";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { useTheme } from "@/contexts";
import { useAuthStore } from "@/store/authStore";

type User = {
  name: string;
  email: string;
  avatar: string;
};

// Inside NavUser component, add this data structure for theme options
const themeOptions = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System theme" },
] as const;

export function NavUser({ user, dropdownPosition = "top" }: { user?: User; dropdownPosition?: "top" | "right" }) {
  const { isMobile } = useSidebar();
  const { signOut, user: authUser } = useAuthStore();
  const { colorMode, setColorMode } = useTheme();
  const navigate = useNavigate();

  const displayName = authUser?.name ?? user?.name ?? "User";
  const displayEmail = authUser?.email ?? user?.email ?? "";
  const displayAvatar = user?.avatar ?? "";

  const currentUser = {
    name: displayName,
    email: displayEmail,
    avatar: displayAvatar,
    initials: authUser?.initials ?? (displayName || " ").slice(0, 2).toUpperCase(),
  };

  const users = [{ name: "P N" }];

  // Use the prop to determine the side
  const dropdownSide = isMobile ? "bottom" : dropdownPosition;

  const navigateToSettingPage = () => {
    navigate(`/settings`);
  };

  const handleLogout = () => {
    signOut();
  };
  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:ring-2 data-[state=open]:ring-muted-foreground data-[state=open]:ring-offset-2 data-[state=open]:ring-offset-background"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                  <AvatarFallback className="rounded-lg">{currentUser.initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{currentUser.name}</span>
                  <span className="truncate text-xs">{currentUser.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={dropdownSide}
              align="start"
              sideOffset={8}
            >
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="flex items-center">
                  <CodesandboxLogoIcon size={20} className="mr-2" />
                  <span>Themes</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-48" sideOffset={10}>
                  {themeOptions.map((theme) => (
                    <DropdownMenuItem
                      key={theme.value}
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => setColorMode(theme.value)}
                    >
                      <span>{theme.label}</span>
                      {colorMode === theme.value && <CheckIcon size={20} />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem onClick={navigateToSettingPage}>
                <SlidersHorizontalIcon size={32} />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Collaborators users={users} />
                {currentUser.name}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <PlusIcon size={32} />
                Add account
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleLogout}>
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
}
