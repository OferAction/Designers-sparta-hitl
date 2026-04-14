import React from "react";

import { SubflowIcon } from "@/lib/icons";
import { NODE_CATEGORY_COLOR, NodeIconsMapping } from "@/constants";
import { cn } from "@/lib/utils";
import { Node } from "@/modules/flow/types";

type NodeCardProps = {
  node: Node["data"];
  dragged: boolean;
  searchTerm?: string;
  isSubflowNode?: boolean;
};

export const NodeCard: React.FC<NodeCardProps> = ({ node, dragged, searchTerm, isSubflowNode }) => {
  const Icon = NodeIconsMapping[node.name] || NodeIconsMapping["start"];
  const colorVar = NODE_CATEGORY_COLOR[node.name] || "var(--foreground)";
  // Function to highlight the matching part of the title
  const renderHighlightedTitle = () => {
    if (!searchTerm || !node.title) return isSubflowNode ? node.name : node.title;

    const title = isSubflowNode ? node.name : node.title;
    const index = title.toLowerCase().indexOf(searchTerm.toLowerCase());

    if (index === -1) return title;

    return (
      <>
        {title.substring(0, index)}
        <span className="bg-primary/20 text-primary font-medium">{title.substring(index, index + searchTerm.length)}</span>
        {title.substring(index + searchTerm.length)}
      </>
    );
  };

  return (
    <div className={cn("flex gap-1 h-fit items-center max-w-full")}>
      {dragged && (
        <div className=" opacity-100 absolute left-0 top-0 w-full h-full p-1 bg-muted">
          <div className="flex justify-center items-center w-full h-full custom-dashed rounded-md">
            <span className="text-sm leading-5 text-muted-foreground ">Drop on canvas to add</span>
          </div>
        </div>
      )}
      {isSubflowNode ? (
        <div className="bg-accent/50 size-6 flex items-center justify-center rounded-md">
          <SubflowIcon className="text-purple-foreground" />
        </div>
      ) : (
        <div className="bg-accent/50 size-6 flex items-center justify-center rounded-md">
          <Icon className="min-w-6 duration-[800ms] ease-in-out" style={{ color: `hsl(${colorVar})` }} />
        </div>
      )}
      <div className="flex flex-col justify-center gap-1 w-full">
        <p className="text-sm leading-5 font-normal text-foreground truncate">{renderHighlightedTitle()}</p>
      </div>
    </div>
  );
};
