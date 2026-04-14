import React, { useState, useRef, useCallback, useMemo } from "react";

import { MagnifyingGlassIcon } from "@phosphor-icons/react";

import { useGetConfigConverter } from "../../services";
import { ContextMenuSubContent, ContextMenuItem, ContextMenuSeparator } from "@/components/ui/context-menu";
import { DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { NodeIconsMapping } from "@/constants";

export type ConnectorItem = {
  id: string;
  name: string;
  title: string;
  description?: string;
  type: string;
  data: { name: string; title: string; description?: string };
};

interface AddConnectorSubmenuContentProps {
  isDropdownMenu?: boolean;
  onAdd: (connector: ConnectorItem) => void;
}

interface ConnectorItemsProps {
  connectors: ConnectorItem[];
  searchTerm: string;
  isDropdownMenu?: boolean;
  onAdd: (connector: ConnectorItem) => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
}

const ConnectorItems: React.FC<ConnectorItemsProps> = ({ connectors, searchTerm, isDropdownMenu, onAdd, searchInputRef }) => {
  const term = searchTerm.trim().toLowerCase();
  const filtered = connectors.filter((n) => {
    if (!term) return true;
    return (
      String(n.title || "")
        .toLowerCase()
        .includes(term) ||
      String(n.name || "")
        .toLowerCase()
        .includes(term)
    );
  });
  if (!filtered.length) {
    return <div className="py-2 text-center text-foreground text-xs select-none">No connectors found</div>;
  }
  return (
    <>
      {filtered.map((n, index: number) => {
        const ItemComponent = isDropdownMenu ? DropdownMenuItem : ContextMenuItem;
        const SeparatorComponent = isDropdownMenu ? DropdownMenuSeparator : ContextMenuSeparator;
        const ItemIcon = NodeIconsMapping[n.name as keyof typeof NodeIconsMapping];
        const common = (
          <div className="flex items-center gap-2 truncate">
            {ItemIcon && <ItemIcon className="size-4 text-foreground" />}
            <span className="truncate">{n.title}</span>
          </div>
        );

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
              {common}
            </ItemComponent>
            {index < filtered.length - 1 && <SeparatorComponent />}
          </React.Fragment>
        );
      })}
    </>
  );
};

export const AddConnectorSubmenuContent: React.FC<AddConnectorSubmenuContentProps> = ({ isDropdownMenu, onAdd }) => {
  const [connectorSearch, setConnectorSearch] = useState("");
  const { data: nodeTemplates } = useGetConfigConverter();
  const connectorContainerRef = useRef<HTMLDivElement>(null);
  const connectorSearchRef = useRef<HTMLInputElement>(null);

  const Container = isDropdownMenu ? DropdownMenuSubContent : ContextMenuSubContent;
  const containerClasses = "w-64 max-h-64 overflow-y-auto overscroll-contain";

  const connectors: ConnectorItem[] = useMemo(() => {
    if (!nodeTemplates) return [] as any;
    const list = Object.values(nodeTemplates).filter((node: any) => node && node.type === "connector");
    return list.map((node: any) => ({
      id: node.id,
      name: node.data?.name,
      title: node.data?.title,
      description: node.data?.description,
      type: node.type,
      data: node.data,
    }));
  }, [nodeTemplates]);

  const focusFirstItem = useCallback(() => {
    const firstItem = connectorContainerRef.current?.querySelector('[role="menuitem"]') as HTMLElement | null;
    firstItem?.focus();
  }, []);

  const handleArrowNavigation = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const items = Array.from(connectorContainerRef.current?.querySelectorAll('[role="menuitem"]') || []);
      const currentIndex = items.indexOf(document.activeElement as Element);
      if (e.key === "ArrowUp") {
        if (currentIndex <= 0) {
          connectorSearchRef.current?.focus();
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
        connectorSearchRef.current?.focus();
        e.preventDefault();
      }
    },
    [focusFirstItem]
  );

  return (
    <Container className={containerClasses}>
      {!connectors || connectors.length === 0 ? (
        <div className="py-2 text-center text-foreground text-xs select-none">No Connectors Found</div>
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
              ref={connectorSearchRef}
              placeholder="Search connectors..."
              value={connectorSearch}
              onChange={(e) => setConnectorSearch(e.target.value)}
              className="m-0 pl-8 border-none"
            />
          </div>
          <div ref={connectorContainerRef} onKeyDown={handleArrowNavigation}>
            <ConnectorItems
              connectors={connectors}
              isDropdownMenu={isDropdownMenu}
              searchTerm={connectorSearch}
              onAdd={onAdd}
              searchInputRef={connectorSearchRef}
            />
          </div>
        </>
      )}
    </Container>
  );
};

export default AddConnectorSubmenuContent;
