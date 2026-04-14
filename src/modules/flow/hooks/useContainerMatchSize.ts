import { useEffect, useRef } from "react";

export const useContainerMatchSize = (
  targetRef: React.RefObject<HTMLDivElement>,
  opts: { height?: boolean; width?: boolean } = { height: false, width: false }
) => {
  const sourceRef = useRef<HTMLDivElement>(null);
  const { width, height } = opts;

  useEffect(() => {
    const observeEl = sourceRef.current;
    const targetEl = targetRef.current;
    if (!observeEl || !targetEl) return;

    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (!rect) return;
      if (width) targetEl.style.setProperty("min-width", `${rect.width}px`);
      if (height) targetEl.style.setProperty("min-height", `${rect.height}px`);
    });
    ro.observe(observeEl);
    return () => ro.disconnect();
  }, [height, width, targetRef]);

  return { targetRef, sourceRef };
};
