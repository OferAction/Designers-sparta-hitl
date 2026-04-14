import { $applyNodeReplacement, DecoratorNode } from "lexical";

import type { DOMConversionMap, DOMExportOutput, EditorConfig, LexicalNode, NodeKey, SerializedLexicalNode } from "lexical";

export type PlaceholderType = "add-operator" | "select-or-type";

export type SerializedPlaceholderNode = SerializedLexicalNode & {
  type: "conditionPlaceholder";
  version: 1;
  placeholderType: PlaceholderType;
};

function PlaceholderComponent({ type }: { type: PlaceholderType }) {
  const text = type === "add-operator" ? "# Add operator..." : "@ Select or type...";

  return (
    <span className="text-muted-foreground/50 text-sm pointer-events-none select-none ml-1" contentEditable={false} suppressContentEditableWarning>
      {text}
    </span>
  );
}

export class PlaceholderNode extends DecoratorNode<JSX.Element> {
  __placeholderType: PlaceholderType;

  static getType(): string {
    return "conditionPlaceholder";
  }

  static clone(node: PlaceholderNode): PlaceholderNode {
    return new PlaceholderNode(node.__placeholderType, node.__key);
  }

  constructor(placeholderType: PlaceholderType, key?: NodeKey) {
    super(key);
    this.__placeholderType = placeholderType;
  }

  // --- DOM ---
  createDOM(_config: EditorConfig): HTMLElement {
    // Keep DOM minimal and stable; styling should come from decorate() or CSS class.
    const span = document.createElement("span");
    span.className = "lexical-condition-placeholder";
    // Avoid inline styles when possible; but if you want the hard guarantee:
    span.style.userSelect = "none";
    return span;
  }

  updateDOM(): boolean {
    // Returning false keeps the wrapper DOM stable; React updates happen within.
    return false;
  }

  exportDOM(): DOMExportOutput {
    // Useful for copy/paste and HTML export.
    const element = document.createElement("span");
    element.setAttribute("data-lexical-condition-placeholder", this.__placeholderType);
    element.textContent = ""; // keep empty; the visible UI is for the editor
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    // Optional: restore placeholder from pasted/exported HTML
    return {
      span: (domNode: Node) => {
        if (!(domNode instanceof HTMLElement)) return null;
        const type = domNode.getAttribute("data-lexical-condition-placeholder") as PlaceholderType | null;
        if (!type) return null;

        return {
          conversion: () => ({ node: $createPlaceholderNode(type) }),
          priority: 1,
        };
      },
    };
  }

  // --- behavior ---
  isInline(): boolean {
    return true;
  }

  // In many editors, marking decorator nodes isolated prevents strange cursor interactions.
  // If you *want* the cursor to move "through" it like text, keep this false.
  isIsolated(): boolean {
    return true;
  }

  canInsertTextBefore(): boolean {
    return true;
  }

  canInsertTextAfter(): boolean {
    return false;
  }

  getTextContent(): string {
    // Keeps it out of plain-text extraction and prevents affecting search.
    return "";
  }

  // --- serialization ---
  exportJSON(): SerializedPlaceholderNode {
    return {
      type: "conditionPlaceholder",
      version: 1,
      placeholderType: this.__placeholderType,
    };
  }

  static importJSON(serializedNode: SerializedPlaceholderNode): PlaceholderNode {
    return $createPlaceholderNode(serializedNode.placeholderType);
  }

  // --- accessors ---
  getPlaceholderType(): PlaceholderType {
    return this.getLatest().__placeholderType;
  }

  setPlaceholderType(type: PlaceholderType): void {
    this.getWritable().__placeholderType = type;
  }

  decorate(): JSX.Element {
    return <PlaceholderComponent type={this.__placeholderType} />;
  }
}

export function $createPlaceholderNode(type: PlaceholderType): PlaceholderNode {
  return $applyNodeReplacement(new PlaceholderNode(type));
}

export function $isPlaceholderNode(node: LexicalNode | null | undefined): node is PlaceholderNode {
  return node instanceof PlaceholderNode;
}
