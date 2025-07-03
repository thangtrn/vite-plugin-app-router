import type { Node } from "./types";

/**
 * Build a route tree from a list of TSX file paths
 */
export function buildRouteTree(files: string[]): Node {
  const tree: Node = {
    segment: "",
    pathSegment: "",
    children: [],
  };

  for (const file of files) {
    const parts = file
      .replace(/^src\/app\//, "")
      .replace(/\.(tsx|jsx)$/, "")
      .split("/");

    let current = tree;

    for (let i = 0; i < parts.length; i++) {
      const segment = parts[i];

      let node = current.children?.find((c) => c.segment === segment);
      if (!node) {
        const pathSegment = getPathSegment(segment);
        node = {
          segment,
          pathSegment,
          children: [],
        };
        current.children!.push(node);
      }

      if (i === parts.length - 1) {
        // last segment
        switch (segment) {
          case "layout":
            current.layout = file;
            break;
          case "page":
            current.page = file;
            break;
          case "error":
            current.error = file;
            break;
          case "not-found":
            current.notFound = file;
            break;
          case "loading":
            current.loading = file;
            break;
          default:
            break;
        }
      } else {
        current = node;
      }
    }
  }

  return tree;
}

function getPathSegment(segment: string): string {
  if (segment.startsWith("(")) {
    return "";
  }
  if (segment.startsWith("[[...") && segment.endsWith("]]")) {
    return "*";
  }
  if (segment.startsWith("[...") && segment.endsWith("]")) {
    return "*";
  }
  if (segment.startsWith("[[") && segment.endsWith("]]")) {
    return `:${segment.slice(2, -2)}?`;
  }
  if (segment.startsWith("[") && segment.endsWith("]")) {
    return `:${segment.slice(1, -1)}`;
  }
  return segment;
}
