import dotenv from "dotenv";
import axios from "axios"
import path from "path";
import { loadEnv } from "@nonrml/common";

loadEnv("../../packages/otp/.env", "FAST 2 SMS CONFIG");

export const sendOTP = async (otp: number, phone: string) => {
    try{
        console.log(process.env.FAST_2_SMS_API_KEY!)
        const url = "https://www.fast2sms.com/dev/bulkV2";
        const otpSend = await axios({
            url: url,
            method: "POST",
            headers: {
                "authorization": process.env.FAST_2_SMS_API_KEY!,
            },
            data: {
                variables_values: otp.toString(),
                sender_id: process.env.sender_id,
                message: process.env.message,
                route: process.env.route,
                numbers: phone
            }
        });
        return otpSend;
    } catch( error ) {
        console.log("Error in sending OTP function", error);
        throw new Error("Try after some time");
    }
};