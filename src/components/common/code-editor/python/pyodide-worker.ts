import * as Comlink from "comlink";

import { PythonError } from "./types";

declare global {
  interface Window {
    loadPyodide: any;
    pyodide: any;
  }
}

class PythonLintingService {
  private pyodide: any = null;
  private isInitializing = false;
  private lintingPackagesLoaded = false;

  // Initialize Pyodide
  async initialize(): Promise<boolean> {
    if (this.pyodide) return true;
    if (this.isInitializing) {
      // Wait for initialization to complete
      while (this.isInitializing) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return !!this.pyodide;
    }

    this.isInitializing = true;

    try {
      // Dynamically import and initialize Pyodide
      // @ts-expect-error typescript doesn't know about the cdn
      const { loadPyodide } = (await import("https://cdn.jsdelivr.net/pyodide/v0.27.6/full/pyodide.mjs")) as any;
      this.pyodide = await loadPyodide();

      await this.pyodide.loadPackage("micropip");

      // Suppress console output from Pyodide
      this.pyodide.setStdout({ batched: () => {} });
      this.pyodide.setStderr({ batched: () => {} });

      return true;
    } catch (error) {
      console.error("Failed to initialize Pyodide:", error);
      return false;
    } finally {
      this.isInitializing = false;
    }
  }

  // Load Python linting packages
  private async loadLintingPackages(): Promise<boolean> {
    if (this.lintingPackagesLoaded) return true;
    if (!this.pyodide) return false;

    try {
      // Install pyflakes using micropip
      await this.pyodide.runPythonAsync(`
        import micropip
        await micropip.install('pylint')
      `);

      // Set up the linting function in Python
      await this.pyodide.runPythonAsync(`
        import tempfile
        import os
        from io import StringIO
        from pylint.reporters.json_reporter import JSON2Reporter
        from pylint import lint
        import sys
        import json

        def lint_code(code):
          errors = []
          
          with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as temp_file:
            temp_file.write(code)
            temp_path = temp_file.name
          
          try:
            pylint_output = StringIO()
            sys.stdout, old_std_out = pylint_output, sys.stdout
            sys.stderr, old_std_err = pylint_output, sys.stderr

            args = [
              "--output-format=json",
              temp_path,
              "--disable=C, R, I",
              "--enable=W0612",
              "--clear-cache-post-run=True"
            ]

            lint.Run(args, reporter=JSON2Reporter(pylint_output), exit=False)

            sys.stdout, sys.stderr = old_std_out, old_std_err
            messages = json.loads(pylint_output.getvalue())
            for message in messages:
              errors.append({
                "endColumn": message.get("endColumn", 0),
                "endLineNumber": message.get("endLineNumber", 0),
                "message": message.get("message", "").replace(temp_path, ""),
                "severity": message.get("type", "error"),
                "startColumn": message.get("column", 0),
                "startLineNumber": message.get("line", 0),
              })
          finally:
            # Clean up temporary file
            if os.path.exists(temp_path):
              os.remove(temp_path)
              
          return errors
      `);

      this.lintingPackagesLoaded = true;
      return true;
    } catch (error) {
      console.error("Failed to load linting packages:", error);
      return false;
    }
  }

  // Lint Python code using Pyflakes
  async lintCode(code: string): Promise<PythonError[]> {
    // Initialize if needed
    if (!this.pyodide) {
      const initialized = await this.initialize();
      if (!initialized) {
        return [
          {
            severity: "hint",
            message: "Failed to initialize Python linter",
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: 1,
            endColumn: 1,
          },
        ];
      }
    }

    // Load linting packages if needed
    if (!this.lintingPackagesLoaded && this.isInitializing === false) {
      const loaded = await this.loadLintingPackages();
      if (!loaded) {
        return [];
      }
    }
    if (!this.lintingPackagesLoaded || this.isInitializing) return [];
    try {
      // Run the linting function
      const results = await this.pyodide.runPythonAsync(`lint_code(${JSON.stringify(code)})`);

      // Convert from Python to JS
      return results.toJs({
        dict_converter: (iterable: any) => {
          return Object.fromEntries(iterable);
        },
      });
    } catch (error) {
      console.error("Error linting Python code:", error);
      return [];
    }
  }

  // Check if the service is ready
  isReady(): boolean {
    return !!this.pyodide && this.lintingPackagesLoaded;
  }
}

Comlink.expose(new PythonLintingService());
