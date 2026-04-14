import { useCallback, useEffect, useRef } from "react";

export const useStableCallback = <T extends (...args: any[]) => any>(callback?: T) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]); // whenever the callback changes, update the ref

  return useCallback((...args: Parameters<T>) => {
    return callbackRef.current?.(...args);
  }, []); // useCallback to ensure the function reference is stable, this is to avoid re-adding the event listener on every render
};
