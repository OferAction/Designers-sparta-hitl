import { SerializedEditorState, SerializedLexicalNode } from "lexical";

import { SerializedVariableReferenceNode } from "./VariableReferenceNode";
import { Option } from "@/components/ui/input-tag";

interface SerializedTextNode extends SerializedLexicalNode {
  type: "text";
  text: string;
  format?: number;
  style?: string;
  mode?: string;
  detail?: number;
}

interface SerializedParagraphNode extends SerializedLexicalNode {
  type: "paragraph";
  children: (SerializedTextNode | SerializedVariableReferenceNode)[];
  direction?: string | null;
  format?: string | number;
  indent?: number;
  textFormat?: number;
  textStyle?: string;
}

interface SerializedRootNode extends SerializedLexicalNode {
  type: "root";
  children: SerializedParagraphNode[];
  direction: "ltr" | "rtl" | null;
  format: string | number;
  indent: number;
}

/**
 * Validates if a variable reference matches the node_id.output_id pattern
 */
function isValidVariableReference(value: string): boolean {
  // Pattern: node_id.output_id (can have multiple parts separated by dots)
  // Examples: node_1.output, node_1.topic, input.field_name
  const pattern = /^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
  return pattern.test(value.trim());
}

/**
 * Finds an option by its value in the flattened options map
 */
function findOptionByValue(flatOptions: Map<string, NonNullable<Option>>, value: string): NonNullable<Option> | undefined {
  // Try direct match first
  if (flatOptions.has(value)) {
    return flatOptions.get(value);
  }

  // Try to find by matching the value property
  for (const [, option] of flatOptions) {
    if (option.value === value) {
      return option;
    }
  }

  return undefined;
}

/**
 * Generates display label for a variable reference by traversing the path
 */
function generateDisplayLabel(value: string, flatOptions: Map<string, NonNullable<Option>>): string {
  const ids = value.split(".");
  const labels: string[] = [];

  for (const id of ids) {
    const option = flatOptions.get(id);
    if (option) {
      labels.push(option.label);
    } else {
      labels.push(id);
    }
  }

  return labels.join(".");
}

/**
 * Converts a string with {{variable}} syntax to DynamicFieldValue (SerializedEditorState)
 *
 * @param input - String containing text and {{node_id.output_id}} variable references
 * @param scope - Array of options to resolve variable references against
 * @returns SerializedEditorState that can be used as DynamicFieldValue
 *
 * @example
 * ```ts
 * const input = "Hello {{node_1.name}}\nThis is {{node_2.topic}}";
 * const result = parseStringToDynamicFieldValue(input, scope);
 * // Returns Lexical editor state with text nodes and variable reference nodes
 * ```
 *
 * Rules:
 * - Malformed {{}} syntax is treated as literal text
 * - Variables must match node_id.output_id pattern, otherwise treated as text
 * - Variables not in scope will still create reference nodes but with raw value as display text
 * - Newlines create separate paragraph nodes
 */
export function parseStringToDynamicFieldValue(input: string, flatOptions: Map<string, NonNullable<Option>> = new Map()): SerializedEditorState {
  // Split by newlines first to create separate paragraphs
  const lines = input.split("\n");
  const paragraphs: SerializedParagraphNode[] = [];

  for (const line of lines) {
    const paragraphChildren: (SerializedTextNode | SerializedVariableReferenceNode)[] = [];

    // Regex to match well-formed {{variable}} patterns
    // This regex ensures we only match complete, properly closed braces
    const regex = /\{\{([^{}]+?)\}\}/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(line)) !== null) {
      const fullMatch = match[0];
      const variablePath = match[1];
      const offset = match.index;

      // Add text before the variable
      if (offset > lastIndex) {
        const text = line.slice(lastIndex, offset);
        if (text) {
          paragraphChildren.push({
            type: "text",
            text: text,
            version: 1,
          });
        }
      }

      // Validate the variable reference format
      const trimmedPath = variablePath.trim();
      const option = findOptionByValue(flatOptions, trimmedPath);
      if (option) {
        // Create variable reference node
        const displayLabel = option ? generateDisplayLabel(trimmedPath, flatOptions) : trimmedPath;

        paragraphChildren.push({
          type: "variableReference",
          value: trimmedPath,
          text: displayLabel,
          id: option?.id,
          isReference: true,
          version: 1,
        });
      } else {
        // Invalid format - treat as literal text
        paragraphChildren.push({
          type: "text",
          text: fullMatch,
          version: 1,
        });
      }

      lastIndex = offset + fullMatch.length;
    }

    // Add remaining text after the last match
    if (lastIndex < line.length) {
      const text = line.slice(lastIndex);
      paragraphChildren.push({
        type: "text",
        text: text,
        version: 1,
      });
    }

    // If line is empty, add an empty text node
    if (paragraphChildren.length === 0) {
      paragraphChildren.push({
        type: "text",
        text: "",
        version: 1,
      });
    }

    // Create paragraph node
    paragraphs.push({
      type: "paragraph",
      children: paragraphChildren,
      direction: null,
      format: "",
      indent: 0,
      version: 1,
    });
  }

  // Create the SerializedEditorState structure
  const editorState: SerializedEditorState = {
    root: {
      type: "root",
      children: paragraphs,
      direction: null,
      format: "",
      indent: 0,
      version: 1,
    },
  };

  return editorState;
}

/**
 * Converts a DynamicFieldValue (SerializedEditorState) back to a string with {{variable}} syntax
 *
 * @param value - SerializedEditorState or JSON string representation
 * @returns String with text and {{node_id.output_id}} variable references
 *
 * @example
 * ```ts
 * const editorState = { root: { children: [...] } };
 * const result = convertDynamicFieldValueToString(editorState);
 * // Returns: "Hello {{node_1.name}}\nThis is {{node_2.topic}}"
 * ```
 *
 * This allows users to easily copy the text with variable references in a readable format
 */
export function convertDynamicFieldValueToString(value: string | SerializedEditorState): string {
  // Parse if it's a string
  const editorState: SerializedEditorState = typeof value === "string" ? JSON.parse(value) : value;

  const root = editorState.root as SerializedRootNode;
  const lines: string[] = [];

  for (const child of root.children) {
    if (child.type === "paragraph") {
      let lineText = "";

      for (const node of child.children) {
        if (node.type === "text") {
          lineText += (node as SerializedTextNode).text;
        } else if (node.type === "variableReference") {
          const varNode = node as SerializedVariableReferenceNode;
          lineText += `{{${varNode.value}}}`;
        }
      }

      lines.push(lineText);
    }
  }

  return lines.join("\n");
}

/**
 * Checks if a string contains any variable references in {{variable}} format
 */
export function hasVariableReferences(input: string): boolean {
  const regex = /\{\{([^{}]+?)\}\}/g;
  return regex.test(input);
}

/**
 * Extracts all variable references from a string
 *
 * @param input - String that may contain {{variable}} references
 * @returns Array of variable paths found in the string
 */
export function extractVariableReferences(input: string): string[] {
  const regex = /\{\{([^{}]+?)\}\}/g;
  const variables: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    const variablePath = match[1].trim();
    if (isValidVariableReference(variablePath)) {
      variables.push(variablePath);
    }
  }

  return variables;
}
