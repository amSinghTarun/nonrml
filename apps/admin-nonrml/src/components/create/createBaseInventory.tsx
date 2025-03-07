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
import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";

export const CreateBaseInventory = () => {
    const [showSuccess, setShowSuccess] = useState(false);
    
    const form = useForm<z.infer<typeof baseInventoryFormSchema>>({
        resolver: zodResolver(baseInventoryFormSchema),
        defaultValues: {
            baseSku: "",
            quantity: 0,
            size: "",
            color: ""
        }
    });
    
    const createBaseInventory = trpc.viewer.baseSkuInventory.addBaseSkuInventory.useMutation({
        onSuccess: () => {
            setShowSuccess(true);
            // Reset form with explicit defaultValues to ensure UI is cleared
            form.reset({
                baseSku: "",
                quantity: 0,
                size: "",
                color: ""
            });
        }
    });

    const onSubmit = (values: z.infer<typeof baseInventoryFormSchema>) => {
        createBaseInventory.mutate([{...values}]);
    };
    
    // Auto-hide the success notification after 5 seconds
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (showSuccess) {
            timer = setTimeout(() => {
                setShowSuccess(false);
            }, 5000);
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [showSuccess]);

    return (
        <>
        {/* Success Notification */}
        {showSuccess && (
            <div className="fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md flex items-center justify-between max-w-md animate-fade-in-down z-50">
                <div className="flex items-center">
                    <Check className="h-5 w-5 mr-2" />
                    <span>Base inventory item created successfully!</span>
                </div>
                <button 
                    onClick={() => setShowSuccess(false)}
                    className="text-green-700 hover:text-green-900"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        )}
        
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 p-3 text-black rounded-xl">
                <FormField
                    control={form.control}
                    name="baseSku"
                    render={({ field } ) => (
                        <FormItem className="basis-1/2 flex flex-col">
                            <FormLabel className="font-semibold text-md">SKU</FormLabel>
                            <FormControl className="pl-2 text-sm">
                                <input className="p-2 border border-black rounded-md" placeholder="SKU of the base item" {...field}/>
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
                            <FormLabel className="font-semibold">Quantity</FormLabel>
                            <FormControl className="pl-2 text-sm">
                                <input className="p-2 border border-black rounded-md" type="number" placeholder="Quantity of item" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
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
                            <FormLabel className="font-semibold">Size</FormLabel>
                            <FormControl className="pl-2 text-sm">
                                <input className="p-2 border border-black rounded-md" type="string" placeholder="Size of item" {...field}/>
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
                            <FormLabel className="font-semibold">Color</FormLabel>
                            <FormControl className="pl-2 text-sm">
                                <input className="p-2 border border-black rounded-md" type="string" placeholder="Color of the item" {...field}/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <Button 
                    type="submit" 
                    disabled={createBaseInventory.isLoading}
                    className="bg-neutral-600 hover:bg-neutral-700"
                >
                    {createBaseInventory.isLoading ? "Creating..." : "Create"}
                </Button>
            </form>
        </Form>
        </>
    )
}