import { prismaEnums } from "@nonrml/prisma";
import { z } from "zod";

export const ZGetUserAddressSchema = z.object({
    userId: z.number()
});
export type TGetUserAddressSchema = z.infer<typeof ZGetUserAddressSchema>;

export const ZGetAddressesSchema = z.object({
    userId: z.number()
});
export type TGetAddressesSchema = z.infer<typeof ZGetAddressesSchema>;

export const ZEditAddressSchema = z.object({
    contactName: z.string().optional(),
    contactNumber: z.string().regex(/^[6-9]\d{9}$/g).length(10).optional(),
    location: z.string().optional(),
    pincode: z.string().length(6).optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    email: z.string().email().optional(),
    addressId: z.number()
});
export type TEditAddressSchema = z.infer<typeof ZEditAddressSchema>;

export const ZEditAddressByAdmin = z.object({
    contactName: z.string().optional(),
    contactNumber: z.string().regex(/^[6-9]\d{9}$/g).length(10).optional(),
    location: z.string().optional(),
    pincode: z.string().length(6).optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    email: z.string().email().optional(),
    id: z.number() //id of address that is being changed
});
export type TEditAddressByAdmin = z.infer<typeof ZEditAddressByAdmin>;

export const ZAddAddressSchema = z.object({
    contactName: z.string(),
    countryCode: z.string().length(3).optional(),
    contactNumber: z.string().regex(/^[6-9]\d{9}$/g).length(10),
    location: z.string(),
    pincode: z.string().length(6),
    city: z.string(),
    state: z.string(),
    email: z.string().email()
});
export type TAddAddressSchema = z.infer<typeof ZAddAddressSchema>;

export const ZRemoveAddressSchema = z.object({
    id: z.number()
})
export type TDeleteAddressSchema = z.infer<typeof ZRemoveAddressSchema>;
