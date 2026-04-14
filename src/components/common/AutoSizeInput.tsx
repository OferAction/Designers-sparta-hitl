import React, { useLayoutEffect, useRef, useState } from "react";

/**
 * AutoSizeInput
 * Wrap an input-like element and automatically adjust its width to fit content
 * within provided min / max constraints.
 */
export interface AutoSizeInputProps {
  /** Single input element (must accept ref + value/placeholder props). */
  children: React.ReactElement;
  /** Minimum width in pixels (default 60). */
  minWidth?: number;
  /** Maximum width in pixels (default 180). */
  maxWidth?: number;
  /** Extra pixels added after measuring text (default 12). */
  paddingCompensation?: number;
  /** Optional className for outer wrapper span. */
  className?: string;
  /** Override measured text; falls back to child.props.value / placeholder. */
  measureText?: string;
}

export const AutoSizeInput: React.FC<AutoSizeInputProps> = ({
  children,
  minWidth = 60,
  maxWidth = 180,
  paddingCompensation = 12,
  className,
  measureText,
}) => {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState(minWidth);

  const derivedText = measureText ?? children.props.value ?? children.props.placeholder ?? "";

  useLayoutEffect(() => {
    const text = String(derivedText).replace(/ /g, "\u00A0");
    if (measureRef.current) {
      measureRef.current.textContent = text.length ? text : "";
      const w = measureRef.current.offsetWidth + paddingCompensation;
      setWidth(Math.min(maxWidth, Math.max(minWidth, w)));
    }
  }, [derivedText, minWidth, maxWidth, paddingCompensation]);

  // Clone child to inject ref & dynamic style sizing while preserving existing style
  const childStyle = {
    ...(children.props.style || {}),
    width,
    minWidth,
    maxWidth,
  } as React.CSSProperties;

  const cloned = React.cloneElement(children, {
    ref: (node: any) => {
      inputRef.current = node;
      const { ref } = children as any;
      if (typeof ref === "function") ref(node);
      else if (ref && typeof ref === "object") (ref as any).current = node;
    },
    style: childStyle,
  });

  return (
    <span className={className ? className : "inline-flex relative"}>
      {/* Hidden measurement span */}
      <span ref={measureRef} className="absolute top-0 left-0 invisible pointer-events-none whitespace-pre text-sm font-normal px-2" />
      {cloned}
    </span>
  );
};

export default AutoSizeInput;
