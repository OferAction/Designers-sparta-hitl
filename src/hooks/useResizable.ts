import { useRef, useState, useCallback } from "react";

import debounce from "lodash.debounce";

interface UseResizableProps {
  initialSize?: number;
  minSize?: number;
  maxSize?: number;
  direction?: "to-left" | "to-right" | "to-top" | "to-bottom";
  debounceMs?: number;
}

export function useResizable({ initialSize = 300, minSize = 200, maxSize = 500, direction, debounceMs = 10 }: UseResizableProps) {
  const [size, setSize] = useState(initialSize);
  const startPos = useRef(0);
  const startSize = useRef(0);
  const horizontal = direction === "to-left" || direction === "to-right";

  const setSizeDebounced = useRef(
    debounce((newSize: number) => {
      setSize(newSize);
    }, debounceMs)
  ).current;

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      let delta = 0;
      let newSize = 0;
      document.body.style.pointerEvents = "none";
      switch (direction) {
        case "to-left":
          delta = e.clientX - startPos.current;
          newSize = Math.min(maxSize, Math.max(minSize, startSize.current - delta));
          break;
        case "to-top":
          delta = e.clientY - startPos.current;
          break;
        case "to-right":
          delta = e.clientX - startPos.current;
          newSize = Math.min(maxSize, Math.max(minSize, startSize.current + delta));

          // no change needed
          break;
        case "to-bottom":
          delta = e.clientY - startPos.current;

          break;
        default:
          throw new Error("Invalid direction");
      }

      setSizeDebounced(newSize);
    },
    [direction, maxSize, minSize, setSizeDebounced]
  );

  const onPointerUp = useCallback(() => {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    document.body.style.pointerEvents = "auto";

    document.body.style.cursor = "";
    setSizeDebounced.flush();
  }, [onPointerMove, setSizeDebounced]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      startPos.current = horizontal ? e.clientX : e.clientY;
      startSize.current = size;
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      document.body.style.cursor = horizontal ? "ew-resize" : "ns-resize";
    },
    [horizontal, size, onPointerMove, onPointerUp]
  );

  return {
    size,
    onPointerDown,
  };
}
