import { PlusIcon } from "@phosphor-icons/react";

import useDataLoaderRightPanelInputs from "@/modules/flow/hooks/useDataLoaderRightPanelInputs";

import { Button } from "@/components/ui/button";

export const DataLoaderRightPanelDropdown = () => {
  const { handleAddInput } = useDataLoaderRightPanelInputs();
  return (
    <Button className="size-7 bg-secondary shadow-action-btn-inset" variant="ghost" size="icon" onClick={() => handleAddInput()}>
      <PlusIcon className="text-foreground" size={16} />
    </Button>
  );
};
export default DataLoaderRightPanelDropdown;
