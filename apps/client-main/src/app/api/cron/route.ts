// pages/api/cron/trigger-supabase.ts
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_PROJECT_URL!,
  process.env.ANON_PUBLIC_KEY! // Use service key for server-side operations
);

export async function GET(req: NextRequest) {
  // Verify cron authorization
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }


  try {
    // Get the latest function URL from database
    const { data: config, error } = await supabase
      .from('cdynamicCnfig')
      .select('value')
      .eq('key', 'prod_edge_function_url')
      .single();

    if (error || !config?.value) {
      throw new Error('Failed to fetch function URL from config');
    }

    // Call the Supabase Edge function
    const response = await fetch(config.value, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ANON_PUBLIC_KEY}`,
        "apikey" : `${process.env.ANON_PUBLIC_KEY}`, 
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to execute edge function');
    }

    return new Response("Edge function executed successfully", {
        status: 200
    })
  } catch (error) {
    console.error('Error triggering Supabase edge function:', error);
    return new Response('INTERNAL_SERVER_ERROR', {
        status: 500
    });
  }
}