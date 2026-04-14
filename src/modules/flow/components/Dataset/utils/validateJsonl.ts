type ValidationResult = { valid: true } | { valid: false; error: string };

interface ValidationState {
  lineNumber: number;
  validJsonLines: number;
}

function validateJsonLine(line: string, state: ValidationState): ValidationResult | null {
  state.lineNumber++;

  const trimmed = line.trim();
  if (trimmed === "") {
    return null;
  }

  try {
    JSON.parse(trimmed);
    state.validJsonLines++;
    return null;
  } catch {
    return {
      valid: false,
      error: `Invalid JSONL on line ${state.lineNumber}`,
    };
  }
}

function finalizeValidation(state: ValidationState): ValidationResult {
  if (state.validJsonLines === 0) {
    return {
      valid: false,
      error: "File contains no valid JSON lines",
    };
  }

  return { valid: true };
}

export async function validateJsonlFile(file: File): Promise<{ valid: boolean; error?: string }> {
  try {
    return await validateJsonlFileStreaming(file);
  } catch (e) {
    return {
      valid: false,
      error: `Error reading file: ${e instanceof Error ? e.message : "Unknown error"}`,
    };
  }
}

async function validateJsonlFileStreaming(file: File): Promise<{ valid: boolean; error?: string }> {
  const stream = file.stream();
  const reader = stream.getReader();
  const decoder = new TextDecoder();

  const state: ValidationState = {
    lineNumber: 0,
    validJsonLines: 0,
  };

  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      if (buffer.trim() !== "") {
        const result = validateJsonLine(buffer, state);
        if (result) return result;
      }
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const result = validateJsonLine(line, state);
      if (result) return result;
    }
  }

  const finalResult = finalizeValidation(state);
  if (!finalResult.valid) {
    return finalResult;
  }

  return { valid: true };
}
