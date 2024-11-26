import { createClient } from '@supabase/supabase-js'
import dotenv from "dotenv";
import path from "path"

//dotenv get's the variable from the PWD so that's why has to specify the absolute path
// this needs to be edited as can't rely on relative path
// //console.log("--------------------------------------STORAGE")
// //console.log(path.dirname(__dirname), path.resolve("../../.env"));
// //console.log("---------------------------------------------")
dotenv.config({path: path.resolve("../../packages/storage/.env")})
// //console.log(process.env)
let supabaseClient : any = null;
export const supabase = () => {
    if(!supabaseClient){
        supabaseClient = createClient(
            process.env.PROJECT_URL ?? "",
            process.env.ANON_PUBLIC_KEY ?? ""
        )
    };
    // //console.log(supabaseClient)
    return supabaseClient;
}