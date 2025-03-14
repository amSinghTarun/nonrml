"use client"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form-shadcn"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { trpc } from "@/app/_trpc/client";
import { productCreateFormSchema } from "@/lib/formSchema/productFormSchema.zod";
import { redirect } from "next/navigation";

export const CreateProduct = () => {

    const createProduct = trpc.viewer.product.addProduct.useMutation({
        onSuccess: (response) => {
            redirect(`/products/${response.data.sku}`);
        }
    });

    const form = useForm<z.infer<typeof productCreateFormSchema>>({
        resolver: zodResolver(productCreateFormSchema)
    });

    const onSubmit = (values: z.infer<typeof productCreateFormSchema>) => {
        const newData = {
            name: values.name,
            colour: values.colour,
            price: Number(values.price),
            tags: values.tags.split(","),
            categoryId: Number(values.categoryId),
            description: values.description,
            inspiration: values.inspiration,
            shippingDetails: values.care.split(","),
            care: values.care.split(","),
            details: values.details.split(","),
            sku: values.sku.toUpperCase(),
        }
        createProduct.mutate(newData);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 p-3 text-black rounded-xl">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem className="basis-1/2 flex flex-col">
                            <FormLabel className="font-semibold text-md">Name</FormLabel>
                            <FormControl className="pl-2 text-sm">
                                <input 
                                    className="p-2 border border-black rounded-md" 
                                    placeholder="Enter product name (min. 11 characters)"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem className="basis-1/2 flex flex-col">
                            <FormLabel className="font-semibold">Price</FormLabel>
                            <FormControl className="pl-2 text-sm">
                                <input 
                                    className="p-2 border border-black rounded-md" 
                                    type="number"
                                    placeholder="Enter price (min. value 1)"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="colour"
                    render={({ field }) => (
                        <FormItem className="basis-1/2 flex flex-col">
                            <FormLabel className="font-semibold">Colour</FormLabel>
                            <FormControl className="pl-2 text-sm">
                                <input 
                                    className="p-2 border border-black rounded-md" 
                                    placeholder="Enter colour (min. 3 characters)"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem className="basis-1/2 flex flex-col">
                            <FormLabel className="font-semibold">Description</FormLabel>
                            <FormControl className="pl-2 text-sm">
                                <textarea 
                                    className="p-2 border border-black rounded-md" 
                                    placeholder="Enter product description (min. 20 characters)"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="inspiration"
                    render={({ field }) => (
                        <FormItem className="basis-1/2 flex flex-col">
                            <FormLabel className="font-semibold">Inspiration</FormLabel>
                            <FormControl className="pl-2 text-sm">
                                <textarea 
                                    className="p-2 border border-black rounded-md" 
                                    placeholder="Enter design inspiration (min. 20 characters)"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                        <FormItem className="basis-1/2 flex flex-col">
                            <FormLabel className="font-semibold">Tags (comma-separated)</FormLabel>
                            <FormControl className="pl-2 text-sm">
                                <input 
                                    className="p-2 border border-black rounded-md" 
                                    placeholder="Enter tags separated by commas (e.g., casual,summer,cotton)"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                        <FormItem className="basis-1/2 flex flex-col">
                            <FormLabel className="font-semibold">Category ID</FormLabel>
                            <FormControl className="pl-2 text-sm">
                                <input 
                                    className="p-2 border border-black rounded-md" 
                                    type="number"
                                    placeholder="Enter category ID (min. value 1)"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="care"
                    render={({ field }) => (
                        <FormItem className="basis-1/2 flex flex-col">
                            <FormLabel className="font-semibold">Care Instructions (comma-separated)</FormLabel>
                            <FormControl className="pl-2 text-sm">
                                <input 
                                    className="p-2 border border-black rounded-md" 
                                    placeholder="Enter care instructions separated by commas (e.g., wash cold,hang dry)"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="shippingDetails"
                    render={({ field }) => (
                        <FormItem className="basis-1/2 flex flex-col">
                            <FormLabel className="font-semibold">Care Instructions (comma-separated)</FormLabel>
                            <FormControl className="pl-2 text-sm">
                                <input 
                                    className="p-2 border border-black rounded-md" 
                                    placeholder="Enter Shipping Details separated by commas (e.g., wash cold,hang dry)"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="details"
                    render={({ field }) => (
                        <FormItem className="basis-1/2 flex flex-col">
                            <FormLabel className="font-semibold">Details (comma-separated)</FormLabel>
                            <FormControl className="pl-2 text-sm">
                                <input 
                                    className="p-2 border border-black rounded-md" 
                                    placeholder="Enter product details separated by commas (e.g., fitted,stretch fabric)"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                        <FormItem className="basis-1/2 flex flex-col">
                            <FormLabel className="font-semibold">SKU</FormLabel>
                            <FormControl className="pl-2 text-sm">
                                <input 
                                    className="p-2 border border-black rounded-md" 
                                    placeholder="Enter SKU (min. 2 characters)"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <Button type="submit">{createProduct.isLoading ? "Creating" : "Create"}</Button>
            </form>
        </Form>
    )
}