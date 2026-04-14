import { nodeContentVariants, NodeVariantBorderProps } from "../GeneralNodes/CustomNodeVariants";
import { cn } from "@/utils";
export interface DynamicNodeProps {
  id: string;
  children?: React.ReactNode;
  nodeTypeWithState?: NodeVariantBorderProps;
  className?: string;
  ref?: React.RefObject<HTMLDivElement>;
}

const DynamicNodeContent: React.FC<DynamicNodeProps> = ({ ref, children, nodeTypeWithState, className = "" }) => {
  return (
    <div className={cn(nodeContentVariants(nodeTypeWithState), className)} ref={ref}>
      {children}
    </div>
  );
};

export default DynamicNodeContent;
