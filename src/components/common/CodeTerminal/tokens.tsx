import { Token } from "./tokenizer";

export const JsonToken = ({ token }: { token: Token }) => {
  switch (token.type) {
    case "key":
      return <span className="text-destructive">{token.value}</span>;
    case "value":
      return <span className="text-blue-accent">{token.value}</span>;
    case "brace":
      return <span className="text-blue-accent">{token.value}</span>;
    case "bracket":
      return <span className="text-success">{token.value}</span>;
    case "number":
      return <span className="text-blue-accent">{token.value}</span>;
    case "keyword":
      return <span className="text-blue-accent">{token.value}</span>;
    default:
      return <span>{token.value}</span>;
  }
};

export const IndentGuide = ({ index }: { index: number }) => (
  <span className="absolute left-0 h-full border-l border-border/30" style={{ left: `${(index + 1) * 16}px` }} />
);
