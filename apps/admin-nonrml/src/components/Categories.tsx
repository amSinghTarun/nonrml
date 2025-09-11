"use client"

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronDown, ChevronRight } from "lucide-react"
import { RouterOutput, trpc } from '@/app/_trpc/client';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type ProductCategory = RouterOutput["viewer"]["productCategories"]["getProductCategories"]["adminCategories"][number] & { children?: ProductCategory[] } ;

interface CategoryTableProps {
  categories: ProductCategory[];
} 

export const CategoryHierarchyTable = ({ categories }: CategoryTableProps) => {
  
  const [expandedCategories, setExpandedCategories] = React.useState<Set<number>>(new Set());
  
  const allSizeCharts = trpc.viewer.sizeChart.getSizeChart.useQuery({type: "DISPLAY_NAME"});
  const addSizeChartToCategory = trpc.viewer.productCategories.editProductCategories.useMutation({});
  const deleteProductCategory = trpc.viewer.productCategories.deleteProductCategories.useMutation({});

  const toggleCategory = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const renderCategoryRow = (category: ProductCategory, level: number = 0) => {
    const isExpanded = expandedCategories.has(category.id);
    const hasChildren = category.children && category.children.length > 0;

    return (
      <React.Fragment key={category.id}>
        <TableRow className="hover:bg-gray-50">
          <TableCell>{category.id}</TableCell>
          <TableCell className="font-medium">
            <div className="flex items-center" style={{ paddingLeft: `${level * 24}px` }}>
              {hasChildren && (
                <button
                  onClick={() => toggleCategory(category.id)}
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
              {category.categoryName}
            </div>
          </TableCell>
          <TableCell>{category.displayName || '-'}</TableCell>
          <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className='p-1 rounded-md bg-stone-400 hover:bg-stone-200' onClick={() => {}}>{category.sizeChartId ?? "+ SizeChart"}</button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-stone-700 text-white">{
                allSizeCharts.data?.data.map( sizeChart => (
                  <>
                    <DropdownMenuItem key={sizeChart.id} onClick={() => {addSizeChartToCategory.mutate({sizeChartId: sizeChart.id, productCategoryId: category.id})}}>{sizeChart.name}</DropdownMenuItem>  
                    <DropdownMenuItem onClick={() => {addSizeChartToCategory.mutate({sizeChartId: -1, productCategoryId: category.id})}}>REMOVE</DropdownMenuItem>  
                  </>
              ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
          <TableCell>{new Date(category.createdAt).toLocaleDateString()}</TableCell>
          <TableCell>{new Date(category.updatedAt).toLocaleDateString()}</TableCell>
          <TableCell><button className='bg-stone-400 p-1 rounded-sm hover:bg-stone-200' onClick={() => deleteProductCategory.mutate({id: category.id})}>{deleteProductCategory.variables?.id == category.id ? "Deleting" : "Delete"}</button></TableCell>
        </TableRow>
        {isExpanded &&
          hasChildren &&
          category.children?.map((child) => renderCategoryRow(child, level + 1))}
      </React.Fragment>
    );
  };

  const organizeHierarchy = (categories: ProductCategory[]): ProductCategory[] => {
    const categoryMap = new Map<number, ProductCategory>();
    const rootCategories: ProductCategory[] = [];

    // First pass: map all categories by ID
    categories?.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    // Second pass: organize into hierarchy
    categories?.forEach(category => {
      const currentCategory = categoryMap.get(category.id)!;
      if (category.parentId === null) {
        rootCategories.push(currentCategory);
      } else {
        const parentCategory = categoryMap.get(category.parentId);
        if (parentCategory) {
          parentCategory.children = parentCategory.children || [];
          parentCategory.children.push(currentCategory);
        }
      }
    });

    return rootCategories;
  };

  const hierarchicalCategories = organizeHierarchy(categories);

  return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Category Name</TableHead>
            <TableHead>Display Name</TableHead>
            <TableHead>Size Chart</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Updated At</TableHead>
            <TableHead>Delete</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hierarchicalCategories.map((category) => renderCategoryRow(category))}
        </TableBody>
      </Table>
  )
};

export default CategoryHierarchyTable;