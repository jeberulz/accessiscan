import { getSupabaseServer } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
        health.services.database = 'unhealthy';
      } else {
        health.services.database = 'healthy';
      }
    } catch (_dbError) {
      health.services.database = 'connection_error';
    }
    const status = health.services.database === 'healthy' ? 200 : 503;
    return new Response(
      JSON.stringify(health),
      {
        status,
        headers: {
          'content-type': 'application/json',
          'cache-control': 'no-store'
        }
      }
    );
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: 'error',
        timestamp,
        error: 'Internal Server Error'
      }),
      {
        status: 500,
        headers: {
          'content-type': 'application/json',
          'cache-control': 'no-store'
        }
      }
    );
  }
}


