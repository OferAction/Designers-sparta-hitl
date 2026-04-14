export type PathPattern = string | RegExp | ((path: string) => boolean);

export function shouldTrackPath(path: string, exclude?: PathPattern[]): boolean {
  if (!exclude) return true;
  if (exclude.length > 0) {
    return !exclude.some((pattern) => matchesPattern(path, pattern));
  }

  return true;
}

function matchesPattern(path: string, pattern: PathPattern): boolean {
  if (typeof pattern === "string") {
    // String patterns can use * as wildcards
    const regexPattern = pattern.replace(/\./g, "\\.").replace(/\*/g, ".*");
    return new RegExp(`^${regexPattern}$`).test(path);
  }

  if (pattern instanceof RegExp) {
    return pattern.test(path);
  }

  if (typeof pattern === "function") {
    return pattern(path);
  }

  return false;
}
