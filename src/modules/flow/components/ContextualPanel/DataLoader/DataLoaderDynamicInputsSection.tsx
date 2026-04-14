import { useCallback } from "react";

import { TrashIcon } from "@phosphor-icons/react";

import { FileUpload } from "@/components/common/FileUpload";
import { AutocompleteTag, IconSelectTag } from "@/components/common/input-tags";
import { Button } from "@/components/ui/button";
import { HoverActions, HoverActionWrapper } from "@/components/ui/HoverActionWrapper";
import { InputTag, Option } from "@/components/ui/input-tag";
import { DataLoaderInputs } from "@/modules/flow/types";

interface InputChangeCallbacks {
  onInputKeyChange?: (id: string, label: string) => void;
  onInputValueChange?: (id: string, value: NonNullable<Option>) => void;
  onInputTypeChange?: (id: string, type: NonNullable<Option>) => void;
}

interface ModernInputRowProps extends InputChangeCallbacks {
  input: DataLoaderInputs;
  dropdownItems?: NonNullable<Option>[];
  handleRemoveInputOutput: (id: string) => void;
  placeholder?: string;
}

const InputRow = ({ input, onInputTypeChange, onInputKeyChange, handleRemoveInputOutput, placeholder }: ModernInputRowProps) => {
  const handleTypeChange = useCallback(
    (option: NonNullable<Option>) => {
      onInputTypeChange?.(input.id, option);
    },
    [input.id, onInputTypeChange]
  );

  const handleKeyChange = useCallback(
    (option: NonNullable<Option>) => {
      // Extract the value from the option object and pass it as a string
      onInputKeyChange?.(input.id, option.value);
    },
    [input.id, onInputKeyChange]
  );

  return (
    <HoverActionWrapper className="px-0 py-0.5 flex justify-between w-full items-center gap-1 mx-0 hover:bg-transparent has-[:focus]:bg-transparent has-[[data-state=open]]:bg-transparent">
      <InputTag.Root variant="flat">
        <IconSelectTag disabled selectedOption={input.type} onOptionChange={handleTypeChange} />
        <AutocompleteTag
          placeholder={placeholder}
          options={undefined}
          selectedOption={{
            label: input.key,
            value: input.key,
          }}
          onOptionChange={handleKeyChange}
        />
      </InputTag.Root>
      <HoverActions className="rounded-lg bg-transparent p-0 hover:bg-transparent border-none">
        <Button variant="ghost" className="size-7 hover:bg-destructive/10" onClick={() => handleRemoveInputOutput(input.id)}>
          <TrashIcon className="h-4 w-4" />
        </Button>
      </HoverActions>
    </HoverActionWrapper>
  );
};

interface InputRowListProps extends InputChangeCallbacks {
  inputs: DataLoaderInputs[];
  // dropdownItems?: NonNullable<Option>[];
  handleRemoveInputOutput: (id: string) => void;
  placeholder?: string;
}

export const DataLoaderInputRowList = ({
  inputs,
  onInputKeyChange,
  onInputValueChange,
  onInputTypeChange,
  handleRemoveInputOutput,
  placeholder,
}: InputRowListProps) => {
  const handleUploadSuccess = (fileNames: string[]) => {
    console.log(`Upload successful: ${fileNames.join(", ")}`);
  };

  const handleUploadError = (error: Error) => {
    console.error("Upload failed:", error.message);
  };

  return (
    <>
      {inputs.map((input) => (
        <div key={input.id} className="flex flex-col justify-center py-1">
          <div className="w-full flex justify-between items-center">
            <InputRow
              key={input.id}
              input={input}
              onInputKeyChange={onInputKeyChange}
              onInputTypeChange={onInputTypeChange}
              handleRemoveInputOutput={handleRemoveInputOutput}
              placeholder={placeholder}
            />
          </div>
          <div className="relative flex my-1 pl-[7px] gap-3 ml-1.5">
            <div className="self-stretch w-px bg-border" />
            <FileUpload
              className="min-w-0 py-1.5"
              key={input.id}
              input={input}
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
              onInputValueChange={onInputValueChange}
            />
          </div>
        </div>
      ))}
    </>
  );
};
