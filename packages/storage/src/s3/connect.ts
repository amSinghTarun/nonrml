import S3 from "aws-sdk/clients/s3.js";
import { loadEnv } from "@nonrml/common";

loadEnv("../../packages/storage/.env.local", "STORAGE S# ENV LOAD");

let s3Connection: S3 | null = null

export const getS3Connection = () => {
    try{
        if(!s3Connection){
            s3Connection = new S3({
                endpoint: process.env.CLOUDFLARE_ENDPOINT,
                accessKeyId: process.env.CLOUDFLARE_KEY_ID,
                secretAccessKey: process.env.CLOUDFLARE_KEY_SECRET,
                signatureVersion: "v4",
                signatureCache: true
            });          
        }
        return s3Connection;

    }catch(error){
        console.log(error);
        throw error
    }
}