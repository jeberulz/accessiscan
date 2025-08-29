import OpenAI from 'openai';
import { z } from 'zod';
import { AssessmentRequestSchema, type ApiResponse, type AssessmentResult, type AccessibilityIssue } from '@/shared/types';
import { captureWebsiteScreenshot, getSystemPrompt } from '@/lib/prompt';
import { getSupabaseServer } from '@/lib/supabase-server';
import { crawlPage } from '@/lib/crawler';
import { EnrichedAnalysisData } from '@/lib/analysis-types';

export const runtime = 'nodejs';

const RequestSchema = AssessmentRequestSchema;

// Server-side image validation helpers
const ALLOWED_IMAGE_MIME = new Set(['image/png', 'image/jpeg']);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

const parseDataUrl = (dataUrl: string): { mime: string; base64: string } | null => {
  const match = /^data:([^;]+);base64,(.+)$/i.exec(dataUrl || '');
  if (!match) return null;
  return { mime: match[1].toLowerCase(), base64: match[2] };
};

const hasValidMagicBytes = (mime: string, bytes: Uint8Array): boolean => {
  if (mime === 'image/png') {
    const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return sig.every((b, i) => bytes[i] === b);
  }
  if (mime === 'image/jpeg') {
    // JPEG starts with FFD8FF and ends with FFD9 (end check is optional)
    const startOk = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    return !!startOk;
  }
  return false;
};

// Helper to extract first balanced JSON block before HUMAN_SUMMARY
const extractFirstJsonObject = (s: string): string | null => {
  const summaryIdx = s.indexOf('--- HUMAN_SUMMARY ---');
  const text = summaryIdx >= 0 ? s.slice(0, summaryIdx) : s;
  const start = text.indexOf('{');
  if (start < 0) return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escape) { escape = false; continue; }
      if (ch === '\\') { escape = true; continue; }
      if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
};

// Zod schema for the optimized MACHINE_OUTPUT
const AiOptimizedSchema = z.object({
  audit_id: z.string(),
  target_summary: z.object({
    type: z.enum(['web','ios','android','hybrid']).optional(),
    pages_or_components: z.array(z.string()).optional(),
    assumptions: z.array(z.string()).optional(),
  }).optional(),
  overall: z.object({
    grade: z.string(),
    score_0_to_100: z.number(),
    confidence_0_to_1: z.number().optional(),
    pour_scores: z.object({
      perceivable: z.number(), operable: z.number(), understandable: z.number(), robust: z.number()
    })
  }),
  top_findings: z.array(z.object({
    id: z.string(),
    title: z.string(),
    wcag_refs: z.array(z.string()).optional(),
    pour: z.string().optional(),
    severity_1_to_5: z.number(),
    reach_1_to_5: z.number(),
    frequency_1_to_5: z.number(),
    impact_score: z.number(),
    effort_1_to_5: z.number(),
    priority_score: z.number(),
    confidence_0_to_1: z.number().optional(),
    affected_user_groups: z.array(z.string()).optional(),
    business_impact: z.string().optional(),
    evidence: z.object({
      selectors: z.array(z.string()).optional(),
      snippets: z.array(z.string()).optional(),
      colors: z.array(z.object({ fg: z.string(), bg: z.string(), contrast: z.number().optional() })).optional(),
      locations: z.array(z.string()).optional(),
      instance_count: z.number().optional(),
      specific_files: z.array(z.string()).optional(),
    }).optional(),
    recommended_fix: z.array(z.string()).optional(),
    developer_notes: z.string().optional(),
    test_steps: z.array(z.string()).optional(),
  })),
  summary_stats: z.object({
    issue_count: z.number(),
    high_priority_count: z.number().optional(),
    est_time_to_relief: z.string().optional(),
    estimated_users_impacted_percent: z.number().optional(),
  }),
  quick_wins: z.array(z.object({ id: z.string(), why_now: z.string().optional(), eta: z.string().optional() })).optional(),
  visualization_spec: z.any().optional(),
  cta: z.object({
    next_steps: z.array(z.string()).optional(),
    lead_capture_copy: z.string().optional(),
    lead_capture_fields: z.array(z.string()).optional(),
  }).optional(),
  disclaimers: z.array(z.string()).optional(),
});

// Existing lightweight schemas for previous JSON format
const AiIssueSchema = z.object({
  id: z.number().optional(),
  category: z.string().optional(),
  title: z.string().optional(),
  description: z.string(),
  userImpact: z.string().optional(),
  impact: z.enum(['critical', 'high', 'medium', 'low']).optional().default('medium'),
  wcagRefs: z.array(z.string()).optional(),
  wcagLevel: z.string().optional().default('WCAG 2.2 AA'),
  instances: z.number().optional(),
  selectors: z.array(z.string()).optional(),
  evidence: z.object({ snippets: z.array(z.string()).optional() }).optional(),
  codeExample: z.object({ bad: z.string().optional(), good: z.string().optional() }).optional(),
  remediationSteps: z.array(z.string()).optional(),
  timeEstimate: z.string().optional(),
  severity: z.number().optional(),
  reach: z.number().optional(),
  frequency: z.number().optional(),
  impactScore: z.number().optional(),
  effort: z.number().optional(),
  priorityScore: z.number().optional(),
  confidence: z.number().optional(),
  quickFix: z.boolean().optional(),
  previewHighlights: z.array(z.object({ x: z.number(), y: z.number(), w: z.number(), h: z.number(), note: z.string().optional() })).optional(),
});

const AiResponseSchema = z.object({
  overall: z.object({
    grade: z.string(),
    score: z.number(),
    pourScores: z.object({ perceivable: z.number(), operable: z.number(), understandable: z.number(), robust: z.number() }),
    confidence: z.number().optional(),
    potentialScore: z.number().optional(),
  }),
  issueCategories: z.array(z.object({ name: z.string(), impact: z.enum(['critical', 'high', 'medium', 'low']).optional(), count: z.number().optional(), indices: z.array(z.number()).optional() })).optional(),
  issues: z.array(AiIssueSchema),
  recommendations: z.array(z.string()).optional(),
  quickWins: z.array(z.object({ title: z.string(), impact: z.string().optional(), effort: z.string().optional(), eta: z.string().optional(), steps: z.array(z.string()).optional() })).optional(),
  businessImpact: z.object({ usersAffectedPercent: z.number().optional(), legalRiskNote: z.string().optional() }).optional(),
});

export async function POST(req: Request) {
  try {
    // Validate content type
    const contentType = req.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return new Response(JSON.stringify({ success: false, message: 'Content-Type must be application/json' }), { status: 400, headers: { 'content-type': 'application/json' } });
    }

    // Parse and validate request body
    let json;
    try { json = await req.json(); } catch { return new Response(JSON.stringify({ success: false, message: 'Invalid JSON in request body' }), { status: 400, headers: { 'content-type': 'application/json' } }); }

    // Validate against schema
    let parsed;
    try { parsed = RequestSchema.parse(json); } catch (error: any) {
      return new Response(JSON.stringify({ success: false, message: 'Invalid request data', errors: error.errors }), { status: 400, headers: { 'content-type': 'application/json' } });
    }

    const { websiteUrl, imageFile, assessmentType, email, companyName } = parsed;

    if (!process.env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ success: false, message: 'OpenAI API key not configured' }), { status: 500, headers: { 'content-type': 'application/json' } });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    let completion;
    let analysisTarget = '';
    let screenshotUrl: string | undefined = undefined;

    try {
      if (assessmentType === 'image') {
        // Strict server-side validation of data URL
        if (!imageFile) {
          return new Response(JSON.stringify({ success: false, message: 'Image file is required' }), { status: 400, headers: { 'content-type': 'application/json' } });
        }
        const parsed = parseDataUrl(imageFile);
        if (!parsed) {
          return new Response(JSON.stringify({ success: false, message: 'Invalid image data URL format' }), { status: 400, headers: { 'content-type': 'application/json' } });
        }
        const { mime, base64 } = parsed;
        if (!ALLOWED_IMAGE_MIME.has(mime)) {
          return new Response(JSON.stringify({ success: false, message: 'Unsupported image type. Only PNG and JPEG allowed.' }), { status: 415, headers: { 'content-type': 'application/json' } });
        }
        // Basic size check prior to decoding (approx): base64 chars -> bytes ~ 3/4
        const approxBytes = Math.floor((base64.length * 3) / 4);
        if (approxBytes > MAX_IMAGE_BYTES) {
          return new Response(JSON.stringify({ success: false, message: 'Image too large.' }), { status: 413, headers: { 'content-type': 'application/json' } });
        }
        // Decode safely
        let bytes: Uint8Array;
        try {
          const buf = Buffer.from(base64, 'base64');
          bytes = new Uint8Array(buf);
        } catch (_) {
          return new Response(JSON.stringify({ success: false, message: 'Failed to decode image data.' }), { status: 400, headers: { 'content-type': 'application/json' } });
        }
        // Magic byte validation
        if (!hasValidMagicBytes(mime, bytes)) {
          return new Response(JSON.stringify({ success: false, message: 'Image magic bytes do not match MIME type.' }), { status: 400, headers: { 'content-type': 'application/json' } });
        }
        // Enforce size after decode as well
        if (bytes.byteLength > MAX_IMAGE_BYTES) {
          return new Response(JSON.stringify({ success: false, message: 'Image too large after decoding.' }), { status: 413, headers: { 'content-type': 'application/json' } });
        }

        // Do not render or execute user-provided data. Send as image_url data URI to the model only.
        analysisTarget = 'uploaded screenshot';
        completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: getSystemPrompt('image') },
            { role: 'user', content: [ { type: 'text', text: `Return MACHINE_OUTPUT JSON followed by a line '--- HUMAN_SUMMARY ---' then the human summary. Analyze this screenshot.` }, { type: 'image_url', image_url: { url: `data:${mime};base64,${base64}` } } ] },
          ],
          max_tokens: 3000,
          temperature: 0.2,
        });
      } else {
        analysisTarget = websiteUrl!;
        try { screenshotUrl = await captureWebsiteScreenshot(websiteUrl!); } catch (screenshotError) { console.warn('Screenshot capture failed:', screenshotError); }
        
        // Extract comprehensive data from the website
        let enrichedData: EnrichedAnalysisData | null = null;
        try {
          enrichedData = await crawlPage(websiteUrl!);
          console.log(`Extracted ${enrichedData.images.length} images, ${enrichedData.forms.forms.length} forms, ${enrichedData.headings.length} headings`);
        } catch (crawlError) {
          console.warn('Enhanced crawling failed, falling back to basic analysis:', crawlError);
        }

        // Create detailed analysis prompt with structured data
        const analysisPrompt = enrichedData
          ? `Return MACHINE_OUTPUT JSON followed by a line '--- HUMAN_SUMMARY ---' then the human summary.

COMPREHENSIVE ACCESSIBILITY ANALYSIS for: ${websiteUrl}

STRUCTURED DATA PROVIDED:
=========================

PAGE METADATA:
- Title: ${enrichedData.pageMetadata?.title ?? 'not specified'}
- Viewport: ${enrichedData.pageMetadata?.viewport ?? 'not specified'}

IMAGES ANALYSIS (${enrichedData.images.length} total):
${enrichedData.images.map((img, i) => 
  `${i + 1}. ${img.src} - Alt: ${img.alt || 'MISSING'} - Selector: ${img.selector} - Decorative: ${img.isDecorative}`
).join('\n')}

FORMS ANALYSIS:
- Total Forms: ${enrichedData.forms.forms.length}
- Unlabeled Inputs: ${enrichedData.forms.unlabeledInputs.length}
- Missing Fieldsets: ${enrichedData.forms.missingFieldsets.length}
- Missing Required Indicators: ${enrichedData.forms.missingRequired.length}

HEADINGS STRUCTURE (${enrichedData.headings.length} total):
${enrichedData.headings.map((h, i) => 
  `${i + 1}. H${h.level}: "${h.text}" - Selector: ${h.selector} - Empty: ${h.isEmpty}`
).join('\n')}

LINKS ANALYSIS (${enrichedData.links.length} total):
${enrichedData.links.map((link, i) => 
  `${i + 1}. "${link.text}" -> ${link.href} - Generic: ${link.hasGenericText} - Empty: ${link.isEmptyLink}`
).join('\n')}

COLOR CONTRAST ANALYSIS (${enrichedData.colors.length} combinations):
${enrichedData.colors.map((color, i) => 
  `${i + 1}. ${color.foreground} on ${color.background} - Contrast: ${color.contrast} - AA: ${color.meetsAA} - Context: ${color.context}`
).join('\n')}

INTERACTIVE ELEMENTS (${enrichedData.interactiveElements.length} total):
${enrichedData.interactiveElements.map((el, i) => 
  `${i + 1}. ${el.tagName} - Touch Target: ${el.touchTargetSize.width}x${el.touchTargetSize.height} - Meets Size: ${el.meetsTouchTargetSize} - Focusable: ${el.isFocusable}`
).join('\n')}

LANDMARKS (${enrichedData.landmarks.length} total):
${enrichedData.landmarks.map((landmark, i) => 
  `${i + 1}. ${landmark.landmarkType} - Has Label: ${landmark.hasLabel} - Selector: ${landmark.selector}`
).join('\n')}

DOCUMENT STRUCTURE:
- Has H1: ${enrichedData.documentStructure.hasH1}
- H1 Count: ${enrichedData.documentStructure.h1Count}
- Skip Links: ${enrichedData.documentStructure.skipLinkCount}
- Landmark Count: ${enrichedData.documentStructure.landmarkCount}

FIND MINIMUM 15-20 SPECIFIC ISSUES with exact evidence from this data.`
          : `Return MACHINE_OUTPUT JSON followed by a line '--- HUMAN_SUMMARY ---' then the human summary. Analyze: ${websiteUrl}`;

        completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: getSystemPrompt('url') },
            { role: 'user', content: analysisPrompt },
          ],
          max_tokens: 5000, // Increased token limit for comprehensive analysis
          temperature: 0.2, // Lower temperature for more consistent results
        });
      }
    } catch (aiError: any) {
      console.error('OpenAI API error:', aiError);
      const errorMessage = aiError?.error?.message || aiError?.message || 'Failed to analyze content';
      return new Response(JSON.stringify({ success: false, message: `AI analysis failed: ${errorMessage}` }), { status: 500, headers: { 'content-type': 'application/json' } });
    }

    const raw = completion.choices[0].message.content || '';

    // Try optimized JSON first (dual-output)
    let optimizedParsed: z.infer<typeof AiOptimizedSchema> | null = null;
    let humanSummary: string | undefined = undefined;
    const jsonBlock = extractFirstJsonObject(raw);
    if (jsonBlock) {
      try {
        const obj = JSON.parse(jsonBlock);
        optimizedParsed = AiOptimizedSchema.parse(obj);
        const delim = '--- HUMAN_SUMMARY ---';
        const idx = raw.indexOf(delim);
        if (idx >= 0) humanSummary = raw.slice(idx + delim.length).trim();
      } catch (_) { optimizedParsed = null; }
    }

    // Defaults
    let overallScore = 70;
    let gradeRating = 'B-';
    let pourScores = { perceivable: 70, operable: 70, understandable: 70, robust: 70 };
    let quickWins: any[] = [];
    let issues: AccessibilityIssue[] = [];
    let potentialScore: number | undefined = undefined;
    let recommendations: string[] = [];
    let businessImpact: { usersAffectedPercent?: number; legalRiskNote?: string } | undefined = undefined;

    if (optimizedParsed) {
      overallScore = Math.max(0, Math.min(100, Math.round(optimizedParsed.overall.score_0_to_100)));
      gradeRating = optimizedParsed.overall.grade;
      pourScores = optimizedParsed.overall.pour_scores;

      issues = optimizedParsed.top_findings.map((f, idx) => ({
        type: f.title,
        description: f.business_impact || 'See evidence and recommended fixes',
        impact: (f.severity_1_to_5 >= 5 || f.priority_score >= 20) ? 'critical' : (f.severity_1_to_5 >= 4 ? 'high' : (f.severity_1_to_5 >= 3 ? 'medium' : 'low')),
        wcagLevel: (f.wcag_refs && f.wcag_refs.length) ? `WCAG ${f.wcag_refs.join(', ')}` : 'WCAG 2.2 AA',
        element: f.evidence?.selectors?.[0],
        recommendation: (f.recommended_fix || []).join('; ') || f.developer_notes || 'Follow WCAG 2.2 standards to remediate.',
        id: idx,
        category: f.pour,
        title: f.title,
        userImpact: f.business_impact,
        wcagRefs: f.wcag_refs,
        selectors: f.evidence?.selectors,
        evidence: { snippets: f.evidence?.snippets },
        remediationSteps: f.recommended_fix,
        severity: f.severity_1_to_5,
        reach: f.reach_1_to_5,
        frequency: f.frequency_1_to_5,
        impactScore: f.impact_score,
        effort: f.effort_1_to_5,
        priorityScore: f.priority_score,
        confidence: f.confidence_0_to_1,
      }));

      recommendations = optimizedParsed.cta?.next_steps || [];
      quickWins = (optimizedParsed.quick_wins || []).map(q => ({ title: q.id, impact: q.why_now || 'High impact / low effort', effort: 'Varies', eta: q.eta || '1-3 days' }));
      if (optimizedParsed.summary_stats.estimated_users_impacted_percent !== undefined) {
        businessImpact = { usersAffectedPercent: optimizedParsed.summary_stats.estimated_users_impacted_percent, legalRiskNote: optimizedParsed.disclaimers?.[0] };
      }
    } else {
      // Legacy JSON prompt path
      let aiJsonParsed: z.infer<typeof AiResponseSchema> | null = null;
      try { aiJsonParsed = AiResponseSchema.parse(JSON.parse(raw.replace(/^```(?:json)?/i, '').replace(/```\s*$/i, '').trim())); } catch { aiJsonParsed = null; }

      if (aiJsonParsed) {
        overallScore = Math.max(0, Math.min(100, Math.round(aiJsonParsed.overall.score)));
        gradeRating = aiJsonParsed.overall.grade;
        pourScores = aiJsonParsed.overall.pourScores;
        potentialScore = aiJsonParsed.overall.potentialScore;
        issues = aiJsonParsed.issues.map((i, idx) => ({
          type: i.title || i.category || 'Accessibility Issue',
          description: i.description,
          impact: i.impact || 'medium',
          wcagLevel: i.wcagLevel || 'WCAG 2.2 AA',
          element: i.selectors?.[0] || i.category || undefined,
          recommendation: (i.remediationSteps?.join('; ') || 'Follow WCAG 2.2 standards to remediate.'),
          id: i.id ?? idx,
          category: i.category,
          title: i.title,
          userImpact: i.userImpact,
          wcagRefs: i.wcagRefs,
          instances: i.instances,
          selectors: i.selectors,
          evidence: i.evidence,
          codeExample: i.codeExample,
          remediationSteps: i.remediationSteps,
          timeEstimate: i.timeEstimate,
          severity: i.severity,
          reach: i.reach,
          frequency: i.frequency,
          impactScore: i.impactScore,
          effort: i.effort,
          priorityScore: i.priorityScore,
          confidence: i.confidence,
          quickFix: i.quickFix,
          previewHighlights: i.previewHighlights,
        }));
        recommendations = aiJsonParsed.recommendations || [];
        quickWins = aiJsonParsed.quickWins || [];
        if (aiJsonParsed.businessImpact) businessImpact = aiJsonParsed.businessImpact;
      } else {
        // Fallback to regex path from previous implementation
        const aiResponse = raw;
        const scoreMatches = [
          aiResponse.match(/overall.*?score.*?(\d+)/i),
          aiResponse.match(/total.*?score.*?(\d+)/i),
          aiResponse.match(/accessibility.*?score.*?(\d+)/i),
          aiResponse.match(/score.*?(\d+).*?(?:out of|\/)\s*100/i),
        ];
        for (const match of scoreMatches) { if (match) { overallScore = Math.min(100, Math.max(0, parseInt(match[1]))); break; } }
        const gradeMatch = aiResponse.match(/grade.*?([A-F][+-]?)/i); if (gradeMatch) gradeRating = gradeMatch[1];
        const pourMatches = { perceivable: aiResponse.match(/perceivable.*?(\d+)/i), operable: aiResponse.match(/operable.*?(\d+)/i), understandable: aiResponse.match(/understandable.*?(\d+)/i), robust: aiResponse.match(/robust.*?(\d+)/i) };
        Object.entries(pourMatches).forEach(([key, m]) => { if (m) { (pourScores as any)[key] = Math.min(100, Math.max(0, parseInt(m[1]))); } });
        const fallbackIssues: AccessibilityIssue[] = [ { type: 'General Accessibility Review', description: 'The website may benefit from a comprehensive accessibility review', impact: 'medium', wcagLevel: 'WCAG 2.2 AA', element: 'Website elements', recommendation: 'Conduct thorough accessibility testing including automated tools and manual review' } ];
        issues = fallbackIssues;
        recommendations = [ 'Prioritize critical and high-impact issues for immediate remediation', 'Implement systematic accessibility testing in your development workflow', 'Consider automated testing tools alongside manual accessibility audits' ];
        quickWins = [ { title: 'Color Contrast Fixes', impact: 'High', effort: 'Low', eta: '1-2 days' }, { title: 'Focus Indicators', impact: 'Critical', effort: 'Low', eta: '1 day' }, { title: 'Alt Text Addition', impact: 'High', effort: 'Medium', eta: '2-3 days' } ];
      }
    }

    // Build categories (prefer POUR mapping)
    const categories = (() => {
      const map = new Map<string, { name: string; impact: 'critical'|'high'|'medium'|'low'; indices: number[] }>();
      issues.forEach((iss, idx) => {
        const key = (iss as any).category || iss.type;
        const entry = map.get(key) || { name: key, impact: iss.impact, indices: [] as number[] };
        entry.indices.push(idx);
        const order: any = { critical: 3, high: 2, medium: 1, low: 0 };
        if (order[iss.impact] > order[entry.impact]) entry.impact = iss.impact;
        map.set(key, entry);
      });
      return Array.from(map.values()).map(v => ({ name: v.name, impact: v.impact, count: v.indices.length, indices: v.indices }));
    })();

    // Counts and score
    const totalIssues = issues.length;
    const criticalIssues = issues.filter(i => i.impact === 'critical').length;
    const highImpactIssues = issues.filter(i => i.impact === 'high').length;
    const mediumImpactIssues = issues.filter(i => i.impact === 'medium').length;
    const lowImpactIssues = issues.filter(i => i.impact === 'low').length;
    const adjustedScore = Math.max(0, Math.min(100, overallScore - (criticalIssues * 20 + highImpactIssues * 10 + mediumImpactIssues * 5 + lowImpactIssues * 2)));
    const potential = potentialScore ?? Math.max(adjustedScore, Math.min(100, adjustedScore + 20));

    const supabase = getSupabaseServer();
    const { data: insert, error } = await supabase
      .from('assessments')
      .insert({
        website_url: analysisTarget,
        email: email || null,
        company_name: companyName || null,
        assessment_results: {
          issues,
          assessmentType,
          pourScores,
          quickWins,
          gradeRating,
          businessImpact,
          issueCategories: categories,
          humanSummary,
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

    const defaultRecs = [
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
      recommendations: recommendations.length ? recommendations : defaultRecs,
      estimatedImpact: `${Math.round((100 - adjustedScore) / 100 * 20)}% of users may encounter accessibility barriers`,
      createdAt: insert.created_at,
      aiDetailedResponse: humanSummary, // store HUMAN_SUMMARY rather than raw
      gradeRating,
      pourScores,
      quickWins,
      screenshotUrl,
      potentialScore: potential,
      issueCategories: categories,
      businessImpact,
    };

    const response: ApiResponse<AssessmentResult> = { success: true, data: assessmentResult, message: 'Comprehensive accessibility assessment completed' };
    return new Response(JSON.stringify(response), { headers: { 'content-type': 'application/json' } });
  } catch (err) {
    console.error('Assessment error:', err);
    const response: ApiResponse = { success: false, message: 'Failed to complete accessibility assessment' };
    return new Response(JSON.stringify(response), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}


