import React, { useState } from "react";
import { RouterOutput, trpc } from "@/app/_trpc/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
  
import { UseTRPCQueryResult } from "@trpc/react-query/shared";
import { useRouter } from "next/navigation";
import { LinkVariantToInventory } from "./cards/createInventory.card";

type Inventory = UseTRPCQueryResult<RouterOutput["viewer"]["inventory"]["getInventory"], unknown>
type InventoryError = {
    message: string;
    code?: string;
    name?: string;
} | Error | null | string;

export const Inventory = ({inventory}: {inventory: Inventory}) => {
    const router = useRouter();

    const inventoryAction = trpc.viewer.inventory.deleteInventory.useMutation();
    const editInventory = trpc.viewer.inventory.editInventory.useMutation();

    const [ error, setError ] = useState<InventoryError>(null);
    const [ variantDetails, setVariantDetails ] = useState<{ [inventoryId: number]: {size?: string, quantity?: number} }>({});

    const handleInventoryVariantSizeQuantityChange = ({inventoryId, quantity, size}: {inventoryId: number, quantity?: string, size?: string}) => {
        try{
            setError(null);
            setVariantDetails( (prev) => {
                const prevInventoryDetail = { [inventoryId] : {
                    ...prev[inventoryId],
                    ...( (quantity && Number(quantity) >= 0 ) && { "quantity": +quantity } ), 
                    ...( size && { "size": size } )
                }}
                
                if(quantity?.trim() == ""){delete prevInventoryDetail[inventoryId].quantity};
                if(size?.trim() == ""){delete prevInventoryDetail[inventoryId].size};
                console.log(prevInventoryDetail)
                return {...prev, ...prevInventoryDetail}
            })
        } catch(error: unknown) {
            setError(error as InventoryError)
        }
    }

    const updateInventory = async (inventoryId: number) => {
        try {
            setError(null);
            if(variantDetails[inventoryId]){
                await editInventory.mutateAsync({
                    id: inventoryId, 
                    productSize: variantDetails[inventoryId].size, 
                    quantity: variantDetails[inventoryId].quantity
                });
                inventory.refetch()
            }
        } catch(error) {
            setError(error as InventoryError)
        }
    }

    return (
        
        <Table className={`${error && "backdrop-blur-lg"}`}>
        {   
            error  && (<div className=" absolute z-40 backdrop-blur-sm w-[100%] h-[100%] justify-center p-5">
                <div className="relative bg-red-600 bg-opacity-70 text-white rounded-xl p-3 justify-center">
                    <button onClick={() => setError(null)} className="absolute text-black top-1 right-1">X</button>
                    <span>{`${error}`}</span>
                </div>
            </div>)
        }
        <TableHeader>
            <TableRow>
                <TableHead className="cursor-pointer bg-amber-400 hover:bg-stone-700 hover:text-white" >Id (Click Id to edit)</TableHead>
                <TableHead className="bg-orange-400 text-white">Product SKU</TableHead>
                <TableHead>Product name</TableHead>
                <TableHead>Product Variant size</TableHead>
                <TableHead>Product variant Id</TableHead>
                <TableHead>Product Variant Quantity (Click to update)</TableHead>
                <TableHead>Base Item Id </TableHead>
                <TableHead className="bg-orange-400 text-white">Base Item Sku </TableHead>
                <TableHead>Base Item color</TableHead>
                <TableHead>Base Item size</TableHead>
                <TableHead>Base Item quantity</TableHead>
                <TableHead>ACTIONS</TableHead>
            </TableRow>
        </TableHeader>
        
        <TableBody>
            { inventory.status == "success" 
                ? inventory.data.data.map( inventoryItem => (
                    <TableRow key={inventoryItem.id}>
                        <TableCell className="cursor-pointer hover:bg-amber-400 hover:text-white" onClick={async() => await updateInventory(inventoryItem.id)}>{ ( editInventory.isLoading && editInventory.variables?.id == inventoryItem.id ) ? "Updating" : inventoryItem.id}</TableCell>
                        <TableCell className="hover:bg-orange-400" onClick={()=> router.push(`/products/${inventoryItem.productVariant.product.sku}`)}>{inventoryItem.productVariant.product.sku}</TableCell>
                        <TableCell>{inventoryItem.productVariant.product.name}</TableCell>
                        <TableCell>
                            <input className="bg-gray-100 " type="string" placeholder={inventoryItem.productVariant.size} onChange={(e) => {handleInventoryVariantSizeQuantityChange({inventoryId: inventoryItem.id, size: e.target.value}) }} />
                        </TableCell>
                        <TableCell>{inventoryItem.productVariantId}</TableCell>
                        <TableCell>
                            <input className="bg-gray-100 " type="number" placeholder={String(inventoryItem.quantity)} onChange={(e) => {handleInventoryVariantSizeQuantityChange({inventoryId: inventoryItem.id, quantity: e.target.value}) }} />
                        </TableCell>
                        <TableCell>{inventoryItem.baseSkuInventoryId}</TableCell>
                        <TableCell className="hover:bg-orange-400" onClick={() => inventoryItem.baseSkuInventory?.baseSku && router.push(`/baseInventory?baseInventorySku=${inventoryItem.baseSkuInventory?.baseSku}`)}>{inventoryItem.baseSkuInventory?.baseSku}</TableCell>
                        <TableCell>{inventoryItem.baseSkuInventory?.color}</TableCell>
                        <TableCell>{inventoryItem.baseSkuInventory?.size}</TableCell>
                        <TableCell>{inventoryItem.baseSkuInventory?.quantity}</TableCell>
                        <TableCell className="text-xs text-white flex gap-2">
                            <button onClick={ async () => {
                                    if(inventoryItem.quantity == 0){
                                        await inventoryAction.mutateAsync({id: inventoryItem.id});
                                        inventory.refetch()
                                    } else {
                                        setError("Can't delete inventory item with quantity more th  zero")}
                                    }
                                } 
                                className="p-1 bg-stone-600 rounded-md hover:bg-stone-200 hover:text-black">{inventoryAction.isLoading ? "DELETING" : "DELETE"}
                            </button>
                            {
                                inventoryItem.baseSkuInventoryId 
                                ? <button onClick={ async () => {await inventoryAction.mutateAsync({id: inventoryItem.id, unlink: true}); inventory.refetch()} } className="p-1 bg-stone-300 rounded-md hover:bg-stone-200 hover:text-black">{inventoryAction.isLoading ? "Unlinking base" : "UNLINK Base"}</button>
                                : <LinkVariantToInventory afterEditRefetch={()=>inventory.refetch()} inventoryId={inventoryItem.id} color={inventoryItem.productVariant.product.colour} size={inventoryItem.productVariant.size}>
                                    <button className="p-1 bg-stone-600 rounded-md hover:bg-stone-200 hover:text-black">LINK Base</button>                    
                                </LinkVariantToInventory>
                            }        
                        </TableCell>
                    </TableRow>
                ))
                : <></> 
            }
        </TableBody>
        </Table>
    )
} 