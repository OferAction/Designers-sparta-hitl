import { toast } from "@/hooks/use-toast";

import type { RuleEntry } from "@/modules/flow/types/BaseNodeTypes";

const RULE_CLIPBOARD_MAGIC_KEY = "__genor_rule_clipboard__";

export type ClipboardRuleData = {
  type: "built-in" | "custom";
  config: Partial<RuleEntry>;
};

// Toast message helpers for rule copy-paste
export const ruleClipboardToasts = {
  copySuccess: () =>
    toast({
      title: "Copied",
      description: "Rule configuration copied to clipboard",
      position: "center",
      duration: 2000,
    }),

  copyError: () =>
    toast({
      title: "Clipboard Error",
      description: "Failed to copy rule configuration. Please check browser permissions.",
      variant: "destructive",
      position: "center",
      duration: 2000,
    }),

  pasteSuccess: () =>
    toast({
      title: "Configuration pasted",
      description: "",
      position: "center",
      duration: 2000,
    }),

  pasteEmpty: () =>
    toast({
      title: "Nothing to paste",
      description: "Clipboard is empty or doesn't contain rule configuration",
      position: "center",
      duration: 2000,
    }),

  pasteError: () =>
    toast({
      title: "Clipboard Error",
      description: "Failed to read from clipboard. Please check browser permissions.",
      variant: "destructive",
      position: "center",
      duration: 2000,
    }),

  pasteTypeMismatch: () =>
    toast({
      title: "Type mismatch",
      description: "Cannot paste this rule type here",
      position: "center",
      duration: 2000,
    }),
};

/**
 * Write rule configuration to the OS clipboard
 */
export const writeRuleConfigToClipboard = async (data: ClipboardRuleData): Promise<boolean> => {
  try {
    const payload = {
      [RULE_CLIPBOARD_MAGIC_KEY]: true,
      version: 1,
      data,
    };
    await navigator.clipboard.writeText(JSON.stringify(payload));
    return true;
  } catch (error) {
    console.error("Failed to write rule config to clipboard:", error);
    ruleClipboardToasts.copyError();
    return false;
  }
};

const parseRuleConfigFromClipboard = async (): Promise<ClipboardRuleData | null> => {
  const text = await navigator.clipboard.readText();
  if (!text) return null;

  const parsed = JSON.parse(text);

  // Check for magic identifier
  if (!parsed[RULE_CLIPBOARD_MAGIC_KEY]) {
    return null;
  }

  // Validate structure
  if (!parsed.data || !parsed.data.type || !parsed.data.config) {
    return null;
  }

  return parsed.data as ClipboardRuleData;
};

/**
 * Read rule configuration from the OS clipboard
 * Returns null if clipboard is empty, doesn't contain valid rule data, or on error
 */
export const readRuleConfigFromClipboard = async (): Promise<ClipboardRuleData | null> => {
  try {
    return parseRuleConfigFromClipboard();
  } catch (error) {
    // Silent fail for invalid JSON or empty clipboard
    if (error instanceof SyntaxError) {
      return null;
    }

    // Show toast for permission or other errors
    console.error("Failed to read rule config from clipboard:", error);
    ruleClipboardToasts.pasteError();
    return null;
  }
};

/**
 * Check if clipboard contains valid rule configuration data
 */
export async function hasValidRuleConfigInClipboard(): Promise<boolean> {
  try {
    const data = await parseRuleConfigFromClipboard();
    return data !== null && !!data.config;
  } catch {
    return false;
  }
}
