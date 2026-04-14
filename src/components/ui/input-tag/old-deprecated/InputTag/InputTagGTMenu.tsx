import { useMemo, useState } from "react";

import { CaretDownIcon, DatabaseIcon, LinkBreakIcon } from "@phosphor-icons/react";

import { InputTagContextProps, useInputTagContextSelector } from "./contexts";
import { GTMenuItem } from "./types";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { cn } from "@/utils";

interface MenuHeaderProps {
  connectedTo?: string;
  showDetach?: boolean;
  isConnected?: boolean;
  onDetach?: () => void;
}

const MenuHeader: React.FC<MenuHeaderProps> = ({ connectedTo, showDetach, isConnected, onDetach }) => {
  const gtConnected = useInputTagContextSelector((ctx) => ctx.gtConnected);

  const handleDetach = () => {
    if (onDetach) {
      onDetach();
    }
  };

  return (
    <div className="flex items-center justify-between px-3 pt-3 pb-2">
      <div className="flex items-center gap-2 text-sm font-medium text-primary">
        Connect to <DatabaseIcon className="h-4 w-4 inline text-blue-accent" />
        <span className="font-semibold text-blue-accent">{connectedTo}</span>
      </div>
      {showDetach && (isConnected || gtConnected) && (
        <button onClick={handleDetach} className="text-white/90 hover:text-white hover:bg-blue-accent/10 rounded-md p-1">
          <LinkBreakIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

interface SearchComponentProps {
  searchValue: string;
  setSearchValue: (value: string) => void;
  scope: "all" | "recents";
  setScope: (scope: "all" | "recents") => void;
}

const SearchComponent: React.FC<SearchComponentProps> = ({ searchValue, setSearchValue, scope, setScope }) => {
  return (
    <div className="relative mb-2">
      <CommandInput value={searchValue} onValueChange={setSearchValue} placeholder="Type a property name or search..." />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center px-2 py-1 text-xs rounded 
                    bg-blue-background border border-border text-muted-foreground"
          >
            {scope === "all" ? "All" : "Recents"}
            <CaretDownIcon className="ml-1 h-2 w-2" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end" className="w-24 p-0">
          <DropdownMenuItem onSelect={() => setScope("all")}>All</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setScope("recents")}>Recents</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

// Item renderer component
interface ItemRendererProps {
  item: GTMenuItem;
  onSelect: () => void;
}

const ItemRenderer: React.FC<ItemRendererProps> = ({ item, onSelect }) => {
  return (
    <CommandItem
      key={item.id}
      value={item.id}
      onSelect={onSelect}
      className={cn("flex justify-between bg-blue-background cursor-pointer hover:bg-blue-accent/20 data-[selected=true]:bg-blue-accent/20")}
    >
      <span className="flex items-center gap-2">
        {item.icon}
        {item.label}
      </span>
      {item.value && <span className="text-xs text-muted-foreground truncate">{item.value}</span>}
    </CommandItem>
  );
};

interface InputTagGTMenuProps {
  items: GTMenuItem[];
  connectedTo?: string;
  showDetach?: boolean;
  isConnected?: boolean;
  onDetach?: () => void;
}

const selector = (ctx: InputTagContextProps) => ({
  isGTMenuOpen: ctx.isGTMenuOpen,
  onSelectGTItem: ctx.onSelectGTItem,
  setIsGTMenuOpen: ctx.setIsGTMenuOpen,
});

export function InputTagGTMenu({ items, connectedTo, showDetach = false, isConnected, onDetach }: InputTagGTMenuProps) {
  const { isGTMenuOpen: open, onSelectGTItem, setIsGTMenuOpen } = useInputTagContextSelector(selector);

  const [scope, setScope] = useState<"all" | "recents">("all");
  const [searchValue, setSearchValue] = useState("");

  const recents = items.filter((i) => i.section === "recents");
  const all = items.filter((i) => i.section === "all");

  const onOpenChange = (val: boolean) => {
    setIsGTMenuOpen(val);
  };
  const filteredRecents = useMemo(() => {
    return scope === "recents" && searchValue
      ? recents.filter(
          (item) =>
            item.label.toLowerCase().includes(searchValue.toLowerCase()) ||
            (item.value && item.value.toLowerCase().includes(searchValue.toLowerCase()))
        )
      : recents;
  }, [scope, searchValue, recents]);

  const filteredAll = useMemo(() => {
    return scope === "all" && searchValue
      ? all.filter(
          (item) =>
            item.label.toLowerCase().includes(searchValue.toLowerCase()) ||
            (item.value && item.value.toLowerCase().includes(searchValue.toLowerCase()))
        )
      : all;
  }, [scope, searchValue, all]);

  const handleItemSelect = (item: GTMenuItem) => {
    onSelectGTItem(item);
  };

  const handleDetach = () => {
    if (onDetach) {
      onDetach();
    }
    onOpenChange(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <span />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="bottom"
        align="start"
        sideOffset={0}
        avoidCollisions={false}
        collisionBoundary={undefined}
        className="w-[320px] mt-3 p-0 rounded-md border border-border-blue bg-blue-background text-white shadow-lg"
      >
        {/* Header */}
        <MenuHeader connectedTo={connectedTo} showDetach={showDetach} isConnected={isConnected} onDetach={handleDetach} />

        <Command className="bg-blue-background" shouldFilter={false}>
          {/* Search + scope selector */}
          <SearchComponent searchValue={searchValue} setSearchValue={setSearchValue} scope={scope} setScope={setScope} />

          <CommandList className="max-h-[300px] overflow-y-auto bg-blue-background">
            <CommandEmpty>No results found.</CommandEmpty>

            {filteredRecents.length > 0 && (
              <CommandGroup heading="Recents">
                {filteredRecents.map((item) => (
                  <ItemRenderer key={item.id} item={item} onSelect={() => handleItemSelect(item)} />
                ))}
              </CommandGroup>
            )}

            {filteredRecents.length > 0 && filteredAll.length > 0 && <DropdownMenuSeparator className="bg-border-blue" />}

            {filteredAll.length > 0 && (
              <CommandGroup heading="All Properties">
                {filteredAll.map((item) => (
                  <ItemRenderer key={item.id} item={item} onSelect={() => handleItemSelect(item)} />
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
