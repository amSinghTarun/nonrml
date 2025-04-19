import dotenv from "dotenv";
import path from "path"

export const loadEnv = (pathRelativeToCwd: string, message?: string) => {
    const envResolvedPath = path.resolve(pathRelativeToCwd)
    console.log(message, envResolvedPath)
    if(process.env.NODE_ENV !== "production"){
        dotenv.config({path: envResolvedPath})
    }
}