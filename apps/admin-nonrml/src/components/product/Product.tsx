/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
 
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form-shadcn"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { productUpdateFormSchema as formSchema } from "@/lib/formSchema/productFormSchema.zod"
import { RouterOutput, trpc } from "@/app/_trpc/client"
import Image from "next/image"
import { FileUpload } from "@nonrml/components";
import { productImageFormSchema } from "@/lib/formSchema/uploadImageFormSchema.zod"
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { UseTRPCQueryResult } from "@trpc/react-query/shared"
import { convertFileToDataURL } from "@nonrml/common"
import { uploadToSignedURL } from "@nonrml/storage";

type Product = UseTRPCQueryResult<RouterOutput["viewer"]["product"]["getAdminProduct"], unknown>;

export const Product = ({productDetails}: {productDetails: Product}) => {

    console.log(productDetails.data?.data.product.ProductVariants)
    const router = useRouter();
    const productSizes = productDetails.data?.data.avlSizes;
    const [ priorityIndex, setPriorityIndex ] = useState<{[imageId: number]: number}>();
    const [ editProduct, setEditProduct ] = useState<boolean>();
    const [ error, setError ] = useState<any>();
    const handlePriorityIndexOfImage = ({imageId, priorityIndex}: {imageId: number, priorityIndex: number}) => {
        setPriorityIndex((prev) => ({...prev, [imageId]:priorityIndex }) )
    }
    
    const addVariantToInventory = trpc.viewer.inventory.createInventory.useMutation({
        onSuccess: () => {
            productDetails.refetch();
        }
    });
    const deleteVariant = trpc.viewer.productVariant.deleteProductVariant.useMutation({
        onSuccess: () => {
            productDetails.refetch();
        }
    });
    const addVariant = trpc.viewer.productVariant.addProductVariants.useMutation({
        onSuccess: () => {
            productDetails.refetch();
        }
    });
    const editImageProps = trpc.viewer.productImages.editProductImage.useMutation({
        onSuccess: () => {
            productDetails.refetch();
        }
    });
    const deleteImage = trpc.viewer.productImages.deleteProductImage.useMutation({
        onSuccess: () => {
            productDetails.refetch();
        }
    });
    const editImagePriorityIndex = trpc.viewer.productImages.editImagePriorityIndexImage.useMutation({
        onSuccess: () => {
            productDetails.refetch();
        }
    });
    const addProductImage = trpc.viewer.productImages.addProductImage.useMutation({
        onSuccess: () => {
            productDetails.refetch();
            imageUploadForm.reset();
        }
    });
    
    const getSignedImageUrl = trpc.viewer.productImages.getSignedImageUploadUrl.useMutation({});

    const updateProductDetails = trpc.viewer.product.editProduct.useMutation({
        onSuccess: () => {
            productDetails.refetch();
            form.reset({});
        }
    });

    const deleteProduct = trpc.viewer.product.deleteProduct.useMutation({
        onSuccess: () => {
            router.push("/products")
        }
    });


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema)
    });
    const imageUploadForm = useForm<z.infer<typeof productImageFormSchema>>({
        resolver: zodResolver(productImageFormSchema),
        defaultValues: {image: undefined, priorityIndex: 0, active: false}
    });
    
    const product = productDetails.data?.data.product;
    if(!product)
        return <>PRODUCT MISSING</>

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try{
            console.log("editproduc");
            if(editProduct){
                console.log(values);
                const updateData = {
                    ...(values.name && {name: values.name}),
                    ...(values.description && {description: values.description}),
                    ...(values.inspiration && {inspiration: values.inspiration}),
                    ...(!isNaN(Number(values.price)) && {price: +values.price!}),
                    ...(values.colour && {colour: values.colour}),
                    ...(values.care && {care: values.care.split(",")}),
                    ...(values.shippingDetails && {care: values.shippingDetails.split(",")}),
                    ...(values.details && {details: values.details.split(",")}),
                    ...(!isNaN(Number(values.categoryId)) && {categoryId: +values.categoryId!}),
                    ...(values.tags && {tags: values.tags.split(",")})
                }
                await updateProductDetails.mutateAsync({...updateData, productId: product.id});
            }
        } catch(error) {
            setError(error)
        }
    }

    const onImageSubmit = async (values: z.infer<typeof productImageFormSchema>) => {
        try{
            const imageName = `PROD_IMAGE:${product.sku}:${Date.now()}`;
            const signedUrlData = await getSignedImageUrl.mutateAsync({imageName: imageName});
            const res = await fetch(signedUrlData.data.signedUrl, {
                method: "PUT",
                body: values.image,
                headers: {
                    "Content-Type": values.image.type,
                },
            })
            console.log(res)
            await addProductImage.mutateAsync({imagePath: signedUrlData.data.path, priorityIndex: values.priorityIndex,  active: values.active, productId: product.id});
        } catch(error) {
            setError(error);
        }
    }

    if(productDetails.status != "success")
        return <>LOADING...</>

    // Helper function to convert product values to string for the Textarea
    const getTextareaValue = (value: any): string => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'string') return value;
        if (typeof value === 'number') return value.toString();
        if (Array.isArray(value)) return value.join(',');
        if (typeof value === 'object') {
            if (value instanceof Date) return value.toISOString();
            return JSON.stringify(value);
        }
        return String(value);
    };

    return (
        <div className="text-xs">
            {
                error  
                && (<div className=" absolute z-40 backdrop-blur-md w-[100%] h-[100%] justify-center p-5">
                    <div className="relative bg-red-500 text-white rounded-xl p-3 justify-center">
                        <button onClick={() => setError(null)} className="absolute text-black top-1 right-1">X</button>
                        <span>{`${error}`}</span>
                    </div>
                </div>)
            }

            <div className=" m-2 p-4 bg-stone-700 text-white flex flex-col rounded-md text-sm">
                <span>CATEGORIES DETAILS:</span>
                <span> { 
                    productDetails.data?.data.categories.map( category => (
                        ` |__ ${category.categoryName} : ${category.id} __| `
                    ))
                } </span>
            </div>

            <div className="flex m-2 border border-black rounded-lg flex-row p-2 flex-wrap gap-3">
                <span className="py-3 pl-5 w-full text-lg text-center font-semibold "> ACTIONS </span>
                <Button onClick={ async () => {
                    try{
                        await updateProductDetails.mutateAsync({soldOut: !product.soldOut, productId: product.id});
                    } catch(error) {
                        setError(error)
                    }
                }} className="bg-stone-700 p-3 hover:bg-orange-100 text-orange-600 rounded-md text-xs">{product?.soldOut ? `IN STOCK` : `SELL OUT`}</Button>
                <Button className="bg-stone-700 p-3 hover:bg-red-100 text-red-600 rounded-md text-xs" 
                    onClick={ async () => {
                        try{
                            await deleteProduct.mutateAsync({productId: product.id})
                        } catch(error){
                            setError(error)
                        }
                    }}
                >{`DELETE PRODUCT`}</Button>
                <Button onClick={async () => {
                    try{
                        await updateProductDetails.mutateAsync({exclusive: !product.exclusive, productId: product.id});
                    } catch(error) {
                        setError(error)
                    }
                }} 
                className="bg-stone-700 p-3 hover:bg-green-100 text-green-600 rounded-md text-xs">{product?.exclusive ? "REMOVE EXCLUSIVE" : "MAKE EXCLUSIVE"}</Button>
                <Button onClick={() => setEditProduct(!editProduct)} className="text-xs bg-stone-700 p-3 hover:bg-blue-100 text-blue-600 rounded-md">{editProduct ? "BLOCK EDIT" : "UNBLOCK EDIT"}</Button>
            </div>

            <div className="flex p-2 m-2 flex-col border border-black rounded-lg text-xs">
                <div className="flex flex-row justify-between">
                    <span className="py-3 pl-5 text-xl w-auto font-semibold ">DETAILS</span>
                    <span className="p-4 text-xs bg-stone-700 rounded-lg text-white">{`VISITED: ${product?.visitedCount}`}</span>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <div className="flex flex-wrap flex-row"> {
                            product && Object.keys(product).map(productProp => (
                                (productProp in formSchema.shape) ? 
                                <FormField
                                    key={productProp}
                                    control={form.control}
                                    name={ productProp as keyof typeof formSchema.shape }
                                    render={({ field } ) => (
                                        <FormItem className="basis-1/2 p-2 mb-2">
                                            <FormLabel className="text-xs font-semibold ">{productProp.toUpperCase()}</FormLabel>
                                            <FormControl className="bg-stone-700 text-white">
                                                <Textarea 
                                                    defaultValue={getTextareaValue(product[productProp as keyof typeof product])} 
                                                    {...field} 
                                                    onChange={(e) => (isNaN(Number(e.target.value)) ? field.onChange(e.target.value) : field.onChange(+e.target.value) )}
                                                />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                /> : <></>
                            ))
                        } </div>
                        { editProduct && <Button type="submit">Submit</Button> }

                        {form.formState.errors && (
                            <div style={{ color: 'red' }}>
                                <p>Form has errors:</p>
                                <ul>
                                    {Object.keys(form.formState.errors).map(key => (
                                        <li key={key}>
                                            {key}: {form.formState.errors[key]?.message as string}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {/* } */}
                    </form>
                </Form>
            </div>

            <div className="flex p-2 m-2 flex-col border border-black rounded-lg text-xs">
                
                <span className="py-3 pl-5 w-full text-xl text-center font-semibold">IMAGES</span>

                <Form {...imageUploadForm}>
                    <form onSubmit={imageUploadForm.handleSubmit(onImageSubmit)} className="space-y-2 text-white bg-stone-400 rounded-xl">
                        <div className="justify-between flex p-3">
                            <span>UPLOAD NEW IMAGE</span>
                            <Button type="submit" className="bg-stone-600 hover:bg-stone-200 hover:text-black">Upload{addProductImage.isLoading ? "ing" : ""}</Button>
                        </div>

                        <div className="flex flex-row p-2 gap-2">
                            <FormField
                                control={imageUploadForm.control}
                                name="image"
                                render={({ field }) => {
                                    // Create a custom onUpload handler for the FileUpload component
                                    const handleFileUpload = async (files: File[]) => {
                                        if (files.length > 0) {
                                            field.onChange(files[0]);
                                        }
                                    };
                                    
                                    // Create a custom onFileDelete handler
                                    const handleFileDelete = (index: number) => {
                                        field.onChange(undefined);
                                    };
                                    
                                    return (
                                        <FormItem className="flex-grow">
                                            <FormLabel className="text-xs font-semibold">Image</FormLabel>
                                            <FormControl className="text-white">
                                                <FileUpload 
                                                    onUpload={handleFileUpload}
                                                    onFileDelete={handleFileDelete}
                                                    buttonClass="bg-stone-700 hover:bg-stone-600"
                                                    maxFiles={1}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                            />
                            <FormField
                                control={imageUploadForm.control}
                                name="priorityIndex"
                                render={({ field }) => (
                                    <FormItem className="basis-1/3">
                                        <FormLabel className="text-xs font-semibold">Priority index</FormLabel>
                                        <FormControl className="bg-stone-300 text-white">
                                            <Input type="number" placeholder="Index" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={imageUploadForm.control}
                                name="active"
                                render={({ field }) => (
                                    <FormItem className="">
                                        <FormLabel className="text-xs font-semibold">active</FormLabel>
                                        <FormControl className="bg-stone-300 text-white">
                                            <input 
                                                type="checkbox" 
                                                checked={field.value}
                                                onChange={(e) => field.onChange(e.target.checked)}
                                                onBlur={field.onBlur}
                                                name={field.name}
                                                ref={field.ref}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </form>
                </Form>

                <Table className="mt-5 text-xs">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Image</TableHead>
                            <TableHead className="cursor-pointer hover:bg-stone-700 hover:text-white" onClick={async () => {await editImagePriorityIndex.mutateAsync(priorityIndex!)}}>Priority Index (Click to update)</TableHead>
                            <TableHead>Active</TableHead>
                            <TableHead>ACTIONS</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody> {
                        product?.productImages.map( image => {
                            return (
                                <TableRow key={image.id}>
                                    <TableCell><Image src={image.image} alt={`${image.id}`} width={120} height={120} /></TableCell>
                                    <TableCell>
                                        <input className="bg-gray-100" min={0} type="integer" placeholder={String(image.priorityIndex)} onChange={(e) => {handlePriorityIndexOfImage({imageId: +image.id, priorityIndex: +e.target.value})}} />
                                    </TableCell>
                                    <TableCell>{image.active ? "YESSSS" : "NOOOO"}</TableCell>
                                    <TableCell className="flex flex-col gap-2">
                                        <Button className={`p-3 ${image.active ? "bg-red-500" : "bg-green-500"} text-white rounded-xl`} onClick={ () => {editImageProps.mutate({productImageId: image.id,active: !image.active})}}>{ image.active ? editImageProps.isLoading ? "..." : "INACTIVE" : "ACTIVE" }</Button>
                                        <Button className="p-3 bg-stone-600 text-white rounded-xl" onClick={ async () => {await deleteImage.mutateAsync({productImageId: image.id})}}>DELETE</Button>
                                    </TableCell>
                                </TableRow>
                            )
                        })
                    } </TableBody>
                </Table>
            </div>

            <div className="flex p-2 m-2 flex-col border pb-7 border-black rounded-lg">

                <div className="flex flex-row justify-between">
                    <span className="p-2 text-xl font-semibold">Product Variants</span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <TableCell className="p-2 bg-stone-600 text-white rounded-md cursor-pointer">{addVariant.isLoading ? "Adding..." : "Add Variant"}</TableCell>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-stone-700 text-white">
                            {
                                productSizes && productSizes.map(size => {
                                    if(!product?.ProductVariants.find( variant => variant.size == size.name))
                                        return (
                                            //SKU will be the same as product just the size added in advance
                                            <DropdownMenuItem key={size.name} onClick={async () => {await addVariant.mutateAsync({size: size.name, productId: product.id});}}>Add {size.name}</DropdownMenuItem>
                                        )
                                })
                            }
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <span onClick={()=> router.push(`/inventory?${product.sku.toUpperCase()}`)} className="bg-stone-600 p-2 flex justify-center cursor-pointer rounded-md text-white">View Inventory</span>
                </div>
                <span className="p-1 text-yellow-500">{`TO DELETE A VARIANT PLEASE ENSURE IT'S QUANTITY IS 0`}</span>
                <div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead onClick={() => console.log(priorityIndex)}>Size</TableHead>
                                <TableHead>Variant SKU</TableHead>
                                <TableHead>Created at</TableHead>
                                <TableHead>ACTIONS</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody> {
                            product?.ProductVariants.map( variant => {
                                return (
                                    <TableRow key={variant.id}>
                                        <TableCell>{variant.size}</TableCell>
                                        <TableCell>{variant.subSku}</TableCell>
                                        <TableCell>{variant.createdAt.toDateString()}</TableCell>
                                        <TableCell className="gap-2 flex text-white text-xs flex-col">
                                            <Button disabled={variant.inventory?.quantity ? true : false} onClick={ async () => {if(!variant.inventory?.quantity) await deleteVariant.mutateAsync({variantId: variant.id}) } } className="p-1 bg-stone-600 rounded-md hover:bg-stone-200 hover:text-black">DELETE VARIANT</Button>
                                            { !variant.inventory?.id && <Button onClick={async () => {await addVariantToInventory.mutateAsync([{productVariantId: variant.id}])} } className=" bg-stone-400 hover:bg-stone-200 hover:text-black p-1 rounded-sm cursor-pointer">{addVariantToInventory.isLoading ? "POOKIE VISHAL" : "ADD TO INVENTORY"}</Button>}
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        } </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}