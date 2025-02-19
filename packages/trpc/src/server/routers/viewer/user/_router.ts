import { adminProcedure } from "../../../procedures/authedProcedure";
import { router } from "../../../trpc";
import * as userHandler from "./user.handler";
import * as userSchema from "./user.schema";

export const userRouter = router({
    getUsersInfo: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Edit personal details of a user"}})
        .input(userSchema.ZGetUsersSchema)
        .query( async ({ctx, input}) => await userHandler.getUsers({ctx, input})),
    changeRole: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Edit personal details of a user"}})
        .input(userSchema.ZChangeRoleSchema)
        .mutation( async ({ctx, input}) => await userHandler.changeRole({ctx, input}))
})