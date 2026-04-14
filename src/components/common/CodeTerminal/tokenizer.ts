export type TokenType = "key" | "value" | "brace" | "bracket" | "number" | "keyword" | "text";

export interface Token {
  type: TokenType;
  value: string;
}

export const tokenizeLine = (line: string): Token[] => {
  const tokens: Token[] = [];
  let currentPos = 0;

  // Regex breakdown for matching JSON elements:
  // 1. ("(?:\\.|[^"\\])*")(?:\\s*:)? - Matches quoted strings (optionally followed by colon for keys)
  //    - "(?:\\.|[^"\\])*" - Any character in quotes, handling escaped chars
  //    - (?:\\s*:)? - Optional whitespace followed by colon (for object keys)
  // 2. ([{}]) - Matches curly braces (object literals)
  // 3. (\\[|\\]) - Matches square brackets (array literals)
  // 4. (-?\\d+\\.?\\d*) - Matches numbers (integer or decimal)
  // 5. (\\btrue\\b|\\bfalse\\b|\\bnull\\b) - Matches JSON keywords (true, false, null)
  const jsonRegex = /("(?:\\.|[^"\\])*")(?:\s*:)?|([{}])|(\[|\])|(-?\d+\.?\d*)|(\btrue\b|\bfalse\b|\bnull\b)/g;

  let match;
  while ((match = jsonRegex.exec(line)) !== null) {
    // Add any non-matched text before this token as plain text
    if (match.index > currentPos) {
      tokens.push({
        type: "text",
        value: line.substring(currentPos, match.index),
      });
    }

    const [fullMatch, quoted, curly, square, number, keyword] = match;

    if (quoted) {
      if (fullMatch.includes(":")) {
        const colonIndex = fullMatch.lastIndexOf(":");
        const key = fullMatch.substring(0, colonIndex);
        const colon = fullMatch.substring(colonIndex);

        tokens.push({ type: "key", value: key });
        tokens.push({ type: "text", value: colon });
      } else {
        tokens.push({ type: "value", value: quoted });
      }
    } else if (curly) {
      tokens.push({ type: "brace", value: curly });
    } else if (square) {
      tokens.push({ type: "bracket", value: square });
    } else if (number) {
      tokens.push({ type: "number", value: number });
    } else if (keyword) {
      tokens.push({ type: "keyword", value: keyword });
    }

    currentPos = match.index + fullMatch.length;
  }

  // Add any remaining text after the last match
  if (currentPos < line.length) {
    tokens.push({
      type: "text",
      value: line.substring(currentPos),
    });
  }

  return tokens;
};
