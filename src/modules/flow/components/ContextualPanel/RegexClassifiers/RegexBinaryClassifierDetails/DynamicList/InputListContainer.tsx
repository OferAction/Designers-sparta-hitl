import { useMemo } from "react";

import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { produce, castDraft } from "immer";

import { Button } from "@/components/ui/button";
import { genId } from "@/utils";

interface InputListContainerProps<T> {
  value: { id: string; value: T }[];
  onChange: (value: { id: string; value: T }[]) => void;
  renderItem: (value: T, onChange: (newValue: T) => void, id: string, index: number) => React.ReactNode;
  defaultValue?: T;
}

function InputListContainer<T>({ value, onChange, renderItem, defaultValue }: InputListContainerProps<T>) {
  const items = useMemo(() => {
    if (!value || value.length === 0) return [{ id: genId(), value: (defaultValue ?? "") as T }];
    return value;
  }, [value, defaultValue]);

  const updateItem = (id: string, newValue: T) => {
    const updated = produce(items, (draft) => {
      const index = draft.findIndex((item) => item.id === id);
      if (index !== -1) {
        draft[index] = { id, value: castDraft(newValue) };
      }
    });
    onChange(updated);
  };

  const addItem = () => {
    const newItems = [...items, { id: genId(), value: (defaultValue ?? "") as T }];
    onChange(newItems);
  };

  const removeItem = (id: string) => {
    const updated = produce(items, (draft) => {
      const index = draft.findIndex((item) => item.id === id);
      if (index !== -1) {
        draft.splice(index, 1);
      }
    });
    onChange(updated);
  };

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, index) => (
        <div key={item.id} className="flex items-center gap-2">
          {renderItem(item.value, (newValue) => updateItem(item.id, newValue), item.id, index)}
          {index === items.length - 1 ? (
            <Button variant="ghost" size="icon" className="p-3 size-10 rounded-md bg-secondary hover:bg-slate-800/50 flex-shrink-0" onClick={addItem}>
              <PlusIcon className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="p-3 size-10 rounded-md bg-secondary hover:bg-slate-800/50 flex-shrink-0"
              onClick={() => removeItem(item.id)}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}

export default InputListContainer;
