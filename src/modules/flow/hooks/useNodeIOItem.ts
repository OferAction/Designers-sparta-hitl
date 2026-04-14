import { useCallback, useMemo, useRef } from "react";

import { produce } from "immer";

import { useStableCallback } from "@/hooks/useStableCallback";

import { NodeIOItem } from "../types/BaseNodeTypes";
import { NonNullableOption as Option } from "@/components/ui/input-tag";
import { genId } from "@/utils";

export interface TreeInputItem<T extends NodeIOItem = NodeIOItem> extends NodeIOItem {
  children?: TreeInputItem<T>[];
  isPlaceholder?: boolean;
  isReference?: boolean;
  value?: { label: string; value: string; isReference?: boolean };
}

const COLLECTION_REGEX = /^(List|List of|Object|Dict)/i;
const isCollectionType = (t: string, forceChildren: boolean) => forceChildren || COLLECTION_REGEX.test(t.trim());

// Child placeholder utilities using Map for stable IDs
const getOrCreateChildPlaceholderId = (parentId: string, placeholderIdsMap: Map<string, string>): string => {
  if (!placeholderIdsMap.has(parentId)) {
    placeholderIdsMap.set(parentId, genId());
  }
  return placeholderIdsMap.get(parentId)!;
};

const isChildPlaceholderId = (id: string, placeholderIdsMap: Map<string, string>): boolean => {
  return Array.from(placeholderIdsMap.values()).includes(id);
};

const extractParentIdFromPlaceholder = (placeholderId: string, placeholderIdsMap: Map<string, string>): string | undefined => {
  for (const [parentId, childPlaceholderId] of placeholderIdsMap.entries()) {
    if (childPlaceholderId === placeholderId) {
      return parentId;
    }
  }
  return undefined;
};

const shouldNodeHaveChildren = <T extends NodeIOItem>(node: TreeInputItem<T>, forceChildren: boolean) =>
  forceChildren || node.childrenIds !== undefined || isCollectionType(node.type, forceChildren);

const createChildPlaceholder = <T extends NodeIOItem>(
  parentId: string,
  parentType: string,
  placeholderIdsMap: Map<string, string>
): TreeInputItem<T> => {
  const isListType = /List/.test(parentType);
  return {
    id: getOrCreateChildPlaceholderId(parentId, placeholderIdsMap),
    key: isListType ? "0" : "",
    type: "String",
    description: "",
    value: { label: "", value: "" },
    required: true,
    parentId: parentId,
    isPlaceholder: true,
    children: [],
  } as TreeInputItem<T>;
};

const convertTreeItemToNodeIOItem = <T extends NodeIOItem>(item: TreeInputItem<T>): T => {
  const { children: _, isPlaceholder: __, ...rest } = item;
  return rest as T;
};

const findRecursively = <T extends NodeIOItem>(
  nodes: TreeInputItem<T>[],
  predicate: (node: TreeInputItem<T>) => boolean
): TreeInputItem<T> | null => {
  const stack = [...nodes];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (predicate(node)) return node;
    if (node.children) {
      stack.push(...node.children);
    }
  }
  return null;
};

export default function useNodeIOItem<T extends NodeIOItem = NodeIOItem>({
  items = [],
  onChange = () => {},
  addTemporaryPlaceholder = false,
  forceChildren = false,
  addTemporaryChildPlaceholdersDepth = 0,
  getPlaceholder: getPlaceholderOverride,
}: {
  items?: T[];
  onChange: (value: T[]) => void;
  addTemporaryPlaceholder?: boolean;
  forceChildren?: boolean;
  addTemporaryChildPlaceholdersDepth?: number;
  getPlaceholder?: (initialData: TreeInputItem<T>, items: T[]) => Partial<TreeInputItem<T>> | void;
}) {
  const placeholderId = useRef<string>(genId());
  const childPlaceholderIdsMap = useRef<Map<string, string>>(new Map());

  const getPlaceholderOverrideStable = useStableCallback(getPlaceholderOverride);

  const getPlaceholder = useCallback(
    (initialData: TreeInputItem<T>): TreeInputItem<T> => {
      if (getPlaceholderOverrideStable) {
        return { ...initialData, ...getPlaceholderOverrideStable(initialData, items) };
      }
      return initialData;
    },
    [getPlaceholderOverrideStable, items]
  );

  const treeRoots = useMemo<TreeInputItem<T>[]>(() => {
    if (!items.length) {
      if (addTemporaryPlaceholder) {
        return [
          getPlaceholder({
            id: placeholderId.current,
            key: "",
            type: "String",
            description: "",
            value: { label: "", value: "" },
            required: true,
            children: [],
            isPlaceholder: true,
          }),
        ];
      }
    }
    const map = new Map(items.map((inp) => [inp.id, { ...inp, children: [] as TreeInputItem<T>[] }]));

    items.forEach((inp) => {
      if (inp.childrenIds?.length) {
        const parent = map.get(inp.id);
        inp.childrenIds.forEach((cid) => {
          const child = map.get(cid);
          if (parent && child) {
            parent.children.push(child);
          }
        });
      }
    });

    const roots: TreeInputItem<T>[] = Array.from(map.values()).filter((n) => !n.parentId);

    // Add placeholder children to non-placeholder items that should have children but don't
    if (addTemporaryChildPlaceholdersDepth > 0) {
      const addPlaceholdersRecursively = (node: TreeInputItem<T>, currentDepth: number) => {
        if (currentDepth >= addTemporaryChildPlaceholdersDepth) return;

        if (shouldNodeHaveChildren(node, forceChildren)) {
          const placeholder = getPlaceholder(createChildPlaceholder<T>(node.id, node.type, childPlaceholderIdsMap.current));
          node.children = node.children || [];
          node.children.push(placeholder);

          // Recursively add placeholders to the newly created placeholder
          if (shouldNodeHaveChildren(placeholder, forceChildren)) {
            addPlaceholdersRecursively(placeholder, currentDepth + 1);
          }
        } else if (node.children) {
          // Also recurse into existing children
          node.children.forEach((child) => addPlaceholdersRecursively(child, currentDepth + 1));
        }
      };

      roots.forEach((node) => {
        addPlaceholdersRecursively(node, 0);
      });
    }

    if (addTemporaryPlaceholder) {
      const placeholderAlreadyCommitted = items.some((inp) => inp.id === placeholderId.current);
      if (!placeholderAlreadyCommitted) {
        roots.push(
          getPlaceholder({
            id: placeholderId.current,
            key: "",
            type: "String",
            description: "",
            value: { label: "", value: "" },
            required: true,
            children: [],
            isPlaceholder: true,
          })
        );
      }
    }
    return roots;
  }, [addTemporaryChildPlaceholdersDepth, addTemporaryPlaceholder, forceChildren, getPlaceholder, items]);

  const commit = useCallback(
    (next: T[]) => {
      onChange(next);
    },
    [onChange]
  );

  const convertPlaceholderToReal = useCallback((placeholderItem: TreeInputItem) => {
    const lastItemWithoutPlaceholder = convertTreeItemToNodeIOItem(placeholderItem);
    placeholderId.current = genId();
    return lastItemWithoutPlaceholder as any;
  }, []);

  const handleAddInput = useCallback(
    (item: Option) => {
      const newInput = {
        id: genId(),
        key: "",
        type: item.value,
        description: "",
        value: { label: "", value: "" },
        required: true,
        childrenIds: undefined,
      } as unknown as T;
      commit([...items, newInput]);
    },
    [commit, items]
  );

  const convertChildPlaceholderToReal = useCallback(
    (placeholderId: string, mutator: (draft: any) => void, typeOverride?: string) => {
      const parentId = extractParentIdFromPlaceholder(placeholderId, childPlaceholderIdsMap.current);
      if (!parentId) return;

      childPlaceholderIdsMap.current.set(parentId, genId());

      const child = findRecursively(treeRoots, (n) => n.id === placeholderId);

      if (!child || child.parentId !== parentId) return;
      const newChild = convertTreeItemToNodeIOItem(child);

      const next = produce(items, (draft) => {
        const parent = draft.find((d) => d.id === parentId);
        if (!parent) return;

        if (!parent.childrenIds) parent.childrenIds = [];
        newChild.type = typeOverride || newChild.type;

        parent.childrenIds.push(newChild.id);
        draft.push(newChild as any);
        mutator(newChild);
      });
      commit(next);
    },
    [treeRoots, items, commit]
  );

  const updateField = useCallback(
    (id: string, mutator: (draft: any) => void) => {
      // Check if this is a child placeholder
      if (isChildPlaceholderId(id, childPlaceholderIdsMap.current)) {
        convertChildPlaceholderToReal(id, mutator);
        return;
      }

      if (addTemporaryPlaceholder) {
        const lastItem = treeRoots.length > 0 ? treeRoots[treeRoots.length - 1] : null;
        if (lastItem?.isPlaceholder && lastItem.id === id) {
          const next = produce(items, (draft) => {
            const convertedPlaceholder = convertPlaceholderToReal(lastItem);
            draft.push(convertedPlaceholder);
            mutator(draft[draft.length - 1]);
          });
          commit(next);
          return;
        }
      }
      const next = produce(items, (draft) => {
        const target = draft.find((d) => d.id === id);
        if (target) mutator(target);
      });
      commit(next);
    },
    [addTemporaryPlaceholder, commit, convertChildPlaceholderToReal, convertPlaceholderToReal, items, treeRoots]
  );

  const onKeyChange = useCallback(
    (id: string, value: string) => {
      updateField(id, (d) => {
        d.key = value;
      });
    },
    [updateField]
  );

  const onDescriptionChange = useCallback(
    (id: string, value: string) => {
      updateField(id, (d) => {
        d.description = value;
      });
    },
    [updateField]
  );

  const onValueChange = useCallback(
    (id: string, option: Option) => {
      updateField(id, (d: T) => {
        if ("value" in d) {
          d.value = option;
        }
      });
    },
    [updateField]
  );

  const onOptionalToggle = useCallback(
    (id: string, required: boolean) => {
      updateField(id, (d) => {
        d.required = required;
      });
    },
    [updateField]
  );

  const onTypeChange = useCallback(
    (id: string, type: string) => {
      // Check if this is a child placeholder
      if (isChildPlaceholderId(id, childPlaceholderIdsMap.current)) {
        convertChildPlaceholderToReal(id, () => {}, type);
        return;
      }

      const next = produce(items, (draft) => {
        let target = draft.find((d) => d.id === id);
        if (!target) {
          if (!addTemporaryPlaceholder) return;
          const lastItem = treeRoots.length > 0 ? treeRoots[treeRoots.length - 1] : null;

          if (!lastItem?.isPlaceholder || lastItem.id !== id) return;
          const lastItemWithoutPlaceholder = convertPlaceholderToReal(lastItem);
          draft.push(lastItemWithoutPlaceholder as any);
          target = draft[draft.length - 1];
        }

        const wasCollection = isCollectionType(target.type, forceChildren);
        const willBeCollection = isCollectionType(type, forceChildren);
        target.type = type;
        if (willBeCollection && !target.childrenIds) target.childrenIds = [];
        if (!willBeCollection && wasCollection) {
          if (target.childrenIds?.length) {
            const removeIds = new Set<string>();
            const collect = (ids: string[]) => {
              ids.forEach((cid) => {
                removeIds.add(cid);
                const child = draft.find((x) => x.id === cid);
                if (child?.childrenIds?.length) collect(child.childrenIds);
              });
            };
            collect(target.childrenIds);
            for (let i = draft.length - 1; i >= 0; i--) if (removeIds.has(draft[i].id)) draft.splice(i, 1);
          }
          delete target.childrenIds;
        }
      });
      commit(next);
    },
    [addTemporaryPlaceholder, commit, convertChildPlaceholderToReal, convertPlaceholderToReal, forceChildren, items, treeRoots]
  );

  const onAddBelow = useCallback(
    (id: string) => {
      const index = items.findIndex((i) => i.id === id);
      if (index === -1) return;
      const ref = items[index];
      const parent = ref.parentId ? items.find((i) => i.id === ref.parentId) : null;
      if (ref.parentId && !parent) return;
      const newInput = {
        id: genId(),
        key: "",
        type: "String",
        description: "",
        value: { label: "", value: "" },
        required: true,
        parentId: ref.parentId,
        childrenIds: undefined,
      };
      const next = produce(items, (draft) => {
        if (ref.parentId && parent) {
          const parentIndex = draft.findIndex((i) => i.id === parent.id);
          if (parentIndex !== -1) {
            const draftParent = draft[parentIndex];
            draftParent.childrenIds = draftParent.childrenIds || [];
            const childIndex = draftParent.childrenIds!.indexOf(ref.id);
            draftParent.childrenIds.splice(childIndex === -1 ? draftParent.childrenIds.length : childIndex + 1, 0, newInput.id);
          }
        }
        draft.splice(index + 1, 0, newInput as any);
      });
      commit(next);
    },
    [commit, items]
  );

  const onAddChild = useCallback(
    (id: string) => {
      const next = produce(items, (draft) => {
        const parent = draft.find((d) => d.id === id);
        if (!parent) return;
        if (!parent.childrenIds) parent.childrenIds = [];
        const child = {
          id: genId(),
          key: /List/.test(parent.type) ? String(parent.childrenIds.length) : "",
          type: "String",
          description: "",
          value: { label: "", value: "" },
          required: true,
          parentId: parent.id,
          childrenIds: undefined,
        };
        parent.childrenIds.push(child.id);
        draft.push(child as any);
      });
      commit(next);
    },
    [commit, items]
  );

  const onRemove = useCallback(
    (id: string) => {
      const next = produce(items, (draft) => {
        const target = draft.find((d) => d.id === id);
        if (!target) return;
        if (target.parentId) {
          const parent = draft.find((d) => d.id === target.parentId);
          if (parent?.childrenIds) parent.childrenIds = parent.childrenIds.filter((cid) => cid !== id);
        }
        const toDelete = new Set<string>();
        const collect = (nodeId: string) => {
          const node = draft.find((n) => n.id === nodeId);
          if (!node) return;
          if (node.childrenIds?.length) node.childrenIds.forEach((cid) => collect(cid));
          toDelete.add(nodeId);
        };
        collect(id);
        for (let i = draft.length - 1; i >= 0; i--) if (toDelete.has(draft[i].id)) draft.splice(i, 1);
      });
      commit(next);
    },
    [commit, items]
  );

  return {
    treeRoots,
    handleAddInput,
    onKeyChange,
    onDescriptionChange,
    onValueChange,
    onTypeChange,
    onOptionalToggle,
    onAddBelow,
    onAddChild,
    onRemove,
  };
}
