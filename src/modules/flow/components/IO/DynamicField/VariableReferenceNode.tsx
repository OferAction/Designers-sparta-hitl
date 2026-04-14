import React from "react";

import {
  $applyNodeReplacement,
  DecoratorNode,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical";

import VariableReferenceComponent from "./VariableReferenceComponent";
import { Option } from "@/components/ui/input-tag";

/** Node variant determines the type and styling of the reference */
export type ReferenceNodeVariant = "variable" | "operator" | "function";

export type SerializedVariableReferenceNode = Spread<
  {
    value: string;
    text?: string;
    id?: string;
    nodeVariant?: ReferenceNodeVariant;
  } & ({ isReference: true } | { isOperator: true }),
  SerializedLexicalNode
>;

function convertElement(domNode: HTMLElement): DOMConversionOutput | null {
  const isOperator = domNode.hasAttribute("data-operator-reference");
  const isVariable = domNode.hasAttribute("data-variable-reference");
  const isFunction = domNode.hasAttribute("data-function-reference");

  if (isOperator) {
    const value = domNode.getAttribute("data-operator-reference-value");
    const displayLabel = domNode.getAttribute("data-operator-reference-label");
    if (value !== null) {
      const node = $createVariableReferenceNode({ value, label: displayLabel || value }, undefined, "operator");
      return { node };
    }
  } else if (isFunction) {
    const value = domNode.getAttribute("data-function-reference-value");
    const displayLabel = domNode.getAttribute("data-function-reference-label");
    if (value !== null) {
      const node = $createVariableReferenceNode({ value, label: displayLabel || value }, undefined, "function");
      return { node };
    }
  } else if (isVariable) {
    const value = domNode.getAttribute("data-variable-reference-value");
    const displayLabel = domNode.getAttribute("data-variable-reference-label");
    if (value !== null) {
      const node = $createVariableReferenceNode({ value, label: displayLabel || value }, undefined, "variable");
      return { node };
    }
  }
  return null;
}

/**
 * Node for representing variable or operator references in the editor
 * - Variables: triggered by @ (e.g., @variableName)
 * - Operators: triggered by # (e.g., #and, #or, #==)
 */
export class VariableReferenceNode extends DecoratorNode<React.JSX.Element> {
  __value: string;
  __text?: string;
  __id?: string;
  __nodeVariant: ReferenceNodeVariant;
  __errorMessage?: string;

  static getType(): string {
    return "variableReference";
  }

  static clone(node: VariableReferenceNode): VariableReferenceNode {
    return new VariableReferenceNode(node.__value, node.__text, node.__id, node.__nodeVariant, node.__key, node.__errorMessage);
  }

  constructor(value: string, text?: string, id?: string, nodeVariant: ReferenceNodeVariant = "variable", key?: NodeKey, errorMessage?: string) {
    super(key);
    this.__value = value;
    this.__text = text;
    this.__id = id;
    this.__nodeVariant = nodeVariant;
    this.__errorMessage = errorMessage;
  }

  setErrorMessage(errorMessage?: string): void {
    const writable = this.getWritable();
    writable.__errorMessage = errorMessage;
  }

  createDOM(): HTMLElement {
    return document.createElement("span");
  }

  updateDOM(): boolean {
    return false;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("span");

    if (this.__nodeVariant === "operator") {
      element.setAttribute("data-operator-reference", "true");
      element.setAttribute("data-operator-reference-value", this.__value);
      if (this.__text) {
        element.setAttribute("data-operator-reference-label", this.__text);
      }
    } else if (this.__nodeVariant === "function") {
      element.setAttribute("data-function-reference", "true");
      element.setAttribute("data-function-reference-value", this.__value);
      if (this.__text) {
        element.setAttribute("data-function-reference-label", this.__text);
      }
    } else {
      element.setAttribute("data-variable-reference", "true");
      element.setAttribute("data-variable-reference-value", this.__value);
      if (this.__text) {
        element.setAttribute("data-variable-reference-label", this.__text);
      }
      if (this.__id) {
        element.setAttribute("data-variable-reference-id", this.__id);
      }
    }
    element.textContent = this.getTextContent();
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        const isOperator = domNode.hasAttribute("data-operator-reference");
        const isVariable = domNode.hasAttribute("data-variable-reference");
        if (!isOperator && !isVariable) {
          return null;
        }
        return {
          conversion: convertElement,
          priority: 1,
        };
      },
    };
  }

  static importJSON(serializedNode: SerializedVariableReferenceNode): VariableReferenceNode {
    const nodeVariant: ReferenceNodeVariant = serializedNode.nodeVariant
      ? serializedNode.nodeVariant
      : "isOperator" in serializedNode && serializedNode.isOperator
        ? "operator"
        : "variable";

    return $createVariableReferenceNode(
      { value: serializedNode.value, label: serializedNode.text || serializedNode.value, id: serializedNode.id },
      undefined,
      nodeVariant
    );
  }

  exportJSON(): SerializedVariableReferenceNode {
    const base = {
      value: this.__value,
      ...(this.__text ? { text: this.__text } : {}),
      ...(this.__id ? { id: this.__id } : {}),
      nodeVariant: this.__nodeVariant,
      type: "variableReference" as const,
      version: 1,
    };

    if (this.__nodeVariant === "operator") {
      return { ...base, isOperator: true as const };
    }
    if (this.__nodeVariant === "function") {
      return { ...base, nodeVariant: "function" as const, isOperator: true as const };
    }
    return { ...base, isReference: true as const };
  }

  getTextContent(): string {
    return this.__text || this.__value;
  }

  getValue(): string {
    const self = this.getLatest();
    return self.__value;
  }

  setValue(value: string) {
    const self = this.getWritable();
    self.__value = value;
  }

  getDisplayLabel(): string | undefined {
    const self = this.getLatest();
    return self.__text;
  }

  setDisplayLabel(text?: string) {
    const self = this.getWritable();
    self.__text = text;
  }

  getNodeVariant(): ReferenceNodeVariant {
    const self = this.getLatest();
    return self.__nodeVariant;
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): React.JSX.Element {
    return (
      <VariableReferenceComponent
        nodeKey={this.getKey()}
        value={this.__value}
        text={this.__text}
        id={this.__id}
        nodeVariant={this.__nodeVariant}
        errorMessage={this.__errorMessage}
      />
    );
  }
}

export function $createVariableReferenceNode(
  selectedOption: NonNullable<Option>,
  flatOptions?: Map<string, NonNullable<Option>>,
  nodeVariant: ReferenceNodeVariant = "variable"
): VariableReferenceNode {
  // split the value to get ids separated by dots
  let displayLabel = selectedOption.label;
  if (flatOptions && nodeVariant === "variable") {
    const ids = selectedOption.value.split(".");
    const labels: string[] = [];
    for (const id of ids) {
      const option = flatOptions.get(id);
      if (option) {
        labels.push(option.label);
      } else {
        labels.push(id);
      }
    }
    displayLabel = labels.join(".");
  }
  const node = new VariableReferenceNode(selectedOption.value, displayLabel, selectedOption.id, nodeVariant);
  return $applyNodeReplacement(node);
}

export function $isVariableReferenceNode(node: LexicalNode | null | undefined): node is VariableReferenceNode {
  return node instanceof VariableReferenceNode;
}
