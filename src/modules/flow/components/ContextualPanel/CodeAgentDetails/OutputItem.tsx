import { useMemo } from "react";

import { TrashIcon } from "@phosphor-icons/react";

import { AutocompleteTag, IconSelectTag } from "@/components/common/input-tags";
import { Button } from "@/components/ui/button";
import { HoverActions, HoverActionWrapper } from "@/components/ui/HoverActionWrapper";
import { InputTag } from "@/components/ui/input-tag";
import { NodeOutput } from "@/modules/flow/types";

interface OutputItemProps {
  output: NodeOutput;
  onKeyChange: (id: string, value: string) => void;
  onTypeChange: (id: string, type: string) => void;
  onRemove: (id: string) => void;
}

const OutputItem = ({ output, onKeyChange, onTypeChange, onRemove }: OutputItemProps) => {
  const selectedType = useMemo(() => ({ label: output.type, value: output.type }), [output.type]);
  const selectedOption = useMemo(() => ({ label: output.key, value: output.key }), [output.key]);

  return (
    <HoverActionWrapper className="py-1 flex items-center gap-1">
      <InputTag.Root>
        <IconSelectTag selectedOption={selectedType} onOptionChange={(type) => onTypeChange(output.id, type.value)} />
        <AutocompleteTag selectedOption={selectedOption} onOptionChange={(option) => onKeyChange(output.id, option.value)} />
      </InputTag.Root>
      <HoverActions>
        <Button variant="ghost" onClick={() => onRemove(output.id)}>
          <TrashIcon className="h-4 w-4" />
        </Button>
      </HoverActions>
    </HoverActionWrapper>
  );
};

export default OutputItem;
