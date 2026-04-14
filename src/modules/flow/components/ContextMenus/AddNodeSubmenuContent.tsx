import React, { useState, useRef } from "react";

import { MagnifyingGlassIcon } from "@phosphor-icons/react";

import NodeItems from "./NodeItems";
import { ContextMenuSubContent } from "@/components/ui/context-menu";
import { DropdownMenuSubContent } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useGetConfigConverter } from "@/modules/flow/services";
import type { BaseNode } from "@/modules/flow/types";

interface AddNodeSubmenuContentProps {
  isDropdownMenu?: boolean;
  onAdd: (data: BaseNode["data"]) => void;
}

export const AddNodeSubmenuContent: React.FC<AddNodeSubmenuContentProps> = ({ isDropdownMenu, onAdd }) => {
  const [nodeSearch, setNodeSearch] = useState("");
  const subContainerRef = useRef<HTMLDivElement>(null);

  const Container = isDropdownMenu ? DropdownMenuSubContent : ContextMenuSubContent;
  const containerClasses = isDropdownMenu ? "w-64 max-w-64 max-h-64 overflow-auto" : "w-64 max-w-64 max-h-64 overflow-auto";

  const { data: nodeTemplates } = useGetConfigConverter();

  return (
    <Container
      className={containerClasses}
      onKeyDown={(e) => {
        e.stopPropagation();
      }}
    >
      <div
        className="flex items-center relative border-b border-border mb-2"
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === "ArrowDown") {
            const firstItem = subContainerRef.current?.querySelector('div[role="menuitem"]') as HTMLDivElement;
            firstItem?.focus();
          }
        }}
      >
        <MagnifyingGlassIcon size={16} className="absolute ml-2" />
        <Input
          autoFocus
          placeholder="Search nodes..."
          value={nodeSearch}
          onChange={(e) => setNodeSearch(e.target.value)}
          className="m-0 pl-8 border-none"
        />
      </div>
      <div
        ref={subContainerRef}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp" && document.activeElement === subContainerRef.current?.querySelector('div[role="menuitem"]')) {
            const searchInput = subContainerRef.current?.previousElementSibling?.querySelector("input") as HTMLInputElement;
            searchInput?.scrollTo({ top: 0, behavior: "auto" });
            searchInput?.focus();
          }
        }}
      >
        <NodeItems nodeTemplates={nodeTemplates} isDropdownMenu={isDropdownMenu} searchTerm={nodeSearch} onAdd={onAdd} />
      </div>
    </Container>
  );
};
export default AddNodeSubmenuContent;
