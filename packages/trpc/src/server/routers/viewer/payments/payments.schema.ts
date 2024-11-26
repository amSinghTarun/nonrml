import { z } from "zod";

export const ZCreateRzpOrderSchema = z.object({
    orderTotal:z.number(),
    addressId: z.number()
});
export type TCreateRzpOrderSchema = z.infer<typeof ZCreateRzpOrderSchema>;

export const ZChangePaymentStatusSchema = z.object({
    orderId: z.string(),
    paymentStatus: z.enum(["failed", "paid"])
});
export type TChangePaymentStatusSchema = z.infer<typeof ZChangePaymentStatusSchema>;

export const ZEditPermissionSchema = z.object({
    permissionId: z.number(),
    permissionName: z.string().optional(),
    active: z.boolean()
});
export type TEditPermissionSchema = z.infer<typeof ZEditPermissionSchema>;

// can't delete permission if it's being used
export const ZDeletePermissionSchema = z.object({
    permissionId: z.number()
});
export type TDeletePermissionSchema = z.infer<typeof ZDeletePermissionSchema>;
