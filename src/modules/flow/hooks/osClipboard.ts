import { useEffect, useState } from "react";

import { toast } from "@/hooks/use-toast";

const CLIPBOARD_MAGIC_KEY = "__genor_flow_clipboard__";

export type ClipboardFlowData = {
  nodes: { originalId: string; node: any }[];
  edges: { source: string; target: string; sourceHandle?: string | null; targetHandle?: string | null }[];
};

// Toast message helpers
export const clipboardToasts = {
  copySuccess: (count?: number) =>
    toast({
      title: "Copied",
      description: count ? `${count} node(s) copied to clipboard` : "Your selection has been copied successfully",
      position: "center",
    }),

  copyError: () =>
    toast({
      title: "Clipboard Error",
      description: "Failed to copy to clipboard. Please check browser permissions.",
      variant: "destructive",
      position: "center",
    }),

  pasteSuccess: (count: number) =>
    toast({
      title: "Pasted",
      description: `${count} node(s) pasted`,
      position: "center",
    }),

  pasteEmpty: () =>
    toast({
      title: "Nothing to paste",
      description: "Clipboard is empty or doesn't contain flow nodes",
      position: "center",
    }),

  pasteError: () =>
    toast({
      title: "Clipboard Error",
      description: "Failed to read from clipboard. Please check browser permissions.",
      variant: "destructive",
      position: "center",
    }),

  replaceSuccess: (count: number) =>
    toast({
      title: "Replaced",
      description: `${count} node(s) replaced with clipboard content`,
      position: "center",
    }),

  copyPropertiesSuccess: () =>
    toast({
      title: "Properties Copied",
      description: `Node properties copied to clipboard`,
      position: "center",
    }),

  pastePropertiesSuccess: () =>
    toast({
      title: "Properties Pasted",
      description: "Node properties applied successfully",
      position: "center",
    }),

  pastePropertiesTypeMismatch: () =>
    toast({
      title: "Cannot Paste Properties",
      description: `Source node and target node must be the same type`,
      variant: "destructive",
      position: "center",
    }),
};

/**
 * Write flow data (nodes and edges) to the OS clipboard
 */
export const writeFlowDataToClipboard = async (data: ClipboardFlowData): Promise<boolean> => {
  try {
    const payload = {
      [CLIPBOARD_MAGIC_KEY]: true,
      version: 1,
      data,
    };
    await navigator.clipboard.writeText(JSON.stringify(payload));
    return true;
  } catch (error) {
    console.error("Failed to write to clipboard:", error);
    clipboardToasts.copyError();
    return false;
  }
};

const parseFlowDataFromClipboard = async (): Promise<ClipboardFlowData | null> => {
  const text = await navigator.clipboard.readText();
  if (!text) return null;

  const parsed = JSON.parse(text);

  // Check for magic identifier
  if (!parsed[CLIPBOARD_MAGIC_KEY]) {
    return null;
  }

  // Validate structure
  if (!parsed.data || !Array.isArray(parsed.data.nodes) || !Array.isArray(parsed.data.edges)) {
    return null;
  }

  return parsed.data as ClipboardFlowData;
};

/**
 * Read flow data from the OS clipboard
 * Returns null if clipboard is empty, doesn't contain valid flow data, or on error
 */
export const readFlowDataFromClipboard = async (): Promise<ClipboardFlowData | null> => {
  try {
    return parseFlowDataFromClipboard();
  } catch (error) {
    // Silent fail for invalid JSON or empty clipboard
    if (error instanceof SyntaxError) {
      return null;
    }

    // Show toast for permission or other errors
    console.error("Failed to read from clipboard:", error);
    clipboardToasts.pasteError();
    return null;
  }
};

/**
 * Check if clipboard contains valid flow data
 */
export async function hasValidFlowDataInClipboard(): Promise<boolean> {
  try {
    const data = await parseFlowDataFromClipboard();
    return data !== null && data.nodes.length > 0;
  } catch {
    return false;
  }
}

export const useHasValidFlowDataInClipboard = () => {
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    const checkClipboard = () => {
      hasValidFlowDataInClipboard().then(setHasData);
    };

    // Check immediately
    checkClipboard();

    // Re-check on clipboard events (copy/cut/paste in the app)
    document.addEventListener("copy", checkClipboard);
    document.addEventListener("cut", checkClipboard);
    document.addEventListener("paste", checkClipboard);

    // Re-check when window gains focus (user might have copied from elsewhere)
    window.addEventListener("focus", checkClipboard);

    return () => {
      document.removeEventListener("copy", checkClipboard);
      document.removeEventListener("cut", checkClipboard);
      document.removeEventListener("paste", checkClipboard);
      window.removeEventListener("focus", checkClipboard);
    };
  }, []);

  return hasData;
};
