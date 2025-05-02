import { Redis } from 'https://deno.land/x/upstash_redis@v1.19.3/mod.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.server( async (req) => {
    try{
        // Create a Supabase client with the Auth context of the logged in user.
        const supabaseClient = createClient(
            // Supabase API URL - env var exported by default.
            Deno.env.get('SUPABASE_URL') ?? '',
            // Supabase API ANON KEY - env var exported by default.
            Deno.env.get('SUPABASE_ANON_KEY') ?? ''
        )

        const redis = new Redis({
            url: Deno.env.get('UPSTASH_REDIS_REST_URL')!,
            token: Deno.env.get('UPSTASH_REDIS_REST_TOKEN')!,
        })

        console.log("Running daily task to update the product visit count ...");
        const productsCounts = await redis.json.get<{[id: string]: number}[]>("VISITED");


        if(!productsCounts || Object.keys(productsCounts).length === 0){
            console.log("No product visited today, sad!")
        return;
        }

        // Create CASE statement for bulk increment
        const caseSQL = Object.entries(productsCounts)
            .map(([id, count]) => `WHEN id = ${+id} THEN "visitedCount" + ${count}`)
            .join(' ');

        const idList = Object.keys(productsCounts).map(id => +id).join(',');

        const rawQuery = `
        UPDATE "Products" 
        SET "visitedCount" = CASE ${caseSQL} ELSE "visitedCount" END
        WHERE id IN (${idList});
        `;

        console.log(rawQuery)
        try{
        const result = await supabaseClient.$executeRawUnsafe(rawQuery);
        if(result)
            await redis.json.set("VISITED", "$", {});
        } catch(error){
        console.log(error)
        }
      
  
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 200,
        })
      }
    
})