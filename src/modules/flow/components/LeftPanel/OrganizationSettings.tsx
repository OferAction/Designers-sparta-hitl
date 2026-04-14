import { Fragment } from "react";

import { GearFineIcon, HouseIcon, QuestionIcon } from "@phosphor-icons/react";
import { DropdownMenuGroup } from "@radix-ui/react-dropdown-menu";
import { CaretDownIcon as ChevronDown } from "@phosphor-icons/react";

import { GenOrLogoIcon as GenOr } from "@/lib/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { mitt } from "@/lib/mitt";
import { cn } from "@/utils";

export function OrganizationSettings({ collapsed = false }: { collapsed?: boolean }) {
  const LIST = [
    [
      {
        title: "Open Homepage",
        icon: <HouseIcon size={16} />,
        action: () => {
          window.open(`/`, "_blank");
        },
      },
    ],
    [
      {
        title: "Preferences",
        icon: <GearFineIcon size={16} />,
        action: () => {},
      },
      {
        title: "Keyboard shortcuts",
        icon: <QuestionIcon size={16} />,
        shortcut: "⌘ ⇧ /",
        action: () => mitt.emit("canvas:shortcuts-panel", true),
      },
    ],
  ];

  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex items-center justify-between">
        <DropdownMenu>
          <div className={cn("w-full flex items-center gap-1 p-2", collapsed && "flex-col")}>
            <GenOr className={cn("fill-white h-8 w-8")} />

            <DropdownMenuTrigger asChild className="py-5">
              <SidebarMenuButton className="flex justify-center items-center w-4 h-4 p-0 rounded-none">
                <div>
                  <ChevronDown width={14} />
                </div>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
          </div>

          <DropdownMenuContent className="w-fit" align="start" side="bottom">
            {LIST.map((group, i) => (
              <Fragment key={i}>
                <DropdownMenuGroup>
                  {group.map((item) => (
                    <DropdownMenuItem key={item.title} onClick={item.action}>
                      {item.icon}
                      {item.title}
                      {item.shortcut && (
                        <DropdownMenuShortcut className="text-xs ml-6 leading-5 font-inter tracking-widest  text-muted-foreground">
                          {item.shortcut}
                        </DropdownMenuShortcut>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
                {i < LIST.length - 1 && <DropdownMenuSeparator />}
              </Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
