import { z } from "zod";

import { createContext, useContextSelector } from "use-context-selector";

interface EditableFieldContextValue {
  isEditing?: boolean;
  onEditingChange?: (isEditing: boolean) => void;
  onEditStart?: () => void;
  onEditEnd?: (value: string) => void;
  schema?: z.ZodType<string>;
  autoFocusOnEdit?: boolean;
  selectTextOnFocus?: boolean;
}

const EditableFieldContext = createContext<EditableFieldContextValue>({
  isEditing: false,
  onEditingChange: () => {},
  onEditStart: () => {},
  onEditEnd: () => {},
});

export const useEditableFieldContextSelector = <T,>(selector: (value: EditableFieldContextValue) => T): T => {
  const context = useContextSelector(EditableFieldContext, selector);
  if (context === undefined) {
    return {} as T;
  }
  return context;
};

export const EditableFieldProvider = EditableFieldContext.Provider;
