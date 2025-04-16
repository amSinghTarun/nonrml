import dotenv from "dotenv";
import path from "path"

if(process.env.NODE_ENV !== 'production'){
    dotenv.config({path: path.resolve("../../packages/rate-limit/.env.local")})
};

export * from "./service"