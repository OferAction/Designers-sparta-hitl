export function extractTypesFromEditorJSON(json: any): string[] {
  const root = json?.root;
  const children = root?.children || [];
  for (const para of children) {
    const paraChildren = para?.children || [];
    for (const ch of paraChildren) {
      if (ch?.type === "typesSelection" && Array.isArray(ch.types)) {
        return ch.types as string[];
      }
    }
  }
  return [];
}
