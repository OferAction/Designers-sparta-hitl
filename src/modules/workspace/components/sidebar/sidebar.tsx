import { useEffect, useRef, useState } from "react";

import { CaretUpDownIcon } from "@phosphor-icons/react";

import { NavMain } from "./NavMain";
import { NavSecondary } from "./NavSecondary";
import { SidebarItems } from "../../constants";
import { useSearch } from "../../contexts";
import { GenOrLogoIcon as GenOr } from "@/lib/icons";
import { NavUser } from "@/components/common/NavUser";
import { Command, CommandInput } from "@/components/ui/command";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { cn } from "@/utils";

const MAX_SEARCH_LENGTH = 100;

function useDebouncedSearch() {
  const { searchValue, setSearchValue: debouncedSetSearchValue } = useSearch();

  const [value, setValue] = useState(searchValue || "");

  const setDebouncedValue = (newValue: string) => {
    setValue(newValue);
    debouncedSetSearchValue(newValue);
  };

  return [value, setDebouncedValue] as const;
}

export function WorkflowSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { navMain, navSecondary, user } = SidebarItems;
  const [searchValue, setSearchValue] = useDebouncedSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClearSearch = () => {
    setSearchValue("");
  };

  const handleSearchChange = (value: string) => {
    if (value.length <= MAX_SEARCH_LENGTH) {
      setSearchValue(value);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl+K (Windows/Linux) or Command+K (macOS)
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <Sidebar variant="sidebar" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-accent text-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GenOr className="fill-white size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-sm">Action</span>
                </div>
                <CaretUpDownIcon />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarHeader className="group-data-[collapsible=icon]:hidden">
        <Command className="relative border-0 rounded-none">
          <CommandInput
            ref={inputRef}
            placeholder="Search anything"
            className={cn("pr-7 rounded-none text-left focus-within:truncate")}
            containerClassName=""
            hideSearchIcon={false}
            value={searchValue}
            onValueChange={handleSearchChange}
            showClearButton={searchValue.length > 0}
            onClear={handleClearSearch}
          />
          {searchValue.length === 0 && (
            <span className="absolute right-14 top-1/2 -translate-y-1/2 text-xs text-muted-foreground tracking-widest">⌘K</span>
          )}
        </Command>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} dropdownPosition="top" />
      </SidebarFooter>
    </Sidebar>
  );
}
