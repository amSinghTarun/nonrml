import { z } from "zod";

export const ZCreatePermissionSchema = z.object({
    permissionName: z.string(),
    active: z.boolean()
});
export type TCreatePermissionSchema = z.infer<typeof ZCreatePermissionSchema>;

export const ZGetPermissionSchema = z.object({
    active: z.boolean().default(true)
});
export type TGetPermissionSchema = z.infer<typeof ZGetPermissionSchema>;

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
