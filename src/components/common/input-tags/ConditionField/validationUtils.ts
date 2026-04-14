import { SerializedEditorState } from "lexical";

import {
  PAREN_MAP,
  LOGICAL_OPERATORS,
  UNARY_OPERATORS,
  FUNCTION_SET,
  EQUALITY_OPERATORS,
  COMPARISON_OPERATORS,
  Part,
  ValidationError,
  ValidationResult,
  FUNCTION_RETURN_TYPES,
} from "./constants";
import { extractConditionParts } from "./conversionUtils";
import { Node } from "@/modules/flow/types";

import { getNodeOutputFromReferenceId } from "@/modules/flow/utils/getNodeOutputFromReferenceId";

/** Helpers */
const lower = (s: string) => s.toLowerCase();

function isOpenParen(p?: Part) {
  return Object.keys(PAREN_MAP).includes(p?.value?.slice(0, 1) || "");
}
function isCloseParen(p?: Part) {
  return Object.values(PAREN_MAP).includes(p?.value || "") || Object.values(PAREN_MAP).includes(p?.value?.slice(0, 1) || "");
}
function isLogical(p?: Part) {
  return p?.type === "operator" && LOGICAL_OPERATORS.has(lower(p.value));
}
function isUnary(p?: Part) {
  return p?.type === "operator" && UNARY_OPERATORS.has(lower(p.value));
}
function isFunctionToken(p?: Part) {
  if (!p || p.type !== "operator") return false;
  return FUNCTION_SET.has(p.value) || FUNCTION_SET.has(lower(p.value));
}
function isValue(p?: Part) {
  return !!p && (p.type === "variable" || p.type === "text" || isFunctionToken(p));
}
function isBinaryOp(p?: Part) {
  if (!p || p.type !== "operator") return false;
  const v = p.value;
  return EQUALITY_OPERATORS.has(v) || COMPARISON_OPERATORS.has(v) || LOGICAL_OPERATORS.has(lower(v));
}
function extractParenGroups(parts: Part[]) {
  const text = parts.map((p) => p.value).join(" ");
  const result: string[] = [];

  // Track all types of parentheses with their positions and types
  const stack: Array<{ pos: number; char: string }> = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    // Check if it's an opening character
    if (PAREN_MAP[char]) {
      stack.push({ pos: i, char });
    }
    // Check if it's a closing character
    else if (Object.values(PAREN_MAP).includes(char)) {
      // Find matching opening character
      let found = false;
      for (let j = stack.length - 1; j >= 0; j--) {
        if (PAREN_MAP[stack[j].char] === char) {
          const start = stack[j].pos;
          result.push(text.slice(start, i + 1));
          stack.splice(j, 1);
          found = true;
          break;
        }
      }

      // If no matching opening found, it's an unbalanced closing
      if (!found) {
        return [text.slice(i, i + 1)];
      }
    }
  }

  // If there are remaining unclosed parentheses
  if (stack.length > 0) {
    const last = stack[stack.length - 1];
    return [text.slice(last.pos, text.length)];
  }

  return result;
}

/**
 * Gets the type of a value from condition parts
 */
function getValueType(part: Part, getNode: (id: string) => Node | undefined): string | null {
  if (part.type === "variable") {
    const referenceId = part.value;
    if (referenceId) {
      try {
        if (referenceId.includes(".")) {
          const output = getNodeOutputFromReferenceId(referenceId, getNode);
          if (output) return output.type;
        }
      } catch {
        // ignore
      }
    }
    return "String";
  }

  if (part.type === "text") {
    const trimmed = part.value.trim();
    if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) return "Number";
    if (trimmed === "True" || trimmed === "False") return "Boolean";
    return "String";
  }

  if (part.type === "operator") {
    if (isFunctionToken(part)) return "function";
  }

  return null;
}

/**
 * Finds the start index of an expression ending at the given index
 * Goes backwards to find where the expression starts (handles function calls, parentheses, etc.)
 */
function findExpressionStart(parts: Part[], endIndex: number): number {
  if (endIndex < 0 || endIndex >= parts.length) return endIndex;

  const part = parts[endIndex];

  // If it's a closing paren, find the matching opening paren
  if (isCloseParen(part)) {
    let parenCount = 0;
    for (let i = endIndex; i >= 0; i--) {
      if (isCloseParen(parts[i])) {
        parenCount++;
      } else if (isOpenParen(parts[i])) {
        parenCount--;
        if (parenCount === 0) {
          // Found matching opening paren
          // Check if there's a function before it
          if (i > 0 && isFunctionToken(parts[i - 1])) {
            return i - 1;
          }
          return i;
        }
      }
    }
  }

  // Check if it's part of a function call
  if (endIndex > 0 && isFunctionToken(parts[endIndex - 1])) {
    return endIndex - 1;
  }

  // Otherwise, it's a simple value
  return endIndex;
}

/**
 * Evaluates an expression starting at the given index and returns its type and the end index
 * Handles: values, function calls, parenthesized expressions
 * Returns: { type: string | null, endIndex: number, startIndex: number }
 */
function evaluateExpression(
  parts: Part[],
  startIndex: number,
  getNode: (id: string) => Node | undefined
): { type: string | null; endIndex: number; startIndex: number } {
  if (startIndex < 0 || startIndex >= parts.length) {
    return { type: null, endIndex: startIndex, startIndex };
  }

  const part = parts[startIndex];

  // Handle function call: func(...)
  if (isFunctionToken(part)) {
    const funcName = part.value;
    const returnType = FUNCTION_RETURN_TYPES[funcName];

    // Look for opening parenthesis
    if (startIndex + 1 < parts.length && isOpenParen(parts[startIndex + 1])) {
      // Find matching closing parenthesis
      // Start with parenCount = 1 because we've already seen the opening paren
      let parenCount = 1;
      let i = startIndex + 2; // Start after the opening paren

      for (; i < parts.length; i++) {
        if (isOpenParen(parts[i])) {
          parenCount++;
        } else if (isCloseParen(parts[i])) {
          parenCount--;
          if (parenCount === 0) {
            // Found matching closing paren for the function call
            return { type: returnType, endIndex: i, startIndex };
          }
        }
      }

      // No matching closing paren found
      return { type: returnType, endIndex: parts.length - 1, startIndex };
    }

    // Function token without parens - treat as value
    return { type: returnType, endIndex: startIndex, startIndex };
  }

  // Handle parenthesized expression: (...)
  if (isOpenParen(part)) {
    let parenCount = 0;
    let i = startIndex;

    for (; i < parts.length; i++) {
      if (isOpenParen(parts[i])) {
        parenCount++;
      } else if (isCloseParen(parts[i])) {
        parenCount--;
        if (parenCount === 0) {
          // Found matching closing paren
          // Evaluate the expression inside (could be a function call, value, or nested expression)
          if (i > startIndex + 1) {
            // Recursively evaluate the inner expression
            // This handles cases like (len(var)), (5), ((len(var))), etc.
            const innerResult = evaluateExpression(parts, startIndex + 1, getNode);
            // Use the inner expression's type, but the end index is the closing paren
            return { type: innerResult.type, endIndex: i, startIndex };
          }
          // Empty parentheses
          return { type: null, endIndex: i, startIndex };
        }
      }
    }

    // No matching closing paren
    return { type: null, endIndex: parts.length - 1, startIndex };
  }

  // Handle simple values
  if (part.type === "variable" || part.type === "text") {
    const type = getValueType(part, getNode);
    return { type, endIndex: startIndex, startIndex };
  }

  // Handle closing paren - go backwards to find the start
  if (isCloseParen(part)) {
    const actualStart = findExpressionStart(parts, startIndex);
    if (actualStart !== startIndex) {
      return evaluateExpression(parts, actualStart, getNode);
    }
    return { type: null, endIndex: startIndex, startIndex };
  }

  return { type: null, endIndex: startIndex, startIndex };
}

/**
 * A. Syntax / “shape” errors – anchored to PART INDICES
 */
function validateShape(parts: Part[], errors: ValidationError[]) {
  if (!parts.length) return;

  const expression = parts.map((p) => p.value).join(" ");
  // regex to check if the expression has any empty groups
  const parenthesesRegex = /\(\)|\[\]|\{\}/;
  if (parenthesesRegex.test(expression)) {
    errors.push({
      message: "Empty group is not allowed",
    });
    return;
  }

  // - Unbalanced parentheses Empty group "()"
  const parenGroups = extractParenGroups(parts);
  if (parenGroups.length > 0) {
    for (const group of parenGroups) {
      if (group.trim().length === 1) {
        errors.push({
          message: "Unbalanced parentheses",
        });
      }
    }
  }

  const lastIdx = parts.length - 1;
  const last = parts[lastIdx];
  if (last.type === "operator" && !isCloseParen(last)) {
    errors.push({
      message: "Condition cannot end with an operator",
      index: lastIdx, //  part index
    });
    return;
  }

  // Local adjacency rules
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (p.type !== "operator") continue;

    // Unary NOT must be followed by a value or '(' or another 'not'
    if (isUnary(p)) {
      const r = parts[i + 1];
      const ok = isValue(r) || isOpenParen(r) || isUnary(r);
      if (!ok) {
        errors.push({
          message: `Invalid usage of "${p.value}"`,
          index: i, //  point at 'not'
        });
      }
      continue;
    }

    // Binary operators must have value/group on both sides
    if (isBinaryOp(p)) {
      const l = parts[i - 1];
      const r = parts[i + 1];

      // Left side: can be a value, closing paren (from function call or group), or function token
      const leftOk = isValue(l) || isCloseParen(l) || isFunctionToken(l);
      // Right side: can be a value, opening paren, function token (start of function call), or unary operator
      const rightOk = isValue(r) || isOpenParen(r) || isUnary(r) || isFunctionToken(r);

      if (!leftOk || !rightOk) {
        errors.push({
          message: `Invalid operator usage around "${p.value}"`,
          index: i, //  point at operator
        });
      }
      continue;
    }
  }

  const first = parts[0];
  const allowedStart = first.type === "variable" || isFunctionToken(first) || isOpenParen(first) || isUnary(first);
  if (!allowedStart) {
    errors.push({
      message: "Syntax error",
      index: 0,
    });
  }

  // start cannot be logical op (AND/OR)
  if (isLogical(first)) {
    errors.push({
      message: "Condition cannot start with a logical operator",
      index: 0,
    });
  }
}

/**
 * Main validator
 * All errors returned are anchored to `parts[]` indices.
 */
export function validateCondition(editorState: string | SerializedEditorState, getNode: (id: string) => Node | undefined): ValidationResult {
  const errors: ValidationError[] = [];

  try {
    const parts = extractConditionParts(editorState) as Part[];

    if (!parts.length) return { errors };

    // A) Syntax / "shape" errors
    validateShape(parts, errors);

    // B) Type mismatch for equality and comparison operators
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part.type === "operator" && (EQUALITY_OPERATORS.has(part.value) || COMPARISON_OPERATORS.has(part.value))) {
        // Find the start of the left expression (go backwards from i - 1)
        const leftEnd = i - 1;
        if (leftEnd < 0) continue;

        const leftStart = findExpressionStart(parts, leftEnd);
        const leftResult = evaluateExpression(parts, leftStart, getNode);

        // Evaluate right expression
        const rightStart = i + 1;
        if (rightStart >= parts.length) continue;

        const rightResult = evaluateExpression(parts, rightStart, getNode);
        const rightEnd = rightResult.endIndex;

        // Check if we have valid expressions on both sides
        if (leftResult.type && rightResult.type) {
          // For equality operators, types must match exactly
          if (EQUALITY_OPERATORS.has(part.value)) {
            if (leftResult.type !== rightResult.type) {
              errors.push({
                message: `Type mismatch: ${leftResult.type} != ${rightResult.type}`,
                index: rightStart, // point at RIGHT operand start
              });
            }
          }
          // For comparison operators, both sides must be numbers
          else if (COMPARISON_OPERATORS.has(part.value)) {
            if (leftResult.type !== "Number" || rightResult.type !== "Number") {
              errors.push({
                message: "Comparison operators require numeric operands",
                index: rightStart, // point at RIGHT operand start
              });
            }
          }
        }

        // Skip the parts we've already evaluated
        i = rightEnd;
      }
    }
  } catch {
    // Can't reliably map this to a part; index omitted
    errors.push({ message: "Syntax error" });
  }

  return { errors };
}

/**
 * Hook wrapper
 */
export function useValidateCondition() {
  return (editorState: string | SerializedEditorState, getNode?: (id: string) => Node | undefined) => {
    const defaultGetNode = getNode || (() => undefined);
    return validateCondition(editorState, defaultGetNode);
  };
}
