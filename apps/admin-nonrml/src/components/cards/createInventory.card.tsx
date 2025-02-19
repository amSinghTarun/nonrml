"use client"

import { trpc } from "@/app/_trpc/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function LinkVariantToInventory({ children, color, size, inventoryId, afterEditRefetch }:{children:React.ReactNode, color: string, size: string, inventoryId: number, afterEditRefetch: () => void}) {

  const linkBaseToInventory = trpc.viewer.inventory.editInventory.useMutation();
  const avlBaseInventoriesQuery = trpc.viewer.baseSkuInventory.getBaseInventory.useQuery({
    color : color,
    size: size
  });
  if (avlBaseInventoriesQuery.isLoading) return <div>Loading...</div>;
  if (avlBaseInventoriesQuery.error) return <div>Error: {avlBaseInventoriesQuery.error.message}</div>;

  let avlBaseInventories = avlBaseInventoriesQuery.data.data;
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>Avl Base Product to link</AlertDialogHeader>
        {
          avlBaseInventories.map( baseInventory => (
              <div className="flex flex-row text-xs justify-between">
                <div className="flex flex-col">
                  <span>Sku: {baseInventory.baseSku}</span>
                  <span>Color: {baseInventory.color}</span>
                  <span>Size: {baseInventory.size}</span>
                  <span>Quantity: {baseInventory.quantity}</span>
                </div>
                <AlertDialogAction onClick={async () => {await linkBaseToInventory.mutateAsync({id: inventoryId, baseSkuId: baseInventory.id});afterEditRefetch()}}>{linkBaseToInventory.isLoading ? "LINKING" : "LINK"}</AlertDialogAction>
              </div>
          ))
        }
        <AlertDialogCancel>Cancel</AlertDialogCancel>
      </AlertDialogContent>
    </AlertDialog>
  )
}
