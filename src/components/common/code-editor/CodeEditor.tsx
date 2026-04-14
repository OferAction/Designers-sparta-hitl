import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";

import Editor, { Monaco, EditorProps as MonacoProps } from "@monaco-editor/react";
import debounce from "lodash.debounce";
import * as monaco from "monaco-editor";

import { refreshTheme } from "./theme";
import { Loader } from "@/components/common/Loader";
import { useTheme } from "@/contexts";
import { cn } from "@/utils";

export type EditorProps = Omit<MonacoProps, "onChange"> & {
  initialCode?: string;
  height?: string | number;
  width?: string | number;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  theme?: string;
  className?: string;
  onInit?: () => Promise<void>;
  onDispose?: () => Promise<void>;
  onLinting?: (code: string) => Promise<monaco.editor.IMarkerData[]>;
  language?: string;
};

const CodeEditor: React.FC<EditorProps> = ({
  height = "100%",
  width = "100%",
  onChange,
  readOnly = false,
  theme = "custom-theme",
  className,
  onInit,
  onDispose,
  onLinting,
  language = "python",
  options = {},
  value,
  ...props
}) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const prevCodeRef = useRef<string>();
  const [isLinting, setIsLinting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { currentTheme } = useTheme();

  useEffect(() => {
    onInit?.().catch((e) => {
      console.error("Error during initialization:", e);
    });

    return () => {
      onDispose?.();
    };
  }, [onInit, onDispose]);

  useEffect(() => {
    if (!isMounted) return;
    refreshTheme(monacoRef.current!, currentTheme);
  }, [currentTheme, isMounted]);

  const performLinting = useCallback(
    async (code: string) => {
      if (isLinting || !onLinting) return;
      setIsLinting(true);
      try {
        const markers = await onLinting(code);
        if (editorRef.current && monacoRef.current) {
          monacoRef.current.editor.setModelMarkers(editorRef.current.getModel()!, "linter", markers);
          prevCodeRef.current = code;
        }
      } catch (e) {
        console.error("Error during linting:", e);
      } finally {
        setIsLinting(false);
      }
    },
    [isLinting, onLinting]
  );

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined;
    const linting = async () => {
      const value = editorRef.current?.getValue();
      if (prevCodeRef.current !== value) {
        await performLinting(value || "");
      }
      timeout = setTimeout(() => linting(), 4000);
    };

    linting();

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [performLinting]);

  // Monaco editor setup
  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    monaco.languages.register({ id: language });
    setIsMounted(true);
  };

  const debouncedLinting = useMemo(
    () =>
      debounce((code: string) => {
        performLinting(code);
      }, 500),
    [performLinting]
  );

  const handleEditorChange = (value: string | undefined) => {
    if (!value) return;

    debouncedLinting(value);
    onChange?.(value);
  };

  return (
    <div
      className={cn(
        "nokey relative transition-shadow duration-100 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background min-h-[200px]",
        className
      )}
    >
      <Editor
        height={height}
        width={width}
        value={value}
        language={language}
        theme={theme}
        onMount={handleEditorDidMount}
        onChange={handleEditorChange}
        wrapperProps={{ className: "overflow-visible" }}
        loading={<Loader />}
        options={{
          readOnly,
          cursorBlinking: readOnly ? "solid" : "blink",
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          fontSize: 14,
          tabSize: 4,
          insertSpaces: true,
          detectIndentation: true,
          automaticLayout: true,
          renderControlCharacters: true,
          folding: true,
          lineNumbersMinChars: 2,
          suggestLineHeight: 24,
          fixedOverflowWidgets: true,
          suggest: {
            showVariables: true,
            showKeywords: true,
            showValues: true,
            showFunctions: true,
            showConstants: true,
            showMethods: true,
          },
          ...options,
        }}
        {...props}
      />
    </div>
  );
};

export default CodeEditor;
