import React, { useState, useRef, useCallback, useMemo } from "react";

import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useParams } from "react-router-dom";

import { SubflowIcon } from "@/lib/icons";
import { ContextMenuSubContent, ContextMenuItem, ContextMenuSeparator } from "@/components/ui/context-menu";
import { DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { File } from "@/modules/workspace";
import { useGetSubflowsProjectService } from "@/services/subflowConfiguratinService";

type SubflowItem = File & { flowName: string };

interface AddSubflowSubmenuContentProps {
  isDropdownMenu?: boolean;
  onAdd: (id: SubflowItem) => void;
}

interface SubflowItemsProps {
  subflows: SubflowItem[];
  searchTerm: string;
  isDropdownMenu?: boolean;
  onAdd: (id: SubflowItem) => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
}

const SubflowItems: React.FC<SubflowItemsProps> = ({ subflows, searchTerm, isDropdownMenu, onAdd, searchInputRef }) => {
  const term = searchTerm.trim().toLowerCase();
  const filtered = subflows.filter((n) => {
    if (!term) return true;
    return (
      String(n.name || "")
        .toLowerCase()
        .includes(term) ||
      String(n.flowName || "")
        .toLowerCase()
        .includes(term)
    );
  });
  if (!filtered.length) {
    return <div className="py-2 text-center text-foreground text-xs select-none">No subflows found</div>;
  }
  return (
    <>
      {filtered.map((n, index: number) => {
        const ItemComponent = isDropdownMenu ? DropdownMenuItem : ContextMenuItem;
        const SeparatorComponent = isDropdownMenu ? DropdownMenuSeparator : ContextMenuSeparator;
        return (
          <React.Fragment key={n.id}>
            <ItemComponent
              className="cursor-pointer"
              onPointerMove={(ev) => {
                if (document.activeElement === searchInputRef.current) ev.preventDefault();
              }}
              onMouseEnter={(ev) => {
                if (document.activeElement === searchInputRef.current) {
                  ev.preventDefault();
                  searchInputRef.current?.focus();
                }
              }}
              onClick={() => onAdd(n)}
            >
              <div className="flex items-center gap-2 truncate">
                <div className="bg-accent/50 size-6 flex items-center justify-center rounded-md">
                  <SubflowIcon className="text-purple-foreground" />
                </div>
                <div className="flex flex-col justify-center gap-1 w-full">
                  <p className="text-sm leading-5 font-normal text-foreground truncate">{n.name}</p>
                </div>
              </div>
            </ItemComponent>
            {index < filtered.length - 1 && <SeparatorComponent />}
          </React.Fragment>
        );
      })}
    </>
  );
};

export const AddSubflowSubmenuContent: React.FC<AddSubflowSubmenuContentProps> = ({ isDropdownMenu, onAdd }) => {
  const [subflowSearch, setSubflowSearch] = useState("");
  const { data: subflowsData } = useGetSubflowsProjectService();
  const subflowContainerRef = useRef<HTMLDivElement>(null);
  const subflowSearchRef = useRef<HTMLInputElement>(null);

  const { configId = "", subflowConfigId = "" } = useParams();
  const currentConfigId = subflowConfigId && configId ? subflowConfigId : configId && !subflowConfigId ? configId : null;

  const Container = isDropdownMenu ? DropdownMenuSubContent : ContextMenuSubContent;
  const containerClasses = "w-64 max-h-64 overflow-y-auto overscroll-contain";

  const subflows: SubflowItem[] = useMemo(() => {
    if (!subflowsData || !subflowsData.length) return [];
    const flat = subflowsData.flatMap((flow) =>
      (flow.files || []).map((file) => ({
        ...file,
        flowName: flow.name,
      }))
    );
    return currentConfigId ? flat.filter((file) => file.activeConfigurationId !== currentConfigId) : flat;
  }, [subflowsData, currentConfigId]);

  const focusFirstItem = useCallback(() => {
    const firstItem = subflowContainerRef.current?.querySelector('[role="menuitem"]') as HTMLElement | null;
    firstItem?.focus();
  }, []);

  const handleArrowNavigation = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const items = Array.from(subflowContainerRef.current?.querySelectorAll('[role="menuitem"]') || []);
      const currentIndex = items.indexOf(document.activeElement as Element);
      if (e.key === "ArrowUp") {
        if (currentIndex <= 0) {
          subflowSearchRef.current?.focus();
          e.preventDefault();
        } else if (currentIndex > 0) {
          (items[currentIndex - 1] as HTMLElement).focus();
          e.preventDefault();
        }
      } else if (e.key === "ArrowDown") {
        if (currentIndex === -1) {
          focusFirstItem();
          e.preventDefault();
        } else if (currentIndex < items.length - 1) {
          (items[currentIndex + 1] as HTMLElement).focus();
          e.preventDefault();
        }
      } else if (e.key === "Escape") {
        subflowSearchRef.current?.focus();
        e.preventDefault();
      }
    },
    [focusFirstItem]
  );

  return (
    <Container className={containerClasses}>
      {!subflows || subflows.length === 0 ? (
        <div className="py-2 text-center text-foreground text-xs select-none">No Subflows Found</div>
      ) : (
        <>
          <div
            className="flex items-center relative border-b border-border mb-2"
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "ArrowDown") {
                focusFirstItem();
              }
            }}
          >
            <MagnifyingGlassIcon size={16} className="absolute ml-2" />
            <Input
              ref={subflowSearchRef}
              placeholder="Search subflows..."
              value={subflowSearch}
              onChange={(e) => setSubflowSearch(e.target.value)}
              className="m-0 pl-8 border-none"
            />
          </div>
          <div ref={subflowContainerRef} onKeyDown={handleArrowNavigation}>
            <SubflowItems
              subflows={subflows}
              isDropdownMenu={isDropdownMenu}
              searchTerm={subflowSearch}
              onAdd={onAdd}
              searchInputRef={subflowSearchRef}
            />
          </div>
        </>
      )}
    </Container>
  );
};
