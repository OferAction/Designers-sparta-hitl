import { createContext, useCallback, useContext, useState } from "react";

import { XYPosition } from "@xyflow/react";
import { NodeKey } from "lexical";

import { ReferenceNodeVariant } from "./VariableReferenceNode";

export type EditingNodeState = {
  nodeKey: NodeKey;
  value: string;
  text?: string;
  id?: string;
  nodeVariant: ReferenceNodeVariant;
  position: XYPosition;
} | null;

type EditVariableReferenceContextType = {
  editingNode: EditingNodeState;
  startEditing: (state: NonNullable<EditingNodeState>) => void;
  stopEditing: () => void;
};

const EditVariableReferenceContext = createContext<EditVariableReferenceContextType | null>(null);

export const EditVariableReferenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [editingNode, setEditingNode] = useState<EditingNodeState>(null);

  const startEditing = useCallback((state: NonNullable<EditingNodeState>) => {
    setEditingNode(state);
  }, []);

  const stopEditing = () => setEditingNode(null);

  return <EditVariableReferenceContext.Provider value={{ editingNode, startEditing, stopEditing }}>{children}</EditVariableReferenceContext.Provider>;
};

export const useEditVariableReference = () => {
  const context = useContext(EditVariableReferenceContext);
  if (!context) {
    throw new Error("useEditVariableReference must be used within an EditVariableReferenceProvider");
  }
  return context;
};

export const useEditVariableReferenceOptional = () => {
  return useContext(EditVariableReferenceContext);
};
