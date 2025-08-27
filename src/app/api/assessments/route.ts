import { getSupabaseServer } from '@/lib/supabase-server';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50); // Max 50 results
    const offset = parseInt(searchParams.get('offset') || '0');
    const website = searchParams.get('website');
    const email = searchParams.get('email');
    const minScore = searchParams.get('minScore');
    const maxScore = searchParams.get('maxScore');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const impactLevel = searchParams.get('impactLevel');
    const sortBy = searchParams.get('sortBy') || 'date_desc';

    const supabase = getSupabaseServer();
    
    // Build query
    let query = supabase
      .from('assessments')
      .select(`
        id,
        website_url,
        email,
        company_name,
        overall_score,
        total_issues,
        critical_issues,
        high_impact_issues,
        medium_impact_issues,
        low_impact_issues,
        screenshot_url,
        created_at,
        assessment_results
      `);

    // Add filters if provided
    if (website) {
      query = query.ilike('website_url', `%${website}%`);
    }
    
    if (email) {
      query = query.eq('email', email);
    }

    if (minScore) {
      query = query.gte('overall_score', parseInt(minScore));
    }

    if (maxScore) {
      query = query.lte('overall_score', parseInt(maxScore));
    }

    if (dateFrom) {
      query = query.gte('created_at', new Date(dateFrom).toISOString());
    }

    if (dateTo) {
      // Add one day to make it inclusive of the end date
      const endDate = new Date(dateTo);
      endDate.setDate(endDate.getDate() + 1);
      query = query.lt('created_at', endDate.toISOString());
    }

    if (impactLevel) {
      switch (impactLevel) {
        case 'high':
          query = query.gte('critical_issues', 5);
          break;
        case 'medium':
          query = query.gte('critical_issues', 1).lte('critical_issues', 4);
          break;
        case 'low':
          query = query.eq('critical_issues', 0);
          break;
      }
    }

    // Apply sorting
    switch (sortBy) {
      case 'date_asc':
        query = query.order('created_at', { ascending: true });
        break;
      case 'score_desc':
        query = query.order('overall_score', { ascending: false });
        break;
      case 'score_asc':
        query = query.order('overall_score', { ascending: true });
        break;
      case 'issues_desc':
        query = query.order('total_issues', { ascending: false });
        break;
      case 'issues_asc':
        query = query.order('total_issues', { ascending: true });
        break;
      case 'date_desc':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: assessments, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Failed to fetch assessments' 
      }), { 
        status: 500, 
        headers: { 'content-type': 'application/json' } 
      });
    }

    // Transform data to match AssessmentResult interface
    const transformedAssessments = assessments?.map(assessment => ({
      id: assessment.id,
      websiteUrl: assessment.website_url,
      overallScore: assessment.overall_score,
      totalIssues: assessment.total_issues,
      criticalIssues: assessment.critical_issues,
      highImpactIssues: assessment.high_impact_issues,
      mediumImpactIssues: assessment.medium_impact_issues,
      lowImpactIssues: assessment.low_impact_issues,
      issues: assessment.assessment_results?.issues || [],
      recommendations: [
        'Review critical accessibility issues first',
        'Implement systematic accessibility testing',
        'Consider automated testing tools',
        'Train development team on WCAG standards'
      ],
      estimatedImpact: `${Math.round((100 - assessment.overall_score) / 100 * 20)}% of users may encounter barriers`,
      createdAt: assessment.created_at,
      aiDetailedResponse: assessment.assessment_results?.aiResponse || '',
      gradeRating: assessment.assessment_results?.gradeRating || 'B-',
      pourScores: assessment.assessment_results?.pourScores || {
        perceivable: 70,
        operable: 70, 
        understandable: 70,
        robust: 70
      },
      quickWins: assessment.assessment_results?.quickWins || [],
      screenshotUrl: assessment.screenshot_url,
      email: assessment.email,
      companyName: assessment.company_name
    })) || [];

    return new Response(JSON.stringify({ 
      success: true, 
      data: {
        assessments: transformedAssessments,
        pagination: {
          limit,
          offset,
          total: count || 0,
          hasMore: (offset + limit) < (count || 0)
        }
      }
    }), { 
      headers: { 'content-type': 'application/json' } 
    });

  } catch (error) {
    console.error('Assessments API error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Internal server error' 
    }), { 
      status: 500, 
      headers: { 'content-type': 'application/json' } 
    });
  }
}

// GET single assessment by ID
export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Assessment ID is required' 
      }), { 
        status: 400, 
        headers: { 'content-type': 'application/json' } 
      });
    }

    const supabase = getSupabaseServer();
    
    const { data: assessment, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !assessment) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Assessment not found' 
      }), { 
        status: 404, 
        headers: { 'content-type': 'application/json' } 
      });
    }

    // Transform to AssessmentResult format
    const transformedAssessment = {
      id: assessment.id,
      websiteUrl: assessment.website_url,
      overallScore: assessment.overall_score,
      totalIssues: assessment.total_issues,
      criticalIssues: assessment.critical_issues,
      highImpactIssues: assessment.high_impact_issues,
      mediumImpactIssues: assessment.medium_impact_issues,
      lowImpactIssues: assessment.low_impact_issues,
      issues: assessment.assessment_results?.issues || [],
      recommendations: [
        'Review critical accessibility issues first',
        'Implement systematic accessibility testing',
        'Consider automated testing tools',
        'Train development team on WCAG standards'
      ],
      estimatedImpact: `${Math.round((100 - assessment.overall_score) / 100 * 20)}% of users may encounter barriers`,
      createdAt: assessment.created_at,
      aiDetailedResponse: assessment.assessment_results?.aiResponse || '',
      gradeRating: assessment.assessment_results?.gradeRating || 'B-',
      pourScores: assessment.assessment_results?.pourScores || {
        perceivable: 70,
        operable: 70,
        understandable: 70,
        robust: 70
      },
      quickWins: assessment.assessment_results?.quickWins || [],
      screenshotUrl: assessment.screenshot_url,
      email: assessment.email,
      companyName: assessment.company_name
    };

    return new Response(JSON.stringify({ 
      success: true, 
      data: transformedAssessment
    }), { 
      headers: { 'content-type': 'application/json' } 
    });

  } catch (error) {
    console.error('Single assessment API error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Internal server error' 
    }), { 
      status: 500, 
      headers: { 'content-type': 'application/json' } 
    });
  }
}