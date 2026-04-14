import { useCallback, useState } from "react";

import CodeEditor, { EditorProps } from "./CodeEditor";
import { convertErrorsToMarkers, disposeLintingService, initializeLintingService, lintPythonCode } from "./python/linter-bridge";

type PythonEditorProps = Omit<EditorProps, "language">;

export const PythonCodeEditor = ({
  onInit: onInitProp,
  onDispose: onDisposeProp,
  onLinting: onLintingProp,
  initialCode = "",
  ...props
}: PythonEditorProps) => {
  const [isPyodideReady, setIsPyodideReady] = useState(false);
  const onInit = useCallback(async () => {
    const initialized = await initializeLintingService();
    setIsPyodideReady(initialized);
    await onInitProp?.();
  }, [onInitProp]);

  const onLinting = useCallback(
    async (code: string) => {
      if (!isPyodideReady) return [];
      const [customMarkers = [], lintResults] = await Promise.all([onLintingProp?.(code), lintPythonCode(code)]);

      return convertErrorsToMarkers(lintResults).concat(customMarkers);
    },
    [isPyodideReady, onLintingProp]
  );

  const onDispose = useCallback(async () => {
    await disposeLintingService();
    await onDisposeProp?.();
  }, [onDisposeProp]);

  return <CodeEditor {...props} language="python" initialCode={initialCode} onInit={onInit} onLinting={onLinting} onDispose={onDispose} />;
};
