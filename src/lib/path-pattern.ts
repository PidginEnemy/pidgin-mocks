const DYNAMIC_SEGMENT = /^\{[a-zA-Z_][a-zA-Z0-9_]*\}$/;

export function splitPathToSegments(path: string): string[] {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized === "/") return [];
  return normalized.split("/").filter(Boolean);
}

export function isDynamicSegment(segment: string): boolean {
  return DYNAMIC_SEGMENT.test(segment);
}

export function pathMatchesPattern(actualPath: string, patternPath: string): boolean {
  const actual = splitPathToSegments(actualPath);
  const pattern = splitPathToSegments(patternPath);

  if (actual.length !== pattern.length) return false;

  return pattern.every((segment, index) => {
    if (isDynamicSegment(segment)) {
      return actual[index].length > 0;
    }
    return segment === actual[index];
  });
}

export function patternSpecificity(patternPath: string): number {
  const segments = splitPathToSegments(patternPath);
  const staticCount = segments.filter((s) => !isDynamicSegment(s)).length;
  return staticCount * 1000 + segments.length;
}

export function isValidEndpointPath(path: string): boolean {
  if (!path.startsWith("/")) return false;

  const segments = splitPathToSegments(path);
  return segments.every(
    (segment) =>
      isDynamicSegment(segment) ||
      (segment.length > 0 && !segment.includes("{") && !segment.includes("}")),
  );
}
