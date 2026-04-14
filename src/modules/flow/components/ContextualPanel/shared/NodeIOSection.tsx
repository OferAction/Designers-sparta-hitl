import { ReactNode } from "react";

import { Loader } from "@/components/common/Loader";
import { NonNullableOption } from "@/components/ui/input-tag";
import { SectionContainer } from "@/modules/flow/components/ContextualPanel/SectionContainer";
import { SectionTitle } from "@/modules/flow/components/ContextualPanel/SectionTitle";
import { InputItem } from "@/modules/flow/components/IO";
import type { InputItemProps } from "@/modules/flow/components/IO";
import { TreeInputItem } from "@/modules/flow/hooks";
import { BaseNode, NodeIOItem } from "@/modules/flow/types";

type BaseSelectedNode = Pick<BaseNode, "id" | "data" | "type">;
export interface IOSectionHandlers
  extends Pick<
    InputItemProps,
    "onKeyChange" | "onDescriptionChange" | "onValueChange" | "onTypeChange" | "onOptionalToggle" | "onAddBelow" | "onAddChild" | "onRemove"
  > {
  handleAddInput?: (item: NonNullableOption) => void;
  [key: string]: unknown;
}

export interface IOSectionContext<T extends BaseSelectedNode = BaseSelectedNode> {
  valueOptions?: NonNullableOption[];
  handlers: IOSectionHandlers;
  selectedNode: Pick<T, "id" | "data" | "type">;
  flatItems?: NodeIOItem[];
  treeRoots: TreeInputItem[];
}

export type IOSectionGetItemPropsResult = Record<string, any>;

export interface NodeIOSectionProps<T extends BaseSelectedNode = BaseSelectedNode> {
  title: string;
  tooltip?: string;
  roots: TreeInputItem[];
  valueOptions?: NonNullableOption[];
  handlers: IOSectionHandlers;
  selectedNode: T;
  flatItems?: NodeIOItem[];
  headerActions?: (ctx: IOSectionContext<T>) => ReactNode;
  loading?: boolean;
  renderItem?: (node: TreeInputItem, ctx: IOSectionContext<T>) => ReactNode;
  getItemProps?: (node: TreeInputItem, ctx: IOSectionContext<T>) => IOSectionGetItemPropsResult;
}

export interface IOSectionConfig {
  title: string;
  headerActions?: (ctx: IOSectionContext) => ReactNode;
  renderItem?: (node: TreeInputItem, ctx: IOSectionContext) => ReactNode;
  getItemProps?: (node: TreeInputItem, ctx: IOSectionContext) => Record<string, any>;
}

interface IOItemRendererProps<T extends BaseSelectedNode = BaseSelectedNode> {
  node: TreeInputItem;
  ctx: IOSectionContext<T>;
  renderItem?: (node: TreeInputItem, ctx: IOSectionContext<T>) => ReactNode;
  getItemProps?: (node: TreeInputItem, ctx: IOSectionContext<T>) => IOSectionGetItemPropsResult;
}

const IOItemRenderer = <T extends BaseSelectedNode = BaseSelectedNode>({ node, ctx, renderItem, getItemProps }: IOItemRendererProps<T>) => {
  if (renderItem) {
    return <span>{renderItem(node, ctx)}</span>;
  }

  const { valueOptions, handlers } = ctx;
  const overrides = getItemProps?.(node, ctx) || {};
  const baseProps = {
    item: node,
    valueOptions,
    onKeyChange: handlers.onKeyChange,
    onDescriptionChange: handlers.onDescriptionChange,
    onValueChange: handlers.onValueChange,
    onTypeChange: handlers.onTypeChange,
    onAddBelow: handlers.onAddBelow,
    onAddChild: handlers.onAddChild,
    onRemove: handlers.onRemove,
    onOptionalToggle: handlers.onOptionalToggle,
    getItemProps: (childItem: TreeInputItem) => getItemProps?.(childItem, ctx) || {},
  };

  const finalProps = { ...baseProps, ...overrides };
  return <InputItem {...finalProps} />;
};

export const NodeIOSection = <T extends BaseSelectedNode = BaseSelectedNode>({
  title,
  tooltip,
  roots,
  valueOptions,
  handlers,
  selectedNode,
  headerActions,
  loading,
  renderItem,
  getItemProps,
  flatItems,
}: NodeIOSectionProps<T>) => {
  const ctx: IOSectionContext<T> = {
    valueOptions,
    handlers,
    selectedNode,
    treeRoots: roots,
    flatItems,
  };

  return (
    <SectionContainer>
      <SectionTitle title={title} tooltip={tooltip}>{headerActions?.(ctx)}</SectionTitle>
      {loading ? (
        <div className="py-2">
          <Loader />
        </div>
      ) : (
        <div className="flex flex-col gap-1 py-1">
          {roots.map((n) => (
            <IOItemRenderer key={n.id} node={n} ctx={ctx} renderItem={renderItem} getItemProps={getItemProps} />
          ))}
        </div>
      )}
    </SectionContainer>
  );
};

export default NodeIOSection;
