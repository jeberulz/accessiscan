import { NextRequest } from 'next/server';
import { AssessmentResult } from '@/shared/types';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { assessmentId, format, assessment } = await request.json();
    
    if (!format || !['pdf', 'csv'].includes(format)) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Invalid export format. Use "pdf" or "csv"' 
      }), { 
        status: 400, 
        headers: { 'content-type': 'application/json' } 
      });
    }

    let assessmentData: AssessmentResult;
    
    if (assessment) {
      assessmentData = assessment;
    } else if (assessmentId) {
      // Fetch assessment from database if only ID provided
      const { getSupabaseServer } = await import('@/lib/supabase-server');
      const supabase = getSupabaseServer();
      
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', assessmentId)
        .single();
        
      if (error || !data) {
        return new Response(JSON.stringify({ 
          success: false, 
          message: 'Assessment not found' 
        }), { 
          status: 404, 
          headers: { 'content-type': 'application/json' } 
        });
      }
      
      // Transform database record to AssessmentResult format
      assessmentData = {
        id: data.id,
        websiteUrl: data.website_url,
        overallScore: data.overall_score,
        totalIssues: data.total_issues,
        criticalIssues: data.critical_issues,
        highImpactIssues: data.high_impact_issues,
        mediumImpactIssues: data.medium_impact_issues,
        lowImpactIssues: data.low_impact_issues,
        issues: data.assessment_results?.issues || [],
        recommendations: [
          'Review critical accessibility issues first',
          'Implement systematic accessibility testing',
          'Consider automated testing tools',
          'Train development team on WCAG standards'
        ],
        estimatedImpact: `${Math.round((100 - data.overall_score) / 100 * 20)}% of users may encounter barriers`,
        createdAt: data.created_at,
        aiDetailedResponse: data.assessment_results?.aiResponse || '',
        gradeRating: data.assessment_results?.gradeRating || 'B-',
        pourScores: data.assessment_results?.pourScores || {
          perceivable: 70, operable: 70, understandable: 70, robust: 70
        },
        quickWins: data.assessment_results?.quickWins || [],
        screenshotUrl: data.screenshot_url
      };
    } else {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Either assessment data or assessmentId is required' 
      }), { 
        status: 400, 
        headers: { 'content-type': 'application/json' } 
      });
    }

    if (format === 'csv') {
      const csvContent = generateCSV(assessmentData);
      const filename = `accessibility-report-${assessmentData.websiteUrl.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
      
      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      });
    } else if (format === 'pdf') {
      // For PDF generation, we'll return structured data that the client can use
      // with a library like jsPDF or Puppeteer (client-side generation is more reliable)
      const reportData = generatePDFData(assessmentData);
      
      return new Response(JSON.stringify({ 
        success: true, 
        data: reportData,
        filename: `accessibility-report-${assessmentData.websiteUrl.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
      }), { 
        headers: { 'content-type': 'application/json' } 
      });
    }

  } catch (error) {
    console.error('Export API error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Export generation failed' 
    }), { 
      status: 500, 
      headers: { 'content-type': 'application/json' } 
    });
  }
}

function generateCSV(assessment: AssessmentResult): string {
  const headers = [
    'Website URL',
    'Assessment Date', 
    'Overall Score',
    'Grade',
    'Total Issues',
    'Critical Issues',
    'High Impact Issues',
    'Medium Impact Issues', 
    'Low Impact Issues',
    'Issue Type',
    'Issue Description',
    'Impact Level',
    'WCAG Level',
    'Recommendation',
    'Estimated User Impact'
  ];

  let csvContent = headers.join(',') + '\\n';

  // Add summary row
  const summaryRow = [
    `"${assessment.websiteUrl}"`,
    `"${new Date(assessment.createdAt).toLocaleDateString()}"`,
    assessment.overallScore,
    `"${assessment.gradeRating}"`,
    assessment.totalIssues,
    assessment.criticalIssues,
    assessment.highImpactIssues,
    assessment.mediumImpactIssues,
    assessment.lowImpactIssues,
    '"SUMMARY"',
    `"Overall accessibility assessment for ${assessment.websiteUrl}"`,
    '"SUMMARY"',
    '"WCAG 2.1 AA"',
    '"See individual issues below"',
    `"${assessment.estimatedImpact}"`
  ];
  csvContent += summaryRow.join(',') + '\\n';

  // Add individual issues
  assessment.issues.forEach(issue => {
    const issueRow = [
      `"${assessment.websiteUrl}"`,
      `"${new Date(assessment.createdAt).toLocaleDateString()}"`,
      assessment.overallScore,
      `"${assessment.gradeRating}"`,
      assessment.totalIssues,
      assessment.criticalIssues,
      assessment.highImpactIssues,
      assessment.mediumImpactIssues,
      assessment.lowImpactIssues,
      `"${issue.type}"`,
      `"${issue.description.replace(/"/g, '""')}"`, // Escape quotes in CSV
      `"${issue.impact}"`,
      `"${issue.wcagLevel}"`,
      `"${issue.recommendation.replace(/"/g, '""')}"`, // Escape quotes in CSV
      `"${assessment.estimatedImpact}"`
    ];
    csvContent += issueRow.join(',') + '\\n';
  });

  return csvContent;
}

function generatePDFData(assessment: AssessmentResult) {
  return {
    title: `Accessibility Assessment Report`,
    subtitle: `${assessment.websiteUrl}`,
    date: new Date(assessment.createdAt).toLocaleDateString(),
    summary: {
      overallScore: assessment.overallScore,
      gradeRating: assessment.gradeRating,
      totalIssues: assessment.totalIssues,
      breakdown: {
        critical: assessment.criticalIssues,
        high: assessment.highImpactIssues,
        medium: assessment.mediumImpactIssues,
        low: assessment.lowImpactIssues
      }
    },
    pourScores: assessment.pourScores,
    issues: assessment.issues.map(issue => ({
      type: issue.type,
      description: issue.description,
      impact: issue.impact,
      wcagLevel: issue.wcagLevel,
      recommendation: issue.recommendation,
      element: issue.element
    })),
    quickWins: assessment.quickWins,
    recommendations: assessment.recommendations,
    estimatedImpact: assessment.estimatedImpact,
    screenshotUrl: assessment.screenshotUrl
  };
}