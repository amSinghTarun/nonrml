"use client"

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { Trash } from "lucide-react";
import { sizeChartSchema } from "@/lib/formSchema/sizeChartFormSchema.zod"
import { prismaEnums } from "@nonrml/prisma";
import { trpc } from "@/app/_trpc/client";
import { redirect } from "next/navigation";

type SizeChartFormValues = z.infer<typeof sizeChartSchema>;

export const SizeChartForm = ({parentId, parentName, parentType} : {parentId?: number, parentName?: string, parentType?: keyof typeof prismaEnums.SizeType}) => {

  const [sizeChart, setSizeChart] = useState<SizeChartFormValues[]>([]);

  const addSizeChart = trpc.viewer.sizeChart.addSizeChart.useMutation();

  const {
    handleSubmit,
    control,
    reset,
    register,
    formState: { errors },
  } = useForm<SizeChartFormValues>({
    resolver: zodResolver(sizeChartSchema),
    defaultValues: {
      name: "",
      value: "",
      type: "MEASUREMENT_TYPE",
      parentId: undefined,
      sortOrder: 0,
    },
  });

  const onSubmit = (data: SizeChartFormValues) => {
    const id = sizeChart.length + 1;
    setSizeChart((prev) => [...prev, { ...data, parentId: data.parentId || undefined }]);
    reset();
  };

  const handleDelete = (index: number) => {
    setSizeChart((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3 p-2">
      <div className="flex flex-row justify-between">
        <h1 className="text-lg font-bold">Size Chart Manager</h1>
        <h1 onClick={async () => {await addSizeChart.mutateAsync(sizeChart);redirect("/sizeChart")}} className="text-sm rounded-sm p-2 font-bold bg-stone-400 text-stone-800 cursor-pointer hover:bg-stone-300 text">{addSizeChart.isLoading ? "UPLOADING" : "UPLOAD"}</h1>
      </div>

      {/* Add Entry Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                  defaultValue={undefined}
                >
                  < SelectTrigger>{field.value}</ SelectTrigger>
                  <SelectContent>
                    {!parentType && <SelectItem value="DISPLAY_NAME">Display Name (OVERSIZE T_SHIRT, JEANS ... )</SelectItem>}
                    { parentType && parentType == "DISPLAY_NAME" && <SelectItem value="MEASUREMENT_TYPE">Measurement Type (CHEST, WAIST ...)</SelectItem>}
                    { parentType && parentType == "MEASUREMENT_TYPE" && <SelectItem value="SIZE_VALUE">Size Value (XS, S, M)</SelectItem>}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div>
            <label htmlFor="parentId" className="block text-sm font-medium">
              Parent Entry
            </label>
            <Controller
              name="parentId"
              control={control}
              defaultValue={parentId}
              render={({ field }) => <span>{parentName}</span> }
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
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Name
            </label>
            <Input
              id="name"
              placeholder={` ${(!parentType && "OVERSIZE t-shirt" )} ${((parentType && parentType == "DISPLAY_NAME") && "CHEST, WAIST" )} ${((parentType && parentType == "MEASUREMENT_TYPE") && "XS, S" )}`}
              {...register("name")}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          {parentType && parentType == "MEASUREMENT_TYPE" && <div>
            <label htmlFor="value" className="block text-sm font-medium">
              Value
            </label>
            <Input id="value" placeholder="32, 28, 32 " {...register("value")} />
            {errors.value && <p className="text-red-500 text-sm">{errors.value.message}</p>}
          </div>}

        </div>

        <Button type="submit" className="flex item-center mt-4 bg-stone-700">
          Add Size Chart Entry
        </Button>
      </form>

      {/* Size Chart Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Parent ID</TableHead>
            <TableHead>Sort Order</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sizeChart.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.value || "N/A"}</TableCell>
              <TableCell>{item.type}</TableCell>
              <TableCell>{item.parentId || "Root"}</TableCell>
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
    </div>
  );
}
