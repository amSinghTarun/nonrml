import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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
