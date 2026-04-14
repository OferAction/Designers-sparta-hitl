// Linting result from Pyflakes
export interface PythonError {
  endColumn: number;
  endLineNumber: number;
  message: string;
  severity: "error" | "warning" | "fatal" | "hint" | "info"; // 'error' or 'warning'
  startColumn: number;
  startLineNumber: number;
}
