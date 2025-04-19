import { createClient } from '@supabase/supabase-js'
import { loadEnv } from "@nonrml/common";

loadEnv("../../packages/storage/.env.local", "STORAGE SUPABASE ENV LOAD");

let supabaseClient : any = null;
export const supabase = () => {
    if(!supabaseClient){
        supabaseClient = createClient(
            process.env.SUPABASE_PROJECT_URL ?? "",
            process.env.ANON_PUBLIC_KEY ?? ""
        )
    };
    // //console.log(supabaseClient)
    return supabaseClient;
}