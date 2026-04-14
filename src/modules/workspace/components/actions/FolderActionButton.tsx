import { CaretDownIcon, FlowArrowIcon, FolderIcon } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

import { useFileActions } from "@/modules/workspace/hooks/useFileActions";
import { useFolderActions } from "@/modules/workspace/hooks/useFolderActions";

import { SubflowIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function FolderActionButton() {
  const { addUntitledFolder, addFolderPending } = useFolderActions();
  const { addUntitledFile, createFilePending, addUntitledSubflow } = useFileActions();
  const navigate = useNavigate();

  const isPending = addFolderPending || createFilePending;

  const dropdownItems = [
    {
      icon: FlowArrowIcon,
      label: "Workflow",
      onClick: addUntitledFile,
    },
    {
      icon: FolderIcon,
      label: "Project",
      onClick: addUntitledFolder,
    },
    {
      icon: SubflowIcon,
      label: "Subflow",
      onClick: () => {
        addUntitledSubflow();
        navigate("templates");
      },
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button loading={isPending} variant="purple">
          Create
          <CaretDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px]">
        {dropdownItems.map((item, index) => (
          <DropdownMenuItem key={index} className="flex items-center gap-2 cursor-pointer" onClick={item.onClick}>
            <item.icon className="size-4" />
            <button>{item.label}</button>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
