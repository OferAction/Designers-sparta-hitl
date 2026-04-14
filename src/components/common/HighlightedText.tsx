interface HighlightedTextProps {
  text: string;
  query?: string;
  highlightClassName?: string;
}

export function HighlightedText({ text, query, highlightClassName = "text-purple-accent font-medium" }: HighlightedTextProps) {
  if (!query) return <>{text}</>;

  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, index)}
      <span className={highlightClassName}>{text.slice(index, index + query.length)}</span>
      {text.slice(index + query.length)}
    </>
  );
}
