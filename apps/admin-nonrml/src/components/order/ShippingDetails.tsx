import React from 'react'
import { useAddressManagement } from './hooks/useAddressManagement'
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Edit2, Check, X } from 'lucide-react'
import { prismaTypes } from '@nonrml/prisma'

interface ShippingDetailsProps {
  address: prismaTypes.Address
  isEditable: boolean
  orderId: string
  onAddressUpdated: () => void
}

const ShippingDetails: React.FC<ShippingDetailsProps> = ({ 
  address, 
  isEditable,
}) => {
  const {
    isEditing,
    editedAddress,
    isUpdating,
    handleEdit,
    handleCancel,
    handleSave,
    handleChange
  } = useAddressManagement(address)
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="font-bold">
          Shipping Details
        </div>
        {isEditable && !isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="h-8 w-8 p-0"
            aria-label="Edit shipping details"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="gap-4 flex flex-row flex-wrap">
        {!isEditing ? (
          <>
            <div>
              <h3 className="font-medium text-sm text-gray-500">Address</h3>
              <p>{`${address.contactName}, ${address.location}, ${address.city}, ${address.state}`}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-500">Pincode</h3>
              <p>{address.pincode}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-500">Mobile</h3>
              <p>{`${address.countryCode} - ${address.contactNumber}`}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-500">Email</h3>
              <p>{address.email}</p>
            </div>
          </>
        ) : (
          <div className="w-full space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="contactName" className="font-medium text-sm text-gray-500 mb-1 block">Contact Name</label>
                <Input
                  id="contactName"
                  value={editedAddress?.contactName || ''}
                  onChange={(e) => handleChange('contactName', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="location" className="font-medium text-sm text-gray-500 mb-1 block">Location</label>
                <Input
                  id="location"
                  value={editedAddress?.location || ''}
                  onChange={(e) => handleChange('location', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="city" className="font-medium text-sm text-gray-500 mb-1 block">City</label>
                <Input
                  id="city"
                  value={editedAddress?.city || ''}
                  onChange={(e) => handleChange('city', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="state" className="font-medium text-sm text-gray-500 mb-1 block">State</label>
                <Input
                  id="state"
                  value={editedAddress?.state || ''}
                  onChange={(e) => handleChange('state', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="pincode" className="font-medium text-sm text-gray-500 mb-1 block">Pincode</label>
                <Input
                  id="pincode"
                  value={editedAddress?.pincode || ''}
                  onChange={(e) => handleChange('pincode', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="contact" className="font-medium text-sm text-gray-500 mb-1 block">Contact Number</label>
                <div className="flex gap-2">
                  <Input
                    id="countryCode"
                    className="w-20"
                    value={editedAddress?.countryCode || ''}
                    onChange={(e) => handleChange('countryCode', e.target.value)}
                    aria-label="Country code"
                  />
                  <Input
                    id="contactNumber"
                    value={editedAddress?.contactNumber || ''}
                    onChange={(e) => handleChange('contactNumber', e.target.value)}
                    aria-label="Contact number"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="font-medium text-sm text-gray-500 mb-1 block">Email</label>
                <Input
                  id="email"
                  value={editedAddress?.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  type="email"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isUpdating}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isUpdating}
              >
                <Check className="h-4 w-4 mr-1" />
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ShippingDetails
