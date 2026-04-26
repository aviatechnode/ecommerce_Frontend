type TreeCategory = {
  id: string;
  name: string;
  parentId?: string | null;
  children: TreeCategory[];
};

export const buildTree = (categories: any[]): TreeCategory[] => {
  const map = new Map<string, TreeCategory>();
  const roots: TreeCategory[] = [];

  // Step 1: normalize (ALWAYS create children array)
  categories.forEach((cat) => {
    map.set(cat.id, {
      ...cat,
      children: [],
    });
  });

  // Step 2: build hierarchy
  categories.forEach((cat) => {
    const node = map.get(cat.id)!;

    if (cat.parentId) {
      const parent = map.get(cat.parentId);

      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node); // fallback if parent not found
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
};