import S3 from "aws-sdk/clients/s3.js";
import dotenv from "dotenv";
import path from "path"

if(process.env.NODE_ENV?.toUpperCase() != "PRODUCTION"){
    dotenv.config({path: path.resolve("../../packages/storage/.env")})
}

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