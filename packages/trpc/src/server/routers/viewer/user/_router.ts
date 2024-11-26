import { publicProtectedProcedure } from "../../../procedures/authedProcedure";
import { publicProcedure } from "../../../procedures/publicProcedure";
import { router } from "../../../trpc";
import * as userHandler from "./user.handler";
import * as userSchema from "./user.schema";

export const UserRouter = router({
    editUserPersonalInfo: publicProtectedProcedure
        .meta({ openAPI: {method: "POST", descrription: "Edit personal details of a user"}})
        .input(userSchema.ZEditUserPersonalInfoSchema)
        .mutation( async ({ctx, input}) => {
        return await userHandler.editUserPersonalInfo({ctx, input});
    }),
    sendActivationLink: publicProtectedProcedure
        .meta({openAPI: {method: "POST", description: "Send the activation link for a user to active account"}})
        .input(userSchema.ZSendActivationLinkSchema)
        .mutation( async ({ctx, input}) => {
            return await userHandler.sendActivationLink({ctx, input});
        }),
    activateUserAccount: publicProcedure
        .meta({openAPI: { method: "POST", description: "Activate a user's account"}})
        .input(userSchema.ZActivateUserAccountSchema)
        .mutation( async ({ctx, input}) => {
            return await userHandler.activateUserAccount({ctx, input});
        })
})