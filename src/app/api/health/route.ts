import { getSupabaseServer } from '@/lib/supabase-server';

export const runtime = 'nodejs';

export async function GET() {
  const timestamp = new Date().toISOString();
  
  try {
    // Test basic health
    const health = {
      status: 'ok',
      timestamp,
      services: {
        api: 'healthy',
        database: 'unknown',
        openai: process.env.OPENAI_API_KEY ? 'configured' : 'not configured'
      }
    };

    // Test database connectivity
    try {
      const supabase = getSupabaseServer();
      const { data, error } = await supabase
        .from('assessments')
        .select('id')
        .limit(1);
      
      if (error) {
        health.services.database = `error: ${error.message}`;
      } else {
        health.services.database = 'healthy';
      }
    } catch (dbError) {
      health.services.database = `connection error: ${(dbError as Error).message}`;
    }

    return new Response(
      JSON.stringify(health),
      { headers: { 'content-type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: 'error',
        timestamp,
        error: (error as Error).message
      }),
      { 
        status: 500,
        headers: { 'content-type': 'application/json' } 
      }
    );
  }
}


