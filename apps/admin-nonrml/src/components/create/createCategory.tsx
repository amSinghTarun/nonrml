"use client"

import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form-shadcn";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RouterOutput, trpc } from "@/app/_trpc/client";
import { createCategorySchema } from '@/lib/formSchema/categoryFormSchema.zod';
import { UseTRPCQueryResult } from '@trpc/react-query/shared';
import { redirect } from 'next/navigation';


type FormValues = z.infer<typeof createCategorySchema>;
type Categories = UseTRPCQueryResult<RouterOutput["viewer"]["productCategories"]["getProductCategories"], unknown>

export const CreateProductCategory = ({categoriesQuery}:{categoriesQuery: Categories}) =>  {
    // Get existing categories for parent selection
    const categories = categoriesQuery.data?.adminCategories;
    const createCategory = trpc.viewer.productCategories.addProductCategories.useMutation({
        onSuccess: () => {
            form.reset();
            redirect("/category");
        },
    });

    const form = useForm<FormValues>({
        resolver: zodResolver(createCategorySchema),
        defaultValues: {
            categoryName: "",
            displayName: "",
            parentId: undefined,
        },
    });

    const onSubmit = (values: FormValues) => {
        createCategory.mutate({
            categoryName: values.categoryName,
            displayName: values.displayName,
            parentId: Number(values.parentId),
        });
    };

    return (
        <div className="container mx-auto p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Product Category</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="categoryName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category Name</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="Enter category name" 
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="displayName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Display Name</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="Enter display name" 
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="parentId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Parent Category</FormLabel>
                                        <Select 
                                            onValueChange={(value) => field.onChange(value ? Number(value) : undefined)} 
                                            value={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select parent category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categories?.map((category) => (
                                                    <SelectItem 
                                                        key={category.id} 
                                                        value={category.id.toString()}
                                                    >
                                                        {category.displayName || category.categoryName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button 
                                type="submit" 
                                className="w-full"
                                disabled={createCategory.isLoading}
                            >
                                {createCategory.isLoading ? "Creating..." : "Create Category"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}