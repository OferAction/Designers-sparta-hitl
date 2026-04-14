import React, { useCallback, useMemo } from "react";

import { CopyIcon } from "@phosphor-icons/react";
import { cva } from "class-variance-authority";

import { useTerminal } from "../context/TerminalContext";
import WithTooltip from "@/components/common/WithTooltip";
import { cn } from "@/lib/utils";

const iconVariants = cva("h-4 w-4 cursor-pointer text-primary hover:text-muted-foreground");

interface CopyButtonProps {
  className?: string;
  onClick?: () => void;
  value?: string | object;
  disabled?: boolean;
}

interface RichTextNode {
  root?: string;
  children?: RichTextNode[];
  text?: string;
}

const regex = {
  textField: /"text"\s*:\s*"([\s\S]*?)"/g,
  textValue: /"text"\s*:\s*"([\s\S]*?)"/,
};

export const CopyButton: React.FC<CopyButtonProps> = ({ className, onClick, value: valueProp, disabled: disabledProp }) => {
  const { value: valueContext, setShowAlert } = useTerminal();

  const value = useMemo(() => valueProp ?? valueContext ?? "", [valueProp, valueContext]);

  // Extract plain text from possible rich-editor JSON structure
  const extractPlainText = useCallback((v: unknown): string => {
    if (typeof v === "string") return v;
    if (Array.isArray(v)) {
      // Handle arrays of logs or generic objects
      try {
        const lines = v.map((item) => {
          if (item && typeof item === "object") {
            const o = item;
            const ts = o.engineTime || o.time || o.timestamp || "";
            const lvl = o.logLevel || o.level || "";
            const nid = o.nodeId || o.node_id || "";
            const msg = typeof o.message === "string" ? o.message : JSON.stringify(o.message ?? "", null, 0);
            return [ts, lvl && `[${lvl}]`, nid, msg].filter(Boolean).join(" ");
          }
          return String(item ?? "");
        });
        return lines.join("\n");
      } catch {
        return JSON.stringify(v, null, 2);
      }
    }
    if (v && typeof v === "object") {
      const obj: RichTextNode = v;
      // Lexical-like structure: { root: { children: [...] } }
      const collect: (node: RichTextNode) => string = (node: RichTextNode) => {
        if (!node) return "";
        if (typeof node.text === "string") return node.text;
        if (Array.isArray(node.children)) return node.children.map(collect).join("\n");
        return "";
      };
      if (obj.root && typeof obj.root === "object") return collect(obj.root).trim();
      if (Array.isArray(obj.children)) return collect(obj).trim();
      // Fallback: stringify and try to pull text fields
      try {
        const s = JSON.stringify(obj);
        const matchTexts = s.match(regex.textField) || [];
        return matchTexts
          .map((m) => {
            const mm = m.match(regex.textValue);
            return mm ? mm[1] : "";
          })
          .join("\n")
          .trim();
      } catch {
        return String(v);
      }
    }
    return String(v ?? "");
  }, []);

  const plainText = useMemo(() => extractPlainText(value), [value, extractPlainText]);
  const disabled = useMemo(() => {
    const autoDisabled = plainText.trim() === "";
    return disabledProp ?? autoDisabled;
  }, [disabledProp, plainText]);

  const handleCopy = useCallback(() => {
    const textToCopy = plainText;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setShowAlert(true);
    });

    if (onClick) {
      onClick();
    }
  }, [plainText, onClick, setShowAlert]);

  return (
    <WithTooltip tooltip={disabled || "Copy"} delayDuration={0} disableTooltip={disabled} side="top">
      <button type="button" aria-label="Copy" onClick={handleCopy} disabled={disabled} className="flex items-center justify-center size-full">
        <CopyIcon className={cn(iconVariants(), disabled && "opacity-50 cursor-not-allowed pointer-events-none", className)} />
      </button>
    </WithTooltip>
  );
};
