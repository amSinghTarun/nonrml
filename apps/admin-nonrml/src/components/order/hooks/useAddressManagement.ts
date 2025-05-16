/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { trpc } from '@/app/_trpc/client'
import { prismaTypes } from '@nonrml/prisma'

export function useAddressManagement(initialAddress: prismaTypes.Address | undefined) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedAddress, setEditedAddress] = useState<prismaTypes.Address | undefined>(initialAddress)
  
  // Update editedAddress when initialAddress changes
  useEffect(() => {
    setEditedAddress(initialAddress)
  }, [initialAddress])
  
  const updateAddressMutation = trpc.viewer.address.editAddressByAdmin.useMutation()
  
  const handleEdit = () => {
    setIsEditing(true)
  }
  
  const handleCancel = () => {
    setEditedAddress(initialAddress)
    setIsEditing(false)
  }
  
  const handleSave = async () => {
    if (!editedAddress) return
    
    await updateAddressMutation.mutateAsync(editedAddress)
    setIsEditing(false)
  }
  
  const handleChange = (field: keyof prismaTypes.Address, value: any) => {
    if (!editedAddress) return
    
    setEditedAddress({
      ...editedAddress,
      [field]: value
    })
  }
  
  return {
    isEditing,
    editedAddress,
    isUpdating: updateAddressMutation.isLoading,
    handleEdit,
    handleCancel,
    handleSave,
    handleChange
  }
}
