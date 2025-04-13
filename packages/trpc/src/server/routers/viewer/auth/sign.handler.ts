import { prismaEnums } from "@nonrml/prisma";
import { TSendOTPSchema, TVerifyOTPSchema } from "./sign.schema";
import { createOTP, TRPCCustomError, TRPCRequestOptions } from "../helper";
import { TRPCResponseStatus } from "@nonrml/common";
import { sendOTP } from "@nonrml/otp";
import { TRPCError } from "@trpc/server";

export const sendLoginOTP = async ({ctx, input}: TRPCRequestOptions<TSendOTPSchema>)  => {
    const prisma = ctx.prisma;
    input = input!;
    try{
        // add some error into here
        const otp = createOTP(6);
        const otpExpiry = Date.now() + 900000 //15 mins
        
        console.log(otp)
        // sendOTP(otp, input.contactNumber); 
        
        await prisma.user.upsert({
            where: {
                contactNumber: `${input.contactNumber}`    
            },
            update: {
                otp: otp,
                otpExpire: otpExpiry,
            },
            create: {
                contactNumber: `${input.contactNumber}`,
                role: prismaEnums.UserPermissionRoles.USER,
                otp: otp,
                otpExpire: otpExpiry,
            }
        });

        return { status: TRPCResponseStatus.SUCCESS, message: "OTP send", data: {}};
    } catch(error:any) {
        //console.log("Error in sending OTP from SignIn", error);
        throw TRPCCustomError(error);
    }
}

export const verifyOTP = async ({ctx, input}:TRPCRequestOptions<TVerifyOTPSchema>) => {
    input = input!;
    try{
        const otpVerifiedUser = await ctx!.prisma.user.findFirst({
            where: {
                contactNumber: `${input.contactNumber}`,
                otp: Number(input.otp),
                otpExpire: {
                    gte: Date.now()
                }
            }
        });
        //console.log("user from verify OTP", otpVerifiedUser);
        if(!otpVerifiedUser)
            throw new TRPCError({code:"FORBIDDEN", message: "Invalid OTP"});
        return { status: TRPCResponseStatus.SUCCESS, message: "OTP Verified", data: {id: otpVerifiedUser.id}};
    } catch(error: any) {
        //console.log(error);
        throw TRPCCustomError(error);
    }
}

// // Helper for the initiateChangePasswordRequest function
// // Send the mail carring the OTP
// const sendChangePasswordOTP = (otp: number, contactDetail: {email: string} | {contactNumber: string} ) => {
//     if("email" in contactDetail) {
//         // send otp on mail
//     } else {
//         // send otp on msg
//     }
// };

// type SigninUserOptions = {
//     ctx: {},
//     input: TSigninSchema

// type SignupUserOptions = {
//     ctx: {},
//     input: TSignupSchema

// // session should be cretead from this, look into this even implementing logins
// export const signupUser = async ({ctx, input}: SignupUserOptions)  => {
//     if(input.confirmPassword !== input.password){
//         throw new TRPCError({code:"BAD_REQUEST", message: "The two passwords don't match"})
//     }
//     const userExist = await prisma.user.findFirst({
//         where: {
//             OR: [
//                 {
//                     email: input.email,
//                     contactNumber: input.contactNumber,
//                 },
//             ]
//         },
//         select: {
//             email: true,
//             contactNumber: true
//         }
//     });

//     if(!userExist) {
//         const role = await prisma.roles.findUnique({
//             where: {
//                 roleName: prismaEnums.UserPermissionRole[input.role]
//             }
//         });

//         if(!role)
//             throw new TRPCError({code:"BAD_REQUEST", message: `The role with name ${input.role} doesn't exist`});

//         const userCart = await prisma.cart.create({
//             data: {
//                 cartTotal: 0,
//                 quantity: 0
//             }
//         });
        
//         const userDetails: Omit<prismaTypes.User, "id"|"createdAt"|"updatedAt"|"discountsUsed"> = {
//             ...input,
//             password: await createPasswordHash(input.password),
//             role: role.id,
//             status: input.role == prismaEnums.UserPermissionRole.USER ? prismaEnums.UserAccountStatus.ACTIVE : prismaEnums.UserAccountStatus.PENDING,
//             permissions: [],
//             otp: -1,
//             cartId: userCart.id,
//             otpExpire: Date.now() - 1 as unknown as bigint
//         };
//         const userCreated = await prisma.user.create({data:{...userDetails}});
//         return { status: TRPCResponseStatus.SUCCESS, message:`User account created with Id: ${userCreated.id}`, data: {}};
//     }

//     if(userExist.email == input.email && userExist.contactNumber == input.contactNumber) {
//         throw new TRPCError({code:"FORBIDDEN", message: "Email and Mobile already exist"});   
//     } else if (userExist.email == input.email) {
//         throw new TRPCError({code: "FORBIDDEN", message: "Mobile already exist"});
//     } else {
//         throw new TRPCError({code: "FORBIDDEN", message: "Email already exist"});
//     }
// }

// export const signinUser = async ({ctx, input}: SigninUserOptions)  => {
//     const userFindQuery = input.userIdentifier.includes("@") ? { email: input.userIdentifier } : { contactNumber: input.userIdentifier} 
//     const user = await prisma.user.findUnique({
//         where: userFindQuery
//     });
//     if(!user)
//         throw new TRPCError({code:"UNAUTHORIZED", message:"No user with provided identifier"});
//     const userVerified = await verifyPassword(input.password, user?.password);
//     if(!userVerified)
//         throw new TRPCError({code:"FORBIDDEN", message:"Incorrect password"})
//     return {status: TRPCResponseStatus.SUCCESS, message: "user found", data: {}};
// };

// // user send the email/mobile they want to send OTP to
// // this funciton confirm the email/mobile and send OTP to it
// export const initiateForwardPasswordRequest = async ({ctx, input} : TRPCRequestOptions<TInitiateChangePasswordRequest>)  => {
//     try{
//         //sendChangePasswordOTP
//         const userIdentifier : {email:string} | {contactNumber: string} = input.email ? { email : input.email! } : { contactNumber: input.contactNumber! };
//         const otp = createOTP(6);
//         await prisma.user.update({
//             where: userIdentifier,
//             data: {
//                 otp: otp,
//                 otpExpire: Date.now() + 900000
//             }
//         });
//         sendChangePasswordOTP(otp, userIdentifier);
//         return {status: TRPCResponseStatus.SUCCESS, message: `OTP send, valid for 15 mins`, data: {}};
//     } catch(error) {
//         if (error instanceof Prisma.PrismaClientKnownRequestError && error.code == "P2025") {
//             throw new TRPCError({code:"UNAUTHORIZED", message:"No user with provided identifier"});
//         }
//         throw error;
//     }
// };

// // When user click the verify password after entering it then in the below function it gets verified
// // how do we get the userIdentifier, do we send link(instead of otp) or there is some frontend wonder
// // to keep the prev record stored, like useState
// export const verifyChangePasswordOTP = async ({ctx, input}: TRPCRequestOptions<TVerifyChangePasswordOTP>) => {
//     try{
//         const userFindWhereQuery = input.userIdentifier.includes("@") ? { email: input.userIdentifier} : { contactNumber: input.userIdentifier};
//         await prisma.user.update({
//             where: {
//                 ...userFindWhereQuery,
//                 otp: input.otp,
//                 otpExpire: {
//                     lte: Date.now()
//                 }
//             },
//             data: {
//                 otpExpire: Date.now() - 1
//             }
//         });
//         return { status: TRPCResponseStatus.SUCCESS, message: "Password changede successfully", data: true};
//     } catch(error) {
//         if (error instanceof Prisma.PrismaClientKnownRequestError && error.code == "P2025") {
//             throw new TRPCError({code:"UNAUTHORIZED", message:"Incorrect OTP"});
//         }
//         throw error;
//     }
// };

// // After successful OTP reset, the user will send the new password.
// // the below function store them in the db.
// export const changePassword = async ({ctx, input} : TRPCRequestOptions<TChangePassword>)  => {
//     try {
//         const userFindWhereQuery = input.userIdentifier.includes("@") ? { email: input.userIdentifier} : { contactNumber: input.userIdentifier};
//         const passwordHash = { password: await createPasswordHash(input.newPassword) };
//         switch(input.changeRequestType) {
//             case "OTP" :
//                 await prisma.user.update({
//                     where: userFindWhereQuery,
//                     data: passwordHash
//                 });
//                 break;
//             case "OLD_PASSWORD" :
//                 const user = await prisma.user.findUnique({
//                     where: {
//                         ...userFindWhereQuery
//                     }
//                 });
//                 if(!user)
//                     throw new TRPCError({code: "FORBIDDEN", message: "No user found with the identifier provided"});

//                 if(await verifyPassword(input.oldPassword!, user.password)){
//                     await prisma.user.update({
//                         where: userFindWhereQuery,
//                         data: passwordHash
//                     });
//                 }
//                 break;
//             default:
//                 throw new TRPCError({code: "METHOD_NOT_SUPPORTED", message: "Change type not supported"});   
//         }
//         return { status: TRPCResponseStatus.SUCCESS, message: "Password reset successful", data: true};
//     } catch(error) {
//         throw error;
//     }
// }
