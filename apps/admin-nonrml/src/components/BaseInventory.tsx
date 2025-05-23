"use client"

import React, { useEffect, useState } from "react"
import { RouterOutput, trpc } from "@/app/_trpc/client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { UseTRPCQueryResult } from "@trpc/react-query/shared"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"

type BaseInventory = UseTRPCQueryResult<RouterOutput["viewer"]["baseSkuInventory"]["getBaseInventory"], unknown>

export const BaseInventory = ({inventory}: {inventory: BaseInventory}) => {

    const [ error, setError ] = useState<string>();
    const baseInventoryDelete = trpc.viewer.baseSkuInventory.deleteBaseSkuInventory.useMutation();
    const baseInventoryEdit = trpc.viewer.baseSkuInventory.editBaseSkuDetails.useMutation({
        onError: (error)=>{
            setError(error.message)
        }
    });

    useEffect( () => {
        setTimeout( () => {
            setError("")
        }, 5000)
    }, [error])
    
    const [ baseSKUEditableDetails, setBaseSKUEditableDetails ] = useState<{[baseProductId: number]: {sku?: string, quantity?: number}}>();

    const handleDetailUpdate = ({baseProductId, quantity, sku}: {baseProductId: number, quantity?: string, sku?: string}) => {
        setBaseSKUEditableDetails((prev) => {
            console.log("quantity", quantity, "sku", sku, "baseProductId", baseProductId);
            
            let updateField = prev && prev[baseProductId] ? {...prev[baseProductId]} : {} 

            if(quantity && +quantity >= 0 ) updateField = {...updateField, quantity: +quantity}
            if(sku && sku.trim() != "") updateField = {...updateField, sku: sku}

            if(sku?.trim() == "")
                delete updateField.sku
            if(quantity?.trim() == "")
                delete updateField.quantity

            return {...prev, [baseProductId]:updateField}
        })
    }

    const onItemChangeUpload = async (baseItemId: number) => {
        if(baseSKUEditableDetails && baseSKUEditableDetails[baseItemId]){
            console.log(baseSKUEditableDetails)
            await baseInventoryEdit.mutateAsync({
                baseSkuId: baseItemId,
                sku: baseSKUEditableDetails[baseItemId].sku,
                quantity: baseSKUEditableDetails[baseItemId].quantity
            })
            setBaseSKUEditableDetails({})
            inventory.refetch()
        }
    }

    return (
        <Table className="relative">
            {<div className="absolute top-0 left-[50%] bg-red-200 p-1">{error}</div>}
            <TableHeader>
                <TableRow className="text-sm">
                    <TableHead className="bg-orange-400">Id</TableHead>
                    <TableHead>Base Item SKU</TableHead>
                    <TableHead>quantity</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Created At</TableHead>
                </TableRow>
            </TableHeader>
            
            <TableBody>
                { inventory.status == "success" ?
                inventory.data.data.map( item => (
                    <TableRow key={item.id}  className="text-sm">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <TableCell className="hover:bg-orange-400 cursor-pointer">{item.id}</TableCell>
                            </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-stone-700 text-white">
                            <DropdownMenuItem onClick={() => onItemChangeUpload(item.id) }>{(baseInventoryEdit.isLoading && baseInventoryEdit.variables?.baseSkuId == item.id) ? "Updating" : "Update"}</DropdownMenuItem>
                            <DropdownMenuItem onClick={async () => {if(item.quantity){await baseInventoryDelete.mutateAsync({id: item.id}); inventory.refetch()}}}>{baseInventoryDelete.isLoading ? "Deleting" : "Delete"}</DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                        <TableCell>
                            <input value={baseSKUEditableDetails?.[item.id]?.sku ?? ''} placeholder={`${item.baseSku}`} type="string" onChange={(e) => handleDetailUpdate({baseProductId:item.id, sku: e.target.value })}/>
                        </TableCell>
                        <TableCell>
                            <input value={baseSKUEditableDetails?.[item.id]?.quantity ?? ''} placeholder={`${item.quantity}`} type="number" onChange={(e) => handleDetailUpdate({baseProductId:item.id, quantity: e.target.value })}/>
                        </TableCell>
                        <TableCell>{item.size}</TableCell>
                        <TableCell>{item.color}</TableCell>
                        <TableCell>{item.createdAt.toDateString()}</TableCell>
                </TableRow>
                ))
                : <></> 
                }
            </TableBody>
        </Table>
    )
} 