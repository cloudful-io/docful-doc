interface HastNode {
  type?: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

function textContent(node: HastNode): string {
  if (typeof node.value === "string") return node.value;
  return (node.children ?? []).map(textContent).join(" ");
}

function findCheckbox(node: HastNode): HastNode | undefined {
  if (
    node.type === "element" &&
    node.tagName === "input" &&
    node.properties?.type === "checkbox"
  ) {
    return node;
  }
  for (const child of node.children ?? []) {
    const found = findCheckbox(child);
    if (found) return found;
  }
  return undefined;
}

export default function rehypeTaskListLabels() {
  return (tree: HastNode) => {
    const visit = (node: HastNode): void => {
      if (node.type === "element" && node.tagName === "pre") {
        node.properties ??= {};
        node.properties.tabIndex = 0;
        node.properties.ariaLabel = "Code sample";
      }
      if (node.type === "element" && node.tagName === "li") {
        const classes = node.properties?.className;
        const isTask =
          Array.isArray(classes) && classes.includes("task-list-item");
        if (isTask) {
          const checkbox = findCheckbox(node);
          const label = textContent(node).replace(/\s+/g, " ").trim();
          if (checkbox?.properties)
            checkbox.properties.ariaLabel = label || "Task item";
        }
      }
      node.children?.forEach(visit);
    };
    visit(tree);
  };
}
