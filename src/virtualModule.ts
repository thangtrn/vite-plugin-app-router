import type { Node } from "./types";

/**
 * Generate virtual module code from route tree
 */
export function generateRoutesVirtualModule(tree: Node): string {
  let imports = `import React from "react";\n`;
  let routeObjects = "";

  const importCounter = { value: 0 };

  function walk(node: Node, parentPath: string, layoutStack: string[]) {
    if (!node) return;

    if (
      node.children?.length &&
      node.children.every((c) => c.segment.startsWith("("))
    ) {
      // parallel routes
      const parallelElements = node.children
        .map((groupNode) =>
          generateElementForNode(groupNode, parentPath, layoutStack)
        )
        .join(",");

      routeObjects += `{
        path: '${parentPath === "" ? "/" : "/" + parentPath}',
        element: React.createElement(React.Fragment, null, ${parallelElements})
      },\n`;

      return;
    }

    if (node.page) {
      const element = generateElementForNode(node, parentPath, layoutStack);

      let errorElement = "";
      if (node.error) {
        const errorName = `Error${importCounter.value++}`;
        imports += `import ${errorName} from '/${node.error}';\n`;
        errorElement = `, errorElement: React.createElement(${errorName})`;
      }

      const routePath = parentPath === "" ? "/" : "/" + parentPath;

      routeObjects += `{
        path: '${routePath}',
        element: ${element}${errorElement}
      },\n`;
    }

    for (const child of node.children || []) {
      let childPath = parentPath;
      if (child.pathSegment) {
        childPath = childPath
          ? `${childPath}/${child.pathSegment}`
          : child.pathSegment;
      }
      const newLayoutStack = [...layoutStack];
      if (node.layout) {
        const layoutName = `Layout${importCounter.value++}`;
        imports += `import ${layoutName} from '/${node.layout}';\n`;
        newLayoutStack.push(layoutName);
      }

      if (node.notFound) {
        const notFoundName = `NotFound${importCounter.value++}`;
        imports += `import ${notFoundName} from '/${node.notFound}';\n`;

        const notFoundPath = parentPath === "" ? "*" : parentPath + "/*";

        routeObjects += `{
          path: '${notFoundPath}',
          element: React.createElement(${notFoundName})
        },\n`;
      }

      walk(child, childPath, newLayoutStack);
    }
  }

  function generateElementForNode(
    node: Node,
    path: string,
    layoutStack: string[]
  ) {
    const pageName = `Page${importCounter.value++}`;
    imports += `import ${pageName} from '/${node.page}';\n`;

    let element = `React.createElement(${pageName})`;

    if (node.loading) {
      const loadingName = `Loading${importCounter.value++}`;
      imports += `import ${loadingName} from '/${node.loading}';\n`;
      element = `React.createElement(React.Suspense, { fallback: React.createElement(${loadingName}) }, ${element})`;
    }

    if (node.layout) {
      const layoutName = `Layout${importCounter.value++}`;
      imports += `import ${layoutName} from '/${node.layout}';\n`;
      element = `React.createElement(${layoutName}, null, ${element})`;
    }

    for (const layout of layoutStack.reverse()) {
      element = `React.createElement(${layout}, null, ${element})`;
    }

    return element;
  }

  walk(tree, "", []);

  const code = `${imports}\nexport const routes = [${routeObjects}];`;

  return code;
}
