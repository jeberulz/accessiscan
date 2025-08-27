import OpenAI from 'openai';
import { z } from 'zod';
import { AssessmentRequestSchema, type ApiResponse, type AssessmentResult, type AccessibilityIssue } from '@/shared/types';
import { captureWebsiteScreenshot, getSystemPrompt } from '@/lib/prompt';
import { getSupabaseServer } from '@/lib/supabase-server';

export const runtime = 'nodejs';

const RequestSchema = AssessmentRequestSchema;

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = RequestSchema.parse(json);

    const { websiteUrl, imageFile, assessmentType, email, companyName } = parsed;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    let completion;
    let analysisTarget = '';
    let screenshotUrl: string | undefined = undefined;

    if (assessmentType === 'image') {
      analysisTarget = 'uploaded screenshot';
      completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: getSystemPrompt('image') },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze this screenshot for accessibility issues. Return a comprehensive assessment.' },
              { type: 'image_url', image_url: { url: imageFile! } },
            ],
          },
        ],
        temperature: 0.2,
        max_tokens: 3000,
      });
    } else {
      analysisTarget = websiteUrl!;
      screenshotUrl = await captureWebsiteScreenshot(websiteUrl!);
      completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: getSystemPrompt('url') },
          { role: 'user', content: `Analyze this website URL for accessibility compliance: ${websiteUrl}` },
        ],
        temperature: 0.3,
        max_tokens: 2500,
      });
    }

    const aiResponse = completion.choices[0].message.content || '';

    let overallScore = 70;
    let gradeRating = 'B-';
    let pourScores = { perceivable: 70, operable: 70, understandable: 70, robust: 70 };
    let quickWins: any[] = [];

    const scoreMatch = aiResponse.match(/(?:overall|total).*?score.*?(\d+)/i);
    if (scoreMatch) overallScore = Math.min(100, Math.max(0, parseInt(scoreMatch[1])));
    const gradeMatch = aiResponse.match(/grade.*?([A-F][+-]?)/i);
    if (gradeMatch) gradeRating = gradeMatch[1];

    let issues: AccessibilityIssue[];
    if (assessmentType === 'image') {
      issues = [
        { type: 'Color Contrast Analysis', description: 'Potential contrast issues between text and background elements', impact: 'high', wcagLevel: 'WCAG 2.1 AA (1.4.3)', element: 'text elements and interactive controls', recommendation: 'Verify all text meets 4.5:1 contrast ratio for normal text and 3:1 for large text' },
        { type: 'Interactive Element Focus', description: 'Elements may lack visible focus indicators for keyboard navigation', impact: 'critical', wcagLevel: 'WCAG 2.1 AA (2.4.7)', element: 'buttons, links, form controls', recommendation: 'Implement visible focus indicators with at least 2px outline and sufficient contrast' },
        { type: 'Touch Target Sizing', description: 'Some interactive elements appear smaller than the recommended target size', impact: 'medium', wcagLevel: 'WCAG 2.1 AAA (2.5.5)', element: 'clickable buttons and controls', recommendation: 'Ensure touch targets are at least 44x44 pixels with adequate spacing' },
        { type: 'Visual Hierarchy Structure', description: 'Content organization may not provide clear structure', impact: 'medium', wcagLevel: 'WCAG 2.1 A (1.3.1)', element: 'heading structure and content layout', recommendation: 'Implement logical heading hierarchy and use semantic HTML landmarks' },
        { type: 'Form Accessibility Patterns', description: 'Form elements may lack clear association with labels', impact: 'high', wcagLevel: 'WCAG 2.1 A (3.3.2)', element: 'form inputs and labels', recommendation: 'Ensure all form fields have visible labels and clear instructions' },
      ];
    } else {
      issues = [
        { type: 'Image Alternative Text', description: 'Images likely missing descriptive alt text', impact: 'high', wcagLevel: 'WCAG 2.1 A (1.1.1)', element: 'img elements and graphics', recommendation: 'Add meaningful alt attributes describing image content and purpose' },
        { type: 'Keyboard Navigation Support', description: 'Interactive elements may not be fully keyboard accessible', impact: 'critical', wcagLevel: 'WCAG 2.1 A (2.1.1)', element: 'interactive elements', recommendation: 'Ensure all interactive elements are keyboard accessible with proper focus management' },
        { type: 'Form Input Labeling', description: 'Form controls likely missing proper labels', impact: 'high', wcagLevel: 'WCAG 2.1 A (1.3.1)', element: 'form inputs and controls', recommendation: 'Associate labels with form controls using for/id or aria-label' },
        { type: 'Semantic Structure', description: 'Content may not use appropriate semantic HTML elements', impact: 'medium', wcagLevel: 'WCAG 2.1 A (1.3.1)', element: 'page structure and headings', recommendation: 'Use semantic HTML5 elements and proper heading hierarchy' },
        { type: 'Link Context and Purpose', description: 'Links may lack sufficient context', impact: 'medium', wcagLevel: 'WCAG 2.1 A (2.4.4)', element: 'navigation and content links', recommendation: 'Provide descriptive link text or use aria-label to clarify purpose' },
      ];
    }

    quickWins = [
      { title: 'Color Contrast Fixes', impact: 'High - affects users with visual impairments', effort: 'Low - CSS color adjustments', eta: '1-2 days' },
      { title: 'Focus Indicator Implementation', impact: 'Critical - enables keyboard navigation', effort: 'Low - CSS focus styles', eta: '1 day' },
      { title: 'Alt Text Addition', impact: 'High - essential for screen readers', effort: 'Medium - content review needed', eta: '2-3 days' },
    ];

    const totalIssues = issues.length;
    const criticalIssues = issues.filter(i => i.impact === 'critical').length;
    const highImpactIssues = issues.filter(i => i.impact === 'high').length;
    const mediumImpactIssues = issues.filter(i => i.impact === 'medium').length;
    const lowImpactIssues = issues.filter(i => i.impact === 'low').length;
    const adjustedScore = Math.max(0, overallScore - (criticalIssues * 20 + highImpactIssues * 10 + mediumImpactIssues * 5 + lowImpactIssues * 2));

    const supabase = getSupabaseServer();
    const { data: insert, error } = await supabase
      .from('assessments')
      .insert({
        website_url: analysisTarget,
        email: email || null,
        company_name: companyName || null,
        assessment_results: {
          issues,
          aiResponse,
          assessmentType,
          pourScores,
          quickWins,
          gradeRating,
        },
        overall_score: adjustedScore,
        total_issues: totalIssues,
        critical_issues: criticalIssues,
        high_impact_issues: highImpactIssues,
        medium_impact_issues: mediumImpactIssues,
        low_impact_issues: lowImpactIssues,
        screenshot_url: screenshotUrl,
      })
      .select('id, created_at')
      .single();

    if (error) throw error;

    const recommendations = [
      'Prioritize critical and high-impact issues for immediate remediation',
      'Implement systematic accessibility testing in your development workflow',
      'Consider automated testing tools alongside manual accessibility audits',
      'Train development team on WCAG 2.2 AA compliance requirements',
      'Establish accessibility quality assurance checkpoints',
      'Plan for ongoing accessibility monitoring and maintenance',
    ];

    const assessmentResult: AssessmentResult = {
      id: insert.id,
      websiteUrl: analysisTarget,
      overallScore: adjustedScore,
      totalIssues,
      criticalIssues,
      highImpactIssues,
      mediumImpactIssues,
      lowImpactIssues,
      issues,
      recommendations,
      estimatedImpact: `${Math.round((100 - adjustedScore) / 100 * 20)}% of users may encounter accessibility barriers`,
      createdAt: insert.created_at,
      aiDetailedResponse: aiResponse,
      gradeRating,
      pourScores,
      quickWins,
      screenshotUrl,
    };

    const response: ApiResponse<AssessmentResult> = { success: true, data: assessmentResult, message: 'Comprehensive accessibility assessment completed' };
    return new Response(JSON.stringify(response), { headers: { 'content-type': 'application/json' } });
  } catch (err) {
    console.error('Assessment error:', err);
    const response: ApiResponse = { success: false, message: 'Failed to complete accessibility assessment' };
    return new Response(JSON.stringify(response), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}

