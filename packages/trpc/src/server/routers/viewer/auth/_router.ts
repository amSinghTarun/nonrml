import { router } from "../../../trpc";
import { ZSendOTPSchema, ZVerifyOTPSchema } from "./sign.schema";
import {sendLoginOTP, verifyOTP } from "./sign.handler";
import {  publicProcedure } from "../../../procedures/publicProcedure";

export const authRouter = router({
    sendOTP: publicProcedure
        .input(ZSendOTPSchema)
        .mutation( async ({ctx, input}) => {
            return await sendLoginOTP({ctx, input})
        }),
    verifyOTP: publicProcedure
        .input(ZVerifyOTPSchema)
        .mutation(async ({ctx, input}) => {
            return await verifyOTP({ctx, input});
        })
    // signin: publicProcedure
    //     .meta({ openAPI: {method: "POST", descrription: "Authenticate and login a user"}})
    //     .input(ZSigninSchema)
    //     .query( async ({ctx, input}) => {
    //         return await signinUser({ctx, input});
    //     }),
    // signup: publicProcedure
    //     .meta({ openAPI: {method: "POST", descrription: "Create a new user"}})
    //     .input(ZSignupSchema)
    //     .mutation( async ({ctx, input}) => {
    //         return await signupUser({ctx, input});
    //     }),
    // intiaiteForwardPasswordRequest: publicProcedure
    //     .meta({ openAPI: {method: "POST", descrription: "Initiate the reset password flow, sends mail to user containing OTP"}})
    //     .input(ZInitiateChangePasswordRequest)
    //     .mutation( async ({ctx, input}) => {
    //         return await initiateForwardPasswordRequest({ctx, input});
    //     }),
    // verifyChangePasswordOTP: publicProcedure
    //     .meta({ openAPI: {method: "POST", descrription: "Verify the reset password OTP"}})
    //     .input(ZVerifyChangePasswordOTP)
    //     .mutation( async ({ctx, input}) => {
    //         return await verifyChangePasswordOTP({ctx, input});
    //     }),
    // changePassword: publicProcedure
    //     .meta({ openAPI: {method: "POST", descrription: "Change the old password of the user with the new password"}})
    //     .input(ZChangePassword)
    //     .mutation( async ({ctx, input}) => {
    //         return await changePassword({ctx, input});
    //     })
});