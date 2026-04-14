import * as Comlink from "comlink";
import * as monaco from "monaco-editor";

import { PythonError } from "./types";

interface PythonLintingService {
  initialize(): Promise<boolean>;
  lintCode(code: string): Promise<PythonError[]>;
  isReady(): boolean;
}

let worker: Worker | null = null;
let lintingService: Comlink.Remote<PythonLintingService> | null = null;

export async function initializeLintingService(): Promise<boolean> {
  if (lintingService) return true;

  try {
    // Create the worker
    worker = new Worker(new URL("./pyodide-worker.ts", import.meta.url), { type: "module" });

    // Create the Comlink proxy to the worker
    lintingService = Comlink.wrap<PythonLintingService>(worker);

    // Initialize Pyodide in the worker
    return await lintingService.initialize();
  } catch (error) {
    console.error("Failed to initialize Python linting service:", error);
    return false;
  }
}

// Lint Python code using the worker
export async function lintPythonCode(code: string): Promise<PythonError[]> {
  // Initialize service if needed
  if (!lintingService) {
    const initialized = await initializeLintingService();
    if (!initialized) {
      return [
        {
          severity: "warning",
          message: "Python linting service is not initialized",
          startColumn: 1,
          startLineNumber: 1,
          endColumn: 1,
          endLineNumber: 1,
        },
      ];
    }
  }

  try {
    // Get linting results from Pyodide
    const results = await lintingService!.lintCode(code);

    return results;
  } catch (error) {
    console.error("Error linting Python code:", error);
    return [
      {
        severity: "error",
        message: `Linting error: ${error}`,
        startColumn: 1,
        startLineNumber: 1,
        endColumn: 1,
        endLineNumber: 1,
      },
    ];
  }
}

const monacoSeverityMap = {
  error: monaco.MarkerSeverity.Error,
  warning: monaco.MarkerSeverity.Warning,
  info: monaco.MarkerSeverity.Info,
  fatal: monaco.MarkerSeverity.Error,
  hint: monaco.MarkerSeverity.Hint,
};

// Convert Pyflakes errors to Monaco markers
export function convertErrorsToMarkers(errors: PythonError[]): monaco.editor.IMarkerData[] {
  return errors.map((error) => {
    // Determine the marker severity based on the error type
    const severity = monacoSeverityMap[error.severity] || monaco.MarkerSeverity.Warning;
    const { endColumn, endLineNumber, message, startColumn, startLineNumber } = error;
    return {
      message,
      endColumn: endColumn ? endColumn + 1 : endColumn,
      endLineNumber,
      startColumn: startColumn ? startColumn + 1 : startColumn,
      startLineNumber,
      severity,
      source: "pylance",
    };
  });
}

// Dispose the worker when no longer needed
export function disposeLintingService() {
  if (worker) {
    worker.terminate();
    worker = null;
    lintingService = null;
  }
}
