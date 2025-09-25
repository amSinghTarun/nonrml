import nodemailer from 'nodemailer';
import { loadEnv } from "@nonrml/common";

// loadEnv("../../packages/mailing/.env", "INDEX CACHE");

export const sendSMTPMail = async ( { userEmail, emailBody} : { userEmail: string, emailBody: string }) => {
    var transport = nodemailer.createTransport({
        host: "smtp.zeptomail.in",
        port: 587,
        auth: {
            user: process.env.ZEPTO_MAIL_USERNAME,
            pass: process.env.ZEPTO_MAIL_TOKEN
        }
    });

    var mailOptions = {
        from: process.env.CLIENT_SUPPORT_MAIL,
        to: userEmail,
        subject: 'Order Confirmed',
        html: emailBody,
    };

    let mailSent = await transport.sendMail(mailOptions);
    console.log(mailSent)
    return mailSent;
}