/* eslint-disable @typescript-eslint/no-explicit-any */

export const transformToHierarchy = (flatEntries: any[]) => {
  const map: Record<number, any> = {};
  const roots: any[] = [];

  flatEntries.forEach((entry) => {
    map[entry.id] = { ...entry, children: [] };
  });

  flatEntries.forEach((entry) => {
    if (entry.parentId) {
      map[entry.parentId].children.push(map[entry.id]);
    } else {
      roots.push(map[entry.id]);
    }
  });

  return roots;
};
