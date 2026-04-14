import * as React from "react";

interface AutoSizeInputOptions {
  /** Extra pixels to add to the calculated width */
  extraPx?: number;
  /** Minimum width in pixels */
  minPx?: number;
  /** Maximum width in pixels */
  maxPx?: number;
  /** The current value of the input */
  value?: string;
  /** Placeholder text when input is empty */
  placeholder?: string;
}

/**
 * Hook for auto-sizing input elements based on their text content.
 * Creates a hidden span element to accurately measure text width.
 * Works naturally with flex layouts by sizing the input element directly.
 *
 * @example
 * ```tsx
 * const inputRef = useRef<HTMLInputElement>(null);
 * const sizerRef = useAutoSizeInput({
 *   inputRef,
 *   value: inputValue,
 *   placeholder: "Type here...",
 *   minPx: 100,
 *   maxPx: 500,
 * });
 *
 * return (
 *   <div>
 *     <span ref={sizerRef} style={{ position: 'absolute', visibility: 'hidden', whiteSpace: 'pre' }} />
 *     <input ref={inputRef} value={inputValue} style={{ width: '1px', flex: '0 0 auto' }} />
 *   </div>
 * );
 * ```
 */
export function useAutoSizeInput<TInput extends HTMLElement>({
  inputRef,
  extraPx = 0,
  minPx = 0,
  maxPx = Infinity,
  value = "",
  placeholder = "",
}: {
  inputRef: React.RefObject<TInput>;
} & AutoSizeInputOptions) {
  const sizerRef = React.useRef<HTMLSpanElement>(null);

  React.useLayoutEffect(() => {
    if (!inputRef.current || !sizerRef.current) return;

    const input = inputRef.current;
    const sizer = sizerRef.current;

    const cs = getComputedStyle(input);

    // Apply computed styles to sizer for accurate measurement
    sizer.style.font = cs.font;
    sizer.style.letterSpacing = cs.letterSpacing;
    sizer.style.textTransform = cs.textTransform;

    const fit = () => {
      if (!sizer || !input) return;

      // Use placeholder when empty so we get a sensible width
      sizer.textContent = value || placeholder || "";
      const bb = sizer.getBoundingClientRect();
      const textW = bb.right - bb.left + extraPx;

      // Calculate target width
      let target = textW;

      // Apply constraints in order: minPx -> maxPx -> parent available width
      target = Math.max(target, minPx);

      if (maxPx < Infinity) {
        target = Math.min(target, maxPx);
      }

      // Set the input width directly for natural flex behavior
      input.style.width = Math.ceil(target) + "px";
    };

    fit();
  }, [value, placeholder, extraPx, minPx, maxPx, inputRef]);

  return sizerRef;
}
