import dotenv from "dotenv";
import path from "path"

if(process.env.NODE_ENV !== "production"){
    dotenv.config({path: path.resolve("../../packages/cache/.env.local")})
};

export { redis } from "./services"