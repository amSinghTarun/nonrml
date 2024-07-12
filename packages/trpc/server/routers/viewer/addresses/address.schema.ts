import { prismaEnums } from "@nonorml/prisma";
import { z } from "zod";

export const ZGetAddressSchema = z.object({
    addressId: z.number()
});
export type TGetAddressSchema = z.infer<typeof ZGetAddressSchema>;

export const ZGetAddressesSchema = z.object({
    userId: z.number()
});
export type TGetAddressesSchema = z.infer<typeof ZGetAddressesSchema>;

export const ZEditAddressSchema = z.object({
    id: z.number(),
    addressName: z.string().optional(),
    contactName: z.string().optional(),
    contactNumber: z.string().length(10).optional(),
    location: z.string().optional(),
    landmark: z.string().nullable(),
    pincode: z.string().length(6).optional(),
    city: z.string().optional(),
    state: z.string().optional(),
});
export type TEditAddressSchema = z.infer<typeof ZEditAddressSchema>;

export const ZAddAddressSchema = z.object({
    addressName: z.string(),
    contactName: z.string(),
    countryCode: z.string().length(3),
    contactNumber: z.string().length(10),
    location: z.string(),
    landmark: z.string().nullable(),
    pincode: z.string().length(6),
    city: z.string(),
    state: z.string(),
});
export type TAddAddressSchema = z.infer<typeof ZAddAddressSchema>;

export const ZRemoveAddressSchema = z.object({
    id: z.number()
})
export type TDeleteAddressSchema = z.infer<typeof ZRemoveAddressSchema>;

export const ZGetAddressesOutputSchema = z.array(
    z.object({
        id : z.number(),
        type : z.enum([prismaEnums.AddressType.CUSTOMER, prismaEnums.AddressType.COMPANY_WAREHOURSE]),
        addressName  : z.string(),
        contactName  : z.string(),
        countryCode  : z.string(),
        contactNumber  : z.string(),
        location  : z.string(),
        landmark      : z.string().nullable(),
        pincode  : z.string(),
        city  : z.string(),
        state  : z.string(),
        userId  : z.number(),
        createAt  : z.date(),
        updatedAt  : z.date(),
    })
);
export type TGetAddressesOutputSchema = z.infer<typeof ZGetAddressesOutputSchema>;

export const ZAddAddressOutputSchema = z.object({
    id : z.number(),
    type : z.enum([prismaEnums.AddressType.CUSTOMER, prismaEnums.AddressType.COMPANY_WAREHOURSE]),
    addressName  : z.string(),
    contactName  : z.string(),
    countryCode  : z.string(),
    contactNumber  : z.string(),
    location  : z.string(),
    landmark      : z.string().nullable(),
    pincode  : z.string(),
    city  : z.string(),
    state  : z.string(),
    userId  : z.number(),
    createAt  : z.date(),
    updatedAt  : z.date(),
});
export type TAddressOutputSchema = z.infer<typeof ZAddAddressOutputSchema>;