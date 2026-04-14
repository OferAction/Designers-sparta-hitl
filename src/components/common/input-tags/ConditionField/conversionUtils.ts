import { SerializedEditorState, SerializedLexicalNode } from "lexical";

import { extractTypesFromEditorJSON } from "./utils";
import { Option } from "@/components/ui/input-tag";
import { DynamicFieldValue } from "@/modules/flow/components/IO";
import { SerializedVariableReferenceNode } from "@/modules/flow/components/IO/DynamicField/VariableReferenceNode";
import { ConditionValues } from "@/modules/flow/types";
import { genId } from "@/utils";

interface SerializedTextNode extends SerializedLexicalNode {
  type: "text";
  text: string;
}

interface SerializedParagraphNode extends SerializedLexicalNode {
  type: "paragraph";
  children: (SerializedTextNode | SerializedVariableReferenceNode)[];
}

interface SerializedRootNode extends SerializedLexicalNode {
  type: "root";
  children: SerializedParagraphNode[];
}

/**
 * Converts DynamicFieldValue to a string representation for conditions
 * Format: Uses {{var}} for variables and [[op]] for operators
 */
export function convertConditionToString(value: string | SerializedEditorState): string {
  const editorState: SerializedEditorState = typeof value === "string" ? JSON.parse(value) : value;

  const root = editorState.root as unknown as SerializedRootNode;
  const lines: string[] = [];

  for (const child of root.children) {
    if (child.type === "paragraph") {
      let lineText = "";

      for (const node of child.children) {
        if (node.type === "text") {
          lineText += (node as SerializedTextNode).text;
        } else if (node.type === "variableReference") {
          const varNode = node as SerializedVariableReferenceNode;
          // Check if it's an operator (has isOperator property) or variable (has isReference property)
          if ("isOperator" in varNode && varNode.isOperator) {
            lineText += `[[${varNode.value}]]`;
          } else {
            lineText += `{{${varNode.value}}}`;
          }
        }
      }

      lines.push(lineText);
    }
  }

  return lines.join("\n");
}

/**
 * Extracts all parts (variables, operators, text) from a condition value
 * Useful for getting structured data from the free-form input
 */
export function extractConditionParts(
  value: string | SerializedEditorState
): Array<{ type: "text" | "variable" | "operator"; value: string; label?: string; id?: string }> {
  const editorState: SerializedEditorState = typeof value === "string" ? JSON.parse(value) : value;

  const root = editorState.root as unknown as SerializedRootNode;
  const parts: Array<{ type: "text" | "variable" | "operator"; value: string; label?: string; id?: string }> = [];

  for (const child of root.children) {
    if (child.type === "paragraph") {
      for (const node of child.children) {
        if (node.type === "text") {
          const text = (node as SerializedTextNode).text;
          if (text.trim()) {
            parts.push({ type: "text", value: text });
          }
        } else if (node.type === "variableReference") {
          const varNode = node as SerializedVariableReferenceNode;
          // Check if it's an operator (has isOperator property) or variable (has isReference property)
          if ("isOperator" in varNode && varNode.isOperator) {
            parts.push({
              type: "operator",
              value: varNode.value,
              label: varNode.text,
            });
          } else {
            parts.push({
              type: "variable",
              value: varNode.value,
              label: varNode.text,
              id: varNode.id,
            });
          }
        }
      }
    }
  }

  return parts;
}

/**
 * Converts structured condition parts back to Option[] format
 * for backwards compatibility with existing code
 */
const FUNCTION_SET = new Set([
  "nofunction",
  "len",
  "empty",
  "notempty",
  "str",
  "int",
  "float",
  "bool",
  "type",
  "list",
  "dict",
  "set",
  "tuple",
  "isinstance",
]);

export function conditionPartsToOptions(value: string | SerializedEditorState): NonNullable<Option>[] {
  const parts = extractConditionParts(value);

  return parts.map((part) => {
    if (part.type === "variable") {
      return {
        id: part.id || genId(),
        value: part.value,
        label: part.label || part.value,
        type: "String", // Default type, you may want to resolve this from scope
        isReference: true,
      };
    } else if (part.type === "operator") {
      const lower = part.value.toLowerCase();
      const isFunction = FUNCTION_SET.has(part.value) || FUNCTION_SET.has(lower);
      return {
        id: part.id || genId(),
        value: part.value,
        label: part.label || part.value,
        type: isFunction ? ("function" as const) : ("logical-operator" as const),
      };
    } else {
      return {
        id: genId(),
        value: part.value,
        label: part.value,
        type: "String",
      };
    }
  });
}

/**
 * Checks if a condition value has any variable or operator references
 */
export function hasConditionReferences(value: string | SerializedEditorState): boolean {
  try {
    const parts = extractConditionParts(value);
    return parts.some((p) => p.type === "variable" || p.type === "operator");
  } catch {
    return false;
  }
}

/**
 * Converts editor state to ConditionValues array for storage
 * Compatible with both ConditionSection (FilterAgent) and ConditionalDetails
 */
export function editorStateToConditionValues(editorState: DynamicFieldValue): ConditionValues[] {
  if (!editorState) return [];

  try {
    const parts = extractConditionParts(editorState);
    const conditions: ConditionValues[] = [];

    // Extract types selection for isinstance handling
    const typesSelection = ((): string[] => {
      try {
        const json = typeof editorState === "string" ? JSON.parse(editorState) : editorState;
        return extractTypesFromEditorJSON(json);
      } catch {
        return [];
      }
    })();

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!part) continue;

      if (part.type === "operator") {
        const valLower = String(part.value).toLowerCase();
        const isFunction = FUNCTION_SET.has(part.value) || FUNCTION_SET.has(valLower);

        if (isFunction) {
          conditions.push({
            id: part.id || genId(),
            value: part.value,
            label: part.label || part.value,
            type: "function",
          });

          // Handle isinstance special case
          if (valLower === "isinstance") {
            // include the next input (variable or plain text) if present
            const next = parts[i + 1];
            if (next) {
              if (next.type === "variable") {
                conditions.push({
                  id: next.id || genId(),
                  value: next.value,
                  label: next.label || next.value,
                  type: "string",
                  isReference: true,
                });
                i++;
              } else if (next.type === "text") {
                const raw = String(next.value).trim();
                const isNum = /^-?\d+(?:\.\d+)?$/.test(raw);
                conditions.push({
                  id: genId(),
                  value: raw,
                  label: raw,
                  type: isNum ? "number" : "string",
                });
                i++;
              }
            }

            // Always include selected types (if any), even when previous input was plain text
            if (typesSelection.length) {
              const joined = typesSelection.join(",");
              conditions.push({
                id: genId(),
                value: joined,
                label: joined,
                type: "string",
              });
            }
          }
        } else {
          conditions.push({
            id: part.id || genId(),
            value: part.value,
            label: part.label || part.value,
            type: "logical-operator",
          });
        }
      } else if (part.type === "variable") {
        conditions.push({
          id: part.id || genId(),
          value: part.value,
          label: part.label || part.value,
          type: "string",
          isReference: true,
        });
      } else if (part.type === "text") {
        const raw = String(part.value).trim();
        const isNum = /^-?\d+(?:\.\d+)?$/.test(raw);
        conditions.push({
          id: genId(),
          value: raw,
          label: raw,
          type: isNum ? "number" : "string",
        });
      }
    }

    return conditions;
  } catch (error) {
    console.error("Error converting editor state to condition values:", error);
    return [];
  }
}
