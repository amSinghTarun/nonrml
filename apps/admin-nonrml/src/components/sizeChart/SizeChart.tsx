"use client";

import React, { useRef } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronRight } from "lucide-react";
import { RouterOutput, trpc } from "@/app/_trpc/client";
import { redirect } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type SizeChartEntry = (
  RouterOutput["viewer"]["sizeChart"]["getSizeChart"]["data"][number] & {children?: RouterOutput["viewer"]["sizeChart"]["getSizeChart"]["data"]}
)

interface SizeChartTableProps {
  sizeChartData: SizeChartEntry[];
}

export const SizeChartHierarchyTable = ({ sizeChartData }: SizeChartTableProps) => {

  const [expandedEntries, setExpandedEntries] = React.useState<Set<number>>(new Set());
  
  const deleteSizeValue = trpc.viewer.sizeChart.deleteSizeChart.useMutation();
  const editSizeValue = trpc.viewer.sizeChart.editSizeChart.useMutation();

  const sizeChartValue = useRef<{[identifier: number]: number}>({});

  const toggleEntry = (entryId: number) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };

  const renderSizeChartRow = (entry: SizeChartEntry, level: number = 0) => {
    const isExpanded = expandedEntries.has(entry.id);
    const hasChildren = entry.children && entry.children.length > 0;

    return (
      <React.Fragment key={entry.id}>
        <TableRow className="hover:bg-gray-50">
          
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <TableCell className="hover:bg-stone-400">{entry.id}</TableCell>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-stone-700 text-white">
            <DropdownMenuItem onClick={async() =>{ console.log(sizeChartValue.current); await editSizeValue.mutateAsync({chartId: entry.id, value: +sizeChartValue.current[entry.id]})} }>Update</DropdownMenuItem>
            <DropdownMenuItem onClick={async () => {await deleteSizeValue.mutateAsync({id: entry.id})}}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

          <TableCell className="font-medium">
            <div className="flex items-center" style={{ paddingLeft: `${level * 24}px` }}>
              {hasChildren && (
                <button
                  onClick={() => toggleEntry(entry.id)}
                  className="p-1 hover:bg-gray-100 rounded-full mr-1"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              )}
              {!hasChildren && <div className="w-6" />}
              {entry.name}
            </div>
          </TableCell>
          <TableCell>{entry.value ? <input placeholder={entry.value} onChange={(e) => sizeChartValue.current = {...sizeChartValue.current, [entry.id]: +e.target.value}}></input> : <button className="p-1 bg-stone-400 rounded-sm" onClick={() => {redirect("/create/sizeChart/"+entry.id)}}>Add sub</button>}</TableCell>
          <TableCell>{entry.type}</TableCell>
        </TableRow>
        {isExpanded &&
          hasChildren &&
          entry.children?.map((child) => renderSizeChartRow(child, level + 1))}
      </React.Fragment>
    );
  };

  const organizeHierarchy = (entries: SizeChartEntry[]): SizeChartEntry[] => {
    const entryMap = new Map<number, SizeChartEntry>();
    const rootEntries: SizeChartEntry[] = [];
    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

    // Map all entries by ID
    entries?.forEach((entry) => {
      entryMap.set(entry.id, { ...entry, children: [] });
    });

    // Organize entries into hierarchy
    entries?.forEach((entry) => {
      const currentEntry = entryMap.get(entry.id)!;
      if (entry.parentId === null) {
        rootEntries.push(currentEntry);
      } else {
        const parentEntry = entryMap.get(entry.parentId!);
        if (parentEntry) {
          parentEntry.children = parentEntry.children || [];
          parentEntry.children.push(currentEntry);
        }
      }
    });

    // Sort children by size order
    const sortChildren = (entry: SizeChartEntry) => {
      if (entry.children && entry.children.length > 0) {
        entry.children.sort((a, b) => {
          const indexA = sizeOrder.indexOf(a.name);
          const indexB = sizeOrder.indexOf(b.name);
          // If size not in order array, push to end
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });
        entry.children.forEach(sortChildren);
      }
    };

    rootEntries.forEach(sortChildren);

    return rootEntries;
  };

  const hierarchicalEntries = organizeHierarchy(sizeChartData);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="bg-stone-300">ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hierarchicalEntries.map((entry) => renderSizeChartRow(entry))}
        </TableBody>
      </Table>
    </div>
  );
};