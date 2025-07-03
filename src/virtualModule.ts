import type { Node } from "./types";

export function generateRoutesVirtualModule(tree: Node): string {
  let imports = `import React from "react";\n`;
  imports += `import { ErrorBoundary } from "react-error-boundary";\n`;

  let routeObjects = "";
  const importCounter = { value: 0 };

  function walk(
    node: Node,
    parentPath: string,
    layoutStack: string[],
    errorStack: string[],
    loadingStack: string[],
    notFoundStack: string[]
  ) {
    if (!node) return;

    let currentErrorStack = [...errorStack];
    if (node.error) {
      const errorName = `Error${importCounter.value++}`;
      imports += `import ${errorName} from '/${node.error}';\n`;
      currentErrorStack.push(errorName);
    }

    let currentLayoutStack = [...layoutStack];
    if (node.layout) {
      const layoutName = `Layout${importCounter.value++}`;
      imports += `import ${layoutName} from '/${node.layout}';\n`;
      currentLayoutStack.push(layoutName);
    }

    let currentLoadingStack = [...loadingStack];
    if (node.loading) {
      const loadingName = `Loading${importCounter.value++}`;
      imports += `import ${loadingName} from '/${node.loading}';\n`;
      currentLoadingStack.push(loadingName);
    }

    let currentNotFoundStack = [...notFoundStack];
    if (node.notFound) {
      const notFoundName = `NotFound${importCounter.value++}`;
      imports += `import ${notFoundName} from '/${node.notFound}';\n`;
      currentNotFoundStack.push(notFoundName);
    }

    // Generate not-found route if this node has layout or page
    if (node.page || node.layout) {
      if (currentNotFoundStack.length > 0) {
        const nearestNotFound =
          currentNotFoundStack[currentNotFoundStack.length - 1];
        const notFoundPath = parentPath === "" ? "*" : parentPath + "/*";

        if (!routeObjects.includes(`path: '${notFoundPath}'`)) {
          routeObjects += `{
            path: '${notFoundPath}',
            element: React.createElement(${nearestNotFound})
          },\n`;
        }
      }
    }

    if (
      node.children?.length &&
      node.children.every((c) => c.segment.startsWith("("))
    ) {
      // parallel routes
      const parallelElements = node.children
        .map((groupNode) =>
          generateElementForNode(
            groupNode,
            parentPath,
            currentLayoutStack,
            currentErrorStack,
            currentLoadingStack
          )
        )
        .join(",");

      routeObjects += `{
        path: '${parentPath === "" ? "/" : "/" + parentPath}',
        element: React.createElement(React.Fragment, null, ${parallelElements})
      },\n`;

      return;
    }

    if (node.page) {
      const element = generateElementForNode(
        node,
        parentPath,
        currentLayoutStack,
        currentErrorStack,
        currentLoadingStack
      );

      const routePath = parentPath === "" ? "/" : "/" + parentPath;

      routeObjects += `{
        path: '${routePath}',
        element: ${element}
      },\n`;
    }

    for (const child of node.children || []) {
      let childPath = parentPath;
      if (child.pathSegment) {
        childPath = childPath
          ? `${childPath}/${child.pathSegment}`
          : child.pathSegment;
      }

      walk(
        child,
        childPath,
        currentLayoutStack,
        currentErrorStack,
        currentLoadingStack,
        currentNotFoundStack
      );
    }
  }

  function generateElementForNode(
    node: Node,
    path: string,
    layoutStack: string[],
    errorStack: string[],
    loadingStack: string[]
  ) {
    const pageName = `Page${importCounter.value++}`;
    imports += `import ${pageName} from '/${node.page}';\n`;

    let element = `React.createElement(${pageName})`;

    // Bubble loading
    if (loadingStack.length > 0) {
      const nearestLoading = loadingStack[loadingStack.length - 1];
      element = `React.createElement(React.Suspense, { fallback: React.createElement(${nearestLoading}) }, ${element})`;
    }

    // Bubble layout
    for (const layout of layoutStack.reverse()) {
      element = `React.createElement(${layout}, null, ${element})`;
    }

    // Bubble error
    if (errorStack.length > 0) {
      const nearestError = errorStack[errorStack.length - 1];
      element = `React.createElement(ErrorBoundary, { FallbackComponent: ${nearestError} }, ${element})`;
    }

    return element;
  }

  walk(tree, "", [], [], [], []);

  const code = `${imports}\nexport const routes = [${routeObjects}];`;

  return code;
}
