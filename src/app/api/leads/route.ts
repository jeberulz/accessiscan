import { LeadCaptureSchema, type ApiResponse } from '@/shared/types';
import { getSupabaseServer } from '@/lib/supabase-server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = LeadCaptureSchema.parse(json);

    const supabase = getSupabaseServer();
    const { data: insert, error } = await supabase
      .from('leads')
      .insert({
        email: parsed.email,
        company_name: parsed.companyName,
        website_url: parsed.websiteUrl,
        contact_preferences: parsed.contactPreferences,
      })
      .select('id, created_at')
      .single();

    if (error) throw error;

    const response: ApiResponse = {
      success: true,
      message: "Thank you for your interest! We'll be in touch soon.",
      data: { id: insert.id },
    };
    return new Response(JSON.stringify(response), { headers: { 'content-type': 'application/json' } });
  } catch (err) {
    console.error('Lead capture error:', err);
    const response: ApiResponse = { success: false, message: 'Failed to capture lead information' };
    return new Response(JSON.stringify(response), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}

