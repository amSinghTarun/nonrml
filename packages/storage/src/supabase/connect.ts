import { createClient } from '@supabase/supabase-js'

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