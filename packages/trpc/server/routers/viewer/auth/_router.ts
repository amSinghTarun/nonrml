import { TRPCError } from "@trpc/server";
import { procedure, router } from "../../../trpc";
import { ZChangePassword, ZInitiateChangePasswordRequest, ZSigninSchema, ZSignupSchema, ZVerifyChangePasswordOTP } from "./sign.schema";
import { changePassword, initiateForwardPasswordRequest, signinUser, signupUser, verifyChangePasswordOTP } from "./sign.handler";
import { publicProcedure } from "../../../procedures/publicProcedure";

export const authRouter = router({
    signin: publicProcedure
        .meta({ openAPI: {method: "POST", descrription: "Authenticate and login a user"}})
        .input(ZSigninSchema)
        .query( async ({ctx, input}) => {
            return await signinUser({ctx, input});
        }),
    signup: publicProcedure
        .meta({ openAPI: {method: "POST", descrription: "Create a new user"}})
        .input(ZSignupSchema)
        .mutation( async ({ctx, input}) => {
            return await signupUser({ctx, input});
        }),
    intiaiteForwardPasswordRequest: publicProcedure
        .meta({ openAPI: {method: "POST", descrription: "Initiate the reset password flow, sends mail to user containing OTP"}})
        .input(ZInitiateChangePasswordRequest)
        .mutation( async ({ctx, input}) => {
            return await initiateForwardPasswordRequest({ctx, input});
        }),
    verifyChangePasswordOTP: publicProcedure
        .meta({ openAPI: {method: "POST", descrription: "Verify the reset password OTP"}})
        .input(ZVerifyChangePasswordOTP)
        .mutation( async ({ctx, input}) => {
            return await verifyChangePasswordOTP({ctx, input});
        }),
    changePassword: publicProcedure
        .meta({ openAPI: {method: "POST", descrription: "Change the old password of the user with the new password"}})
        .input(ZChangePassword)
        .mutation( async ({ctx, input}) => {
            return await changePassword({ctx, input});
        })
});