export const parseXMLToObject = (xmlString: string): Record<string, any> => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");

  const parseNode = (node: Element): any => {
    const result: Record<string, any> = {};

    for (const child of Array.from(node.children)) {
      const key = child.tagName;
      const value = child.children.length > 0 ? parseNode(child) : child.textContent || "";

      if (result[key]) {
        if (Array.isArray(result[key])) {
          result[key].push(value);
        } else {
          result[key] = [result[key], value];
        }
      } else {
        result[key] = value;
      }
    }

    return result;
  };

  return parseNode(xmlDoc.documentElement);
};
