"use client"

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Trash } from "lucide-react";
import { sizeChartSchema } from "@/lib/formSchema/sizeChartFormSchema.zod"
import { prismaEnums } from "@nonrml/prisma";
import { trpc } from "@/app/_trpc/client";
import { useRouter } from "next/navigation";

type SizeChartFormValues = z.infer<typeof sizeChartSchema>;

interface SizeChartFormProps {
  parentId?: number;
  parentName?: string;
  parentType?: keyof typeof prismaEnums.SizeType;
  onComplete?: () => void;
}

export const SizeChartForm = ({ parentId, parentName, parentType, onComplete }: SizeChartFormProps) => {
  const router = useRouter();
  const [sizeChart, setSizeChart] = useState<SizeChartFormValues[]>([]);
  const [successMessage, setSuccessMessage] = useState("");

  const addSizeChart = trpc.viewer.sizeChart.addSizeChart.useMutation({
    onSuccess: () => {
      setSuccessMessage("Size chart entries successfully uploaded!");
      // Clear the form
      setSizeChart([]);
      
      // Either redirect or call onComplete callback
      if (onComplete) {
        setTimeout(() => {
          onComplete();
        }, 1500);
      } else {
        setTimeout(() => {
          router.push("/sizeChart");
        }, 1500);
      }
    }
  });

  const {
    handleSubmit,
    control,
    reset,
    register,
    formState: { errors },
    setValue,
  } = useForm<SizeChartFormValues>({
    resolver: zodResolver(sizeChartSchema),
    defaultValues: {
      name: "",
      value: "",
      type: parentType ? getNextTypeForParent(parentType) : "DISPLAY_NAME",
      parentId: parentId,
      sortOrder: 0,
    },
  });

  // Function to determine the next type based on parent type
  function getNextTypeForParent(type: keyof typeof prismaEnums.SizeType): keyof typeof prismaEnums.SizeType {
    if (type === "DISPLAY_NAME") return "MEASUREMENT_TYPE";
    if (type === "MEASUREMENT_TYPE") return "SIZE_VALUE";
    return "DISPLAY_NAME";
  }

  // Set initial values when props change
  React.useEffect(() => {
    if (parentId) {
      setValue("parentId", parentId);
    }
    
    if (parentType) {
      setValue("type", getNextTypeForParent(parentType));
    }
  }, [parentId, parentType, setValue]);

  const onSubmit = (data: SizeChartFormValues) => {
    // Ensure parentId is correctly set
    const formattedData = {
      ...data,
      parentId: data.parentId || parentId
    };
    
    setSizeChart((prev) => [...prev, formattedData]);
    reset({
      ...data,
      name: "",
      value: "",
      sortOrder: data.sortOrder + 1,
    });
  };

  const handleDelete = (index: number) => {
    setSizeChart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveAll = async () => {
    if (sizeChart.length === 0) return;
    try {
      await addSizeChart.mutateAsync(sizeChart);
    } catch (error) {
      console.error("Failed to save size chart entries:", error);
    }
  };

  return (
    <div className="space-y-3 p-2">
      <div className="flex flex-row justify-between">
        <h1 className="text-lg font-bold">Size Chart Manager</h1>
        <Button 
          onClick={handleSaveAll} 
          className="text-sm rounded-sm p-2 font-bold bg-stone-400 text-stone-800 hover:bg-stone-300"
          disabled={sizeChart.length === 0 || addSizeChart.isLoading}
        >
          {addSizeChart.isLoading ? "UPLOADING..." : "UPLOAD ALL"}
        </Button>
      </div>

      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-2 rounded">
          {successMessage}
        </div>
      )}

      {/* Parent info display */}
      {parentId && parentName && (
        <div className="bg-stone-100 p-2 rounded mb-4">
          <p className="text-sm font-medium">Adding entries under: <span className="font-bold">{parentName}</span></p>
          {parentType && <p className="text-sm">Parent type: {parentType}</p>}
        </div>
      )}

      {/* Add Entry Form */}
      {/* <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium">
              Type
            </label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type">{field.value}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {!parentType && <SelectItem value="DISPLAY_NAME">Display Name (OVERSIZE T_SHIRT, JEANS ... )</SelectItem>}
                    {parentType && parentType === "DISPLAY_NAME" && <SelectItem value="MEASUREMENT_TYPE">Measurement Type (CHEST, WAIST ...)</SelectItem>}
                    {parentType && parentType === "MEASUREMENT_TYPE" && <SelectItem value="SIZE_VALUE">Size Value (XS, S, M)</SelectItem>}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
          </div>

          <div>
            <label htmlFor="parentId" className="block text-sm font-medium">
              Parent Entry
            </label>
            <Controller
              name="parentId"
              control={control}
              render={() => (
                <div className="border p-2 rounded bg-gray-50">
                  {parentName || "Root"}
                </div>
              )}
            />
            {errors.parentId && <p className="text-red-500 text-sm">{errors.parentId.message}</p>}
          </div>

          <div>
            <label htmlFor="sortOrder" className="block text-sm font-medium">
              Sort Order
            </label>
            <Input
              id="sortOrder"
              type="number"
              placeholder="e.g., 0"
              {...register("sortOrder", { valueAsNumber: true })}
            />
            {errors.sortOrder && <p className="text-red-500 text-sm">{errors.sortOrder.message}</p>}
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Name
            </label>
            <Input
              id="name"
              placeholder={
                !parentType 
                  ? "OVERSIZE T-SHIRT" 
                  : parentType === "DISPLAY_NAME" 
                    ? "CHEST, WAIST"
                    : parentType === "MEASUREMENT_TYPE" 
                      ? "XS, S, M"
                      : ""
              }
              {...register("name")}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          {((!parentType && false) || (parentType === "MEASUREMENT_TYPE")) && (
            <div>
              <label htmlFor="value" className="block text-sm font-medium">
                Value
              </label>
              <Input 
                id="value" 
                placeholder="32, 28, 32" 
                {...register("value")} 
              />
              {errors.value && <p className="text-red-500 text-sm">{errors.value.message}</p>}
            </div>
          )}
        </div>

        <Button type="submit" className="flex item-center mt-4 bg-stone-700">
          Add Entry
        </Button>
      </form> */}

      {/* Size Chart Table */}
      {sizeChart.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Sort Order</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sizeChart.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.value || "N/A"}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>{item.sortOrder}</TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(index)}
                    className="flex items-center space-x-1"
                  >
                    <Trash className="h-4 w-4" />
                    <span>Delete</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};