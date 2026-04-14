import { useState } from "react";

import { PlusIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ConfigurableInputFieldProps {
  placeholder: string;
  items: string[];
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
  showAddButton?: boolean;
}

export const ConfigurableInputField = ({
  placeholder,
  items: _items,
  onAdd,
  onRemove: _onRemove,
  showAddButton = true,
}: ConfigurableInputFieldProps) => {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="bg-blue-accent/20 p-1">
      <div className="flex items-center gap-1">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          className="flex-1 h-10 text-sm bg-background border-border-blue"
          onClick={(e) => e.stopPropagation()}
        />
        {showAddButton && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-4 h-4 p-0 hover:bg-blue-accent/20"
            onClick={(e) => {
              e.stopPropagation();
              handleAdd();
            }}
            disabled={!inputValue.trim()}
          >
            <PlusIcon className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
