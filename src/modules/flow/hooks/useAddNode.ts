import { useGetConfigConverter } from "../services";
import { NodeTypes } from "@/modules/flow/types";
import { useFlowStore } from "@/store";

type CurriedAddNode = (type: NodeTypes, position: { x: number; y: number }, rest?: object) => string;

export const useAddNode = () => {
  const { data: nodeTemplates } = useGetConfigConverter();
  const addNodeStore = useFlowStore((state) => state.addNode);

  const addNode: CurriedAddNode = (type, position, rest = {}) => {
    if (!nodeTemplates) {
      throw new Error("Node templates are not available.");
    }
    return addNodeStore(type, position, nodeTemplates, rest);
  };

  return { addNode };
};
