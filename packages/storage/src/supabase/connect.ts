import { createClient } from '@supabase/supabase-js'
import { loadEnv } from '@nonrml/common';

// if(process.env.NODE_ENV !== "production"){
//     dotenv.config({path: path.resolve("../../packages/storage/.env.local")})
// }

loadEnv("../../packages/storage/.env.local", "INDEX SUPBASE")

let supabaseClient : any = null;
export const supabase = () => {
    console.log(process.env.SUPABASE_PROJECT_URL)
    if(!supabaseClient){
        supabaseClient = createClient(
            process.env.SUPABASE_PROJECT_URL ?? "",
            process.env.ANON_PUBLIC_KEY ?? ""
        )  
    };
    // //console.log(supabaseClient)
    return supabaseClient;
}