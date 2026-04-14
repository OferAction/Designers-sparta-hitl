import * as React from "react";
import { FC, useCallback, useEffect, useRef, useState } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $applyNodeReplacement,
  $getNodeByKey,
  DecoratorNode,
  EditorConfig,
  LexicalEditor,
  NodeKey,
  SerializedLexicalNode,
  Spread,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  COMMAND_PRIORITY_HIGH,
} from "lexical";

import { InputTag } from "@/components/ui/input-tag";
import type { MultiSelectOption } from "@/components/ui/multi-select";
import MultiSelectMenu from "@/components/ui/multi-select-menu";
import { TYPE_OPTIONS as FILTER_TYPE_OPTIONS } from "@/modules/flow/components/ContextualPanel/FilterAgent/types";

export type SerializedTypesSelectionNode = Spread<
  {
    types: string[];
  },
  SerializedLexicalNode
>;

const MENU_OPTIONS: MultiSelectOption[] = FILTER_TYPE_OPTIONS.map((t) => ({ label: t.label, value: t.value }));

export class TypesSelectionNode extends DecoratorNode<React.JSX.Element> {
  __types: string[];

  static getType(): string {
    return "typesSelection";
  }

  static clone(node: TypesSelectionNode): TypesSelectionNode {
    return new TypesSelectionNode([...node.__types], node.__key);
  }

  constructor(types: string[] = [], key?: NodeKey) {
    super(key);
    this.__types = types;
  }

  createDOM(): HTMLElement {
    return document.createElement("span");
  }

  updateDOM(): boolean {
    return false;
  }

  exportJSON(): SerializedTypesSelectionNode {
    return {
      type: "typesSelection",
      version: 1,
      types: this.__types,
    };
  }

  static importJSON(serializedNode: SerializedTypesSelectionNode): TypesSelectionNode {
    return $createTypesSelectionNode(serializedNode.types || []);
  }

  getTypes(): string[] {
    const self = this.getLatest();
    return self.__types;
  }

  setTypes(next: string[]): void {
    const self = this.getWritable();
    self.__types = next;
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): React.JSX.Element {
    return <TypesSelectionComponent nodeKey={this.getKey()} types={this.__types} />;
  }
}

export function $createTypesSelectionNode(types: string[] = []): TypesSelectionNode {
  const node = new TypesSelectionNode(types);
  return $applyNodeReplacement(node);
}

type ComponentProps = { nodeKey: NodeKey; types: string[] };

const TypesSelectionComponent: FC<ComponentProps> = ({ nodeKey, types }) => {
  const [editor] = useLexicalComposerContext();
  const [menuOpen, setMenuOpen] = useState(types.length === 0);
  const containerRef = useRef<HTMLSpanElement | null>(null);

  // Prevent backspace from deleting the node when menu is open
  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Backspace") {
        e.preventDefault();
        e.stopPropagation();

        // Remove last type or close menu if no types
        editor.update(() => {
          const node = $getNodeByKey(nodeKey);
          if (node instanceof TypesSelectionNode) {
            const currentTypes = node.getTypes();
            if (currentTypes.length > 0) {
              node.setTypes(currentTypes.slice(0, -1));
            } else {
              setMenuOpen(false);
              node.remove();
            }
          }
        });
      } else if (e.key === "Delete") {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [menuOpen, editor, nodeKey]);

  useEffect(() => {
    const isFocusInside = () => {
      const el = containerRef.current;
      const active = document.activeElement;
      return !!el && !!active && el.contains(active);
    };

    const unregisterBackspace = editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      (_event) => {
        if (isFocusInside()) {
          editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if (node instanceof TypesSelectionNode) {
              const currentTypes = node.getTypes();
              if (currentTypes.length > 0) {
                node.setTypes(currentTypes.slice(0, -1));
              } else {
                node.remove();
              }
            }
          });
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH
    );

    const unregisterDelete = editor.registerCommand(
      KEY_DELETE_COMMAND,
      (_event) => {
        if (isFocusInside()) {
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH
    );

    return () => {
      unregisterBackspace();
      unregisterDelete();
    };
  }, [editor, nodeKey]);

  const onValueChange = useCallback(
    (next: string[]) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if (node instanceof TypesSelectionNode) {
          node.setTypes(next);
        }
      });
    },
    [nodeKey, editor]
  );

  return (
    <span ref={containerRef} className="inline-flex items-center align-middle ml-1" contentEditable={false}>
      <InputTag.Root>
        <InputTag.List dropdownProps={{ open: menuOpen, onOpenChange: () => setMenuOpen(!menuOpen) }}>
          <InputTag.Trigger className="min-h-6 inline-flex items-center px-1" placeholder={types.length ? undefined : "select types"}>
            {types.length ? (
              <span className="inline-flex gap-1 items-center">
                {types.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-xs">
                    {t}
                  </span>
                ))}
              </span>
            ) : null}
          </InputTag.Trigger>
          <InputTag.Content>
            <MultiSelectMenu options={MENU_OPTIONS} value={types} onValueChange={onValueChange} />
          </InputTag.Content>
        </InputTag.List>
      </InputTag.Root>
    </span>
  );
};
