# NodeIOSection Component Documentation

## Overview

`NodeIOSection` is a flexible, reusable React component designed for managing input/output configurations in flow nodes. It provides a consistent interface for rendering tree-structured input items with support for nested children (Lists and Objects), value references, and custom rendering.

This component was introduced as part of the input/output revamp to standardize how different node types (Start, End, Identity, API, Subflow) handle their inputs and outputs.

## Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Props API](#props-api)
- [Configuration Pattern](#configuration-pattern)
- [Working with useNodeInputItem Hook](#working-with-usenodeinputitem-hook)
- [Advanced Examples](#advanced-examples)
- [Type Definitions](#type-definitions)

## Installation

The component is located at:
```
src/modules/flow/components/ContextualPanel/shared/NodeIOSection.tsx
```

Import it along with its types:

```tsx
import NodeIOSection, { IOSectionConfig, IOSectionContext } from "@/modules/flow/components/ContextualPanel/shared/NodeIOSection";
```

## Basic Usage

### Simple Input Section

```tsx
import { NodeIOSection } from "@/modules/flow/components/ContextualPanel/shared/NodeIOSection";
import { useNodeInputItem } from "@/modules/flow/hooks/useNodeInputItem";
import { useAncestorValueOptions } from "@/modules/flow/hooks/useAncestorValueOptions";

export const MyNodeDetails = () => {
  const selectedNode = useSelectedNode();
  const valueOptions = useAncestorValueOptions(selectedNode?.id);
  
  const { treeRoots, ...handlers } = useNodeInputItem({
    inputs: selectedNode?.data.inputs,
    onChange: (next) => {
      // Handle input changes
      onChange(selectedNode.id, "inputs", next);
    },
  });

  return (
    <NodeIOSection
      title="Inputs"
      roots={treeRoots}
      valueOptions={valueOptions}
      handlers={handlers}
      selectedNode={selectedNode}
    />
  );
};
```

## Props API

### NodeIOSectionProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | `string` | ✅ | Section title displayed in the header |
| `roots` | `TreeInputItem[]` | ✅ | Array of root-level input items to render |
| `valueOptions` | `NonNullableOption[]` | ✅ | Available options for value selection (typically from ancestors) |
| `handlers` | `IOSectionHandlers` | ✅ | Event handlers for input interactions |
| `selectedNode` | `BaseSelectedNode` | ✅ | Currently selected node (with id, data, type) |
| `headerActions` | `(ctx: IOSectionContext) => ReactNode` | ❌ | Custom actions to render in section header |
| `loading` | `boolean` | ❌ | Shows loader when true |
| `renderItem` | `(node: TreeInputItem, ctx: IOSectionContext) => ReactNode` | ❌ | Custom renderer for each item |
| `getItemProps` | `(node: TreeInputItem, ctx: IOSectionContext) => Record<string, any>` | ❌ | Function to override default InputItem props |

### IOSectionHandlers

```tsx
interface IOSectionHandlers {
  onKeyChange?: (id: string, next: string) => void;
  onDescriptionChange?: (id: string, next: string) => void;
  onValueChange?: (id: string, next: NonNullableOption) => void;
  onTypeChange?: (id: string, next: string) => void;
  onAddBelow?: (id: string) => void;
  onAddChild?: (id: string) => void;
  onRemove?: (id: string) => void;
  handleAddInput?: (item: NonNullableOption) => void;
  [key: string]: unknown;
}
```

### IOSectionContext

The context object passed to `headerActions`, `renderItem`, and `getItemProps`:

```tsx
interface IOSectionContext<T extends BaseSelectedNode> {
  valueOptions: NonNullableOption[];
  handlers: IOSectionHandlers;
  selectedNode: Pick<T, "id" | "data" | "type">;
}
```

## Configuration Pattern

Use the `IOSectionConfig` type to define reusable configurations:

```tsx
import { IOSectionConfig } from "@/modules/flow/components/ContextualPanel/shared/NodeIOSection";
import { PlusIcon } from "@phosphor-icons/react";
import { SectionTitleButton } from "@/modules/flow/components/ContextualPanel/SectionTitle";

const inputsConfig: IOSectionConfig = {
  title: "Workflow Inputs",
  headerActions: ({ handlers: { handleAddInput } }) =>
    handleAddInput && (
      <SectionTitleButton onClick={() => handleAddInput({ label: "String", value: "String" })}>
        <PlusIcon />
      </SectionTitleButton>
    ),
  getItemProps: () => ({ 
    hidden: { value: true },
    showDescription: true 
  }),
};

// Use with spread operator
<NodeIOSection
  roots={treeRoots}
  valueOptions={valueOptions}
  handlers={handlers}
  selectedNode={selectedNode}
  {...inputsConfig}
/>
```

## Working with useNodeInputItem Hook

The `useNodeInputItem` hook manages the tree structure and provides all necessary handlers:

### Basic Setup

```tsx
import useNodeInputItem from "@/modules/flow/hooks/useNodeInputItem";

const { 
  treeRoots,           // Computed tree structure
  handleAddInput,      // Add new root-level input
  onKeyChange,         // Handle key/name changes
  onDescriptionChange, // Handle description changes
  onValueChange,       // Handle value changes
  onTypeChange,        // Handle type changes (String, List, Object, etc.)
  onAddBelow,          // Add sibling below current item
  onAddChild,          // Add child to collection types
  onRemove             // Remove item and its children
} = useNodeInputItem({
  inputs: selectedNode?.data.inputs,
  onChange: handleInputsChange,
  addTemporaryPlaceholder: true, // Shows empty placeholder row
});
```

### With Temporary Placeholder

The `addTemporaryPlaceholder` option adds an empty row that automatically converts to a real input when edited:

```tsx
const { treeRoots, ...handlers } = useNodeInputItem({
  inputs: selectedNode?.data.inputs,
  onChange: handleChange,
  addTemporaryPlaceholder: true, // ✨ Enables auto-placeholder
});
```

### Handling Nested Inputs

Collection types (List, Object, Dict) automatically support children:

```tsx
const onTypeChange = useCallback((id: string, type: string) => {
  // When type changes to List/Object, children array is created
  // When type changes from List/Object, all children are removed
  updateField(id, (draft) => {
    draft.type = type;
  });
}, []);
```

## Advanced Examples

### Example 1: Start Node with Outputs Synchronization

```tsx
import { useCallback } from "react";
import { NodeIOSection, IOSectionConfig } from "@/modules/flow/components/ContextualPanel/shared/NodeIOSection";
import { useNodeInputItem } from "@/modules/flow/hooks/useNodeInputItem";
import { useAncestorValueOptions } from "@/modules/flow/hooks/useAncestorValueOptions";

const config: IOSectionConfig = {
  title: "Workflow Inputs",
  headerActions: ({ handlers: { handleAddInput } }) =>
    handleAddInput && (
      <SectionTitleButton onClick={() => handleAddInput({ label: "String", value: "String" })}>
        <PlusIcon />
      </SectionTitleButton>
    ),
  getItemProps: () => ({ hidden: { value: true } }),
};

export const StartNodeDetails = () => {
  const onChange = useFlowStore((state) => state.onChange);
  const selectedNode = useSelectedNode<NodeVariant<"start">>();

  // Sync inputs with outputs
  const handleChange = useCallback(
    (next: NodeInputItem[]) => {
      if (!selectedNode) return;
      onChange(selectedNode.id, "inputs", next);
      
      // Create matching outputs
      const nextOutputs = next.map((i) => ({ 
        id: i.id, 
        key: i.key, 
        type: i.type || "String" 
      }));
      onChange(selectedNode.id, "outputs", nextOutputs);
    },
    [onChange, selectedNode]
  );

  const { treeRoots, handleAddInput, ...restHandlers } = useNodeInputItem({
    inputs: selectedNode?.data.inputs,
    onChange: handleChange,
    addTemporaryPlaceholder: true,
  });

  const valueOptions = useAncestorValueOptions(selectedNode?.id);

  if (!selectedNode) return null;

  return (
    <NodeIOSection
      roots={treeRoots}
      valueOptions={valueOptions}
      selectedNode={selectedNode}
      handlers={{ ...restHandlers, handleAddInput }}
      {...config}
    />
  );
};
```

### Example 2: API Agent with Multiple Sections

```tsx
import { useCallback, useMemo } from "react";
import NodeIOSection, { IOSectionConfig } from "@/modules/flow/components/ContextualPanel/shared/NodeIOSection";

const headersConfig: IOSectionConfig = {
  title: "Headers",
  headerActions: ({ handlers: { handleAddInput } }) => (
    <SectionTitleButton onClick={() => handleAddInput({ label: "String", value: "String" })}>
      <PlusIcon />
    </SectionTitleButton>
  ),
};

const paramsConfig: IOSectionConfig = {
  title: "Parameters",
  headerActions: ({ handlers: { handleAddInput } }) => (
    <SectionTitleButton onClick={() => handleAddInput({ label: "String", value: "String" })}>
      <PlusIcon />
    </SectionTitleButton>
  ),
};

function ApiAgent() {
  const selectedNode = useSelectedNode<NodeVariant<"agent", "APIAgent">>();
  const valueOptions = useAncestorValueOptions(selectedNode?.id);
  const onChange = useFlowStore((state) => state.onChange);

  // Separate handlers for headers
  const handleChangeHeaders = useCallback(
    (next: NodeInputItem[]) => {
      if (!selectedNode) return;
      onChange(selectedNode.id, "inputs.headers", next);
    },
    [onChange, selectedNode]
  );

  // Separate handlers for params
  const handleChangeParams = useCallback(
    (next: NodeInputItem[]) => {
      if (!selectedNode) return;
      onChange(selectedNode.id, "inputs.params", next);
    },
    [onChange, selectedNode]
  );

  const { treeRoots: headersTreeRoots, ...headersHandlers } = useNodeInputItem({
    inputs: selectedNode?.data.inputs.headers,
    onChange: handleChangeHeaders,
    addTemporaryPlaceholder: true,
  });

  const { treeRoots: paramsTreeRoots, ...paramsHandlers } = useNodeInputItem({
    inputs: selectedNode?.data.inputs.params,
    onChange: handleChangeParams,
    addTemporaryPlaceholder: true,
  });

  return (
    <>
      <NodeIOSection
        roots={headersTreeRoots}
        handlers={headersHandlers}
        valueOptions={valueOptions}
        selectedNode={selectedNode}
        {...headersConfig}
      />
      <NodeIOSection
        roots={paramsTreeRoots}
        handlers={paramsHandlers}
        valueOptions={valueOptions}
        selectedNode={selectedNode}
        {...paramsConfig}
      />
    </>
  );
}
```

### Example 3: Custom Item Rendering

```tsx
const config: IOSectionConfig = {
  title: "Custom Inputs",
  renderItem: (node, ctx) => (
    <div className="custom-input-wrapper">
      <span className="badge">{node.type}</span>
      <InputItem
        item={node}
        valueOptions={ctx.valueOptions}
        {...ctx.handlers}
      />
    </div>
  ),
};
```

### Example 4: Read-Only Mode with Custom Props

```tsx
const readOnlyConfig: IOSectionConfig = {
  title: "Subflow Inputs",
  getItemProps: (node) => ({
    readOnly: { 
      key: true,    // Can't edit key
      type: true,   // Can't edit type
      value: false  // Can edit value
    },
    hidden: {
      type: false,  // Show type
      key: false,   // Show key
      value: false  // Show value
    },
  }),
};
```

## Type Definitions

### NodeInputItem

The core data structure for input items:

```tsx
type NodeInputItem = {
  id: string;                          // Unique identifier
  key: string;                         // Field name/key
  type: string;                        // Data type (String, Number, List, Object, etc.)
  description?: string;                // Optional description
  value: {
    label: string;
    value: string;
    isReference?: boolean;             // Whether value references another node
  };
  required?: boolean;                  // Whether field is required
  parentId?: string;                   // Parent ID for nested items
  childrenIds?: string[];              // Child IDs for collection types
};
```

### TreeInputItem

Extended version with computed children array:

```tsx
interface TreeInputItem extends NodeInputItem {
  children?: TreeInputItem[];          // Computed children for rendering
  isPlaceholder?: boolean;             // Temporary placeholder flag
  isReference?: boolean;               // Reference to ancestor output
}
```

## Best Practices

### 1. Always Provide Value Options

```tsx
// ✅ Good - provides autocomplete from ancestors
const valueOptions = useAncestorValueOptions(selectedNode?.id);

<NodeIOSection
  valueOptions={valueOptions}
  {...otherProps}
/>

// ❌ Bad - no value suggestions
<NodeIOSection
  valueOptions={[]}
  {...otherProps}
/>
```

### 2. Use Configuration Objects

```tsx
// ✅ Good - reusable configuration
const config: IOSectionConfig = {
  title: "Inputs",
  headerActions: ({ handlers }) => <AddButton onClick={handlers.handleAddInput} />,
};

// ❌ Bad - inline props, harder to reuse
<NodeIOSection
  title="Inputs"
  headerActions={() => <AddButton />}
  {...otherProps}
/>
```

### 3. Handle Collection Types Properly

```tsx
// ✅ Good - type change automatically manages children
const { onTypeChange } = useNodeInputItem({
  inputs,
  onChange: handleChange,
});

// The hook automatically:
// - Creates childrenIds array when type becomes List/Object
// - Removes all children when type changes from List/Object
```

### 4. Synchronize Related Data

```tsx
// ✅ Good - keep inputs and outputs in sync
const handleChange = useCallback((next: NodeInputItem[]) => {
  onChange(selectedNode.id, "inputs", next);
  
  // Derive outputs from inputs
  const outputs = next.map(i => ({ 
    id: i.id, 
    key: i.key, 
    type: i.type 
  }));
  onChange(selectedNode.id, "outputs", outputs);
}, [onChange, selectedNode]);
```

### 5. Use Temporary Placeholders for Better UX

```tsx
// ✅ Good - shows empty row that converts to real input
const { treeRoots, ...handlers } = useNodeInputItem({
  inputs: selectedNode?.data.inputs,
  onChange: handleChange,
  addTemporaryPlaceholder: true, // Enables smooth input addition
});
```

## Migration from Legacy Hooks

If you're migrating from the old hooks (`useStartRightPanelInputs`, `useIdentityRightPanelInputs`, `useSubflowRightPanelInputs`), follow this pattern:

### Before (Legacy)

```tsx
import useStartRightPanelInputs from "@/modules/flow/hooks/useStartRightPanelInputs";

const { handleAddInput, onKeyChange, onValueChange, onOutputKeyChange } = useStartRightPanelInputs();

// Manual rendering of inputs
selectedNode.data.inputs.map(input => (
  <CustomInputComponent
    key={input.id}
    input={input}
    onKeyChange={onKeyChange}
    onValueChange={onValueChange}
  />
))
```

### After (New)

```tsx
import { NodeIOSection } from "@/modules/flow/components/ContextualPanel/shared/NodeIOSection";
import { useNodeInputItem } from "@/modules/flow/hooks/useNodeInputItem";

const { treeRoots, ...handlers } = useNodeInputItem({
  inputs: selectedNode?.data.inputs,
  onChange: handleChange,
  addTemporaryPlaceholder: true,
});

<NodeIOSection
  title="Inputs"
  roots={treeRoots}
  valueOptions={valueOptions}
  handlers={handlers}
  selectedNode={selectedNode}
/>
```

## Troubleshooting

### Issue: Children Not Rendering

**Problem**: Collection type (List/Object) items don't show children

**Solution**: Ensure the type matches the collection regex pattern:

```tsx
// These types support children:
- "List"
- "List of String"
- "Object"
- "Dict"

// This pattern is used internally:
const COLLECTION_REGEX = /^(List|List of|Object|Dict)/i;
```

### Issue: Values Not Updating

**Problem**: Changes to inputs don't persist

**Solution**: Ensure `onChange` callback properly updates the store:

```tsx
const handleChange = useCallback((next: NodeInputItem[]) => {
  if (!selectedNode) return;
  onChange(selectedNode.id, "inputs", next); // ✅ Must call store update
}, [onChange, selectedNode]);
```

### Issue: Placeholder Keeps Showing

**Problem**: Temporary placeholder remains after adding input

**Solution**: The placeholder is identified by ID. If it persists, check that the `onChange` callback is adding the input with a different ID:

```tsx
// The hook uses genId() internally to create unique IDs
// Ensure your onChange properly commits the new input
```

## Related Components

- **InputItem**: The individual input row component (`src/modules/flow/components/IO/InputItem.tsx`)
- **SectionContainer**: Wrapper for sections (`src/modules/flow/components/ContextualPanel/SectionContainer.tsx`)
- **SectionTitle**: Title component with actions (`src/modules/flow/components/ContextualPanel/SectionTitle.tsx`)

## Related Hooks

- **useNodeInputItem**: Core hook for managing input tree structure
- **useAncestorValueOptions**: Provides value options from ancestor nodes
- **useSelectedNode**: Gets currently selected node from flow store

---

**Version**: 1.0.0 (Input/Output Revamp PR #408)  
**Last Updated**: 2025-10-21
