"use client"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form-shadcn"
import { baseInventoryFormSchema } from "@/lib/formSchema/baseInventoryFormSchema.zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { trpc } from "@/app/_trpc/client";

export const CreateBaseInventory = () => {
    
    const createBaseInventory = trpc.viewer.baseSkuInventory.addBaseSkuInventory.useMutation();
    const form = useForm<z.infer<typeof baseInventoryFormSchema>>({
        resolver: zodResolver(baseInventoryFormSchema)
    });

    const onSubmit = (values: z.infer<typeof baseInventoryFormSchema>) => {
        createBaseInventory.mutate([{...values}]);
    };

    return (
        <>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className=" space-y-3 p-3 text-black rounded-xl">
                <FormField
                    control={form.control}
                    name="baseSku"
                    render={({ field } ) => (
                        <FormItem className="basis-1/2 flex flex-col">
                            <FormLabel className="font-semibold text-md">SKU</FormLabel>
                            <FormControl className="pl-2 text-sm">
                                <input className=" p-2 border border-black rounded-md" placeholder="SKU of the base item" {...field}/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field } ) => (
                        <FormItem className="basis-1/2 flex flex-col">
                            <FormLabel className="font-semibold ">Quantity</FormLabel>
                            <FormControl className="pl-2 text-sm">
                                <input className=" p-2 border border-black rounded-md" type="number" placeholder="Quantity of item" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="size"
                    render={({ field } ) => (
                        <FormItem className="basis-1/2 flex flex-col">
                            <FormLabel className="font-semibold ">Size</FormLabel>
                            <FormControl className="pl-2 text-sm">
                                <input className=" p-2 border border-black rounded-md" type="string" placeholder="Size of item" {...field}/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="color"
                    render={({ field } ) => (
                        <FormItem className="basis-1/2 flex flex-col">
                            <FormLabel className="font-semibold ">Color</FormLabel>
                            <FormControl className="pl-2 text-sm">
                                <input className=" p-2 border border-black rounded-md" type="string" placeholder="Color of the item" {...field}/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <Button type="submit" onClick={()=> console.log()}>{createBaseInventory.isLoading ? "Creating" : "Create"}</Button>
            </form>
        </Form>
        </>
    )
}