import { useEffect } from "react";

export default function useClickOutside(ref: React.RefObject<HTMLElement>, callback: (event: MouseEvent) => void) {
  useEffect(() => {
    let isBeingHandled = false;
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        if (isBeingHandled) return;
        isBeingHandled = true;
        callback(event);
        isBeingHandled = false;
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [ref, callback]);
}
