export type TextHighlightPart = {
  text: string;
  isHighlight: boolean;
};

// Helper function to split text into parts for highlighting
export function getHighlightedParts(text: string, searchTerm: string): TextHighlightPart[] {
  if (!searchTerm?.trim()) return [{ text, isHighlight: false }];

  const escapedSearch = searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts: TextHighlightPart[] = [];

  const segments = text.split(new RegExp(`(${escapedSearch})`, "gi"));

  segments.forEach((segment) => {
    if (segment) {
      const isHighlight = segment.toLowerCase() === searchTerm.trim().toLowerCase();
      parts.push({ text: segment, isHighlight });
    }
  });

  return parts.length > 0 ? parts : [{ text, isHighlight: false }];
}
