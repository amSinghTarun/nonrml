import dotenv from "dotenv";
import axios from "axios"
import path from "path";

dotenv.config({path: path.resolve("../../packages/otp/.env.local")});

export const sendOTP = async (otp: number, phone: string) => {
    try{
        const url = "https://www.fast2sms.com/dev/bulkV2";
        const otpSend = await axios({
            url: url,
            method: "POST",
            headers: {
                "authorization": process.env.FAST_2_SMS_API_KEY!,
            },
            data: {
                "variables_values": otp.toString(),
                route: "otp",
                numbers: phone
            }
        });
        //console.log(otpSend)
        return otpSend;
    } catch( error ) {
        console.log("Error in sending OTP function", error);
        throw new Error("Try after some time");
    }
};