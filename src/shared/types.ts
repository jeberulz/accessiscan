import z from "zod";

// Assessment request schema
export const AssessmentRequestSchema = z.object({
  websiteUrl: z.string().url("Please enter a valid website URL").optional(),
  imageFile: z.string().optional(), // Base64 encoded image
  assessmentType: z.enum(['url', 'image']),
  email: z.string().email("Please enter a valid email address").optional(),
  companyName: z.string().min(1, "Company name is required").optional(),
}).refine((data) => {
  if (data.assessmentType === 'url') {
    return !!data.websiteUrl;
  }
  if (data.assessmentType === 'image') {
    return !!data.imageFile;
  }
  return false;
}, {
  message: "Either website URL or image file is required",
});

export type AssessmentRequest = z.infer<typeof AssessmentRequestSchema>;

// Assessment result schemas
export const AccessibilityIssueSchema = z.object({
  type: z.string(),
  description: z.string(),
  impact: z.enum(['critical', 'high', 'medium', 'low']),
  wcagLevel: z.string(),
  element: z.string().optional(),
  recommendation: z.string(),
});

export type AccessibilityIssue = z.infer<typeof AccessibilityIssueSchema>;

export const AssessmentResultSchema = z.object({
  id: z.number(),
  websiteUrl: z.string(),
  overallScore: z.number().min(0).max(100),
  totalIssues: z.number(),
  criticalIssues: z.number(),
  highImpactIssues: z.number(),
  mediumImpactIssues: z.number(),
  lowImpactIssues: z.number(),
  issues: z.array(AccessibilityIssueSchema),
  recommendations: z.array(z.string()),
  estimatedImpact: z.string(),
  createdAt: z.string(),
  aiDetailedResponse: z.string().optional(),
  gradeRating: z.string().optional(),
  pourScores: z.object({
    perceivable: z.number(),
    operable: z.number(),
    understandable: z.number(),
    robust: z.number(),
  }).optional(),
  quickWins: z.array(z.object({
    title: z.string(),
    impact: z.string(),
    effort: z.string(),
    eta: z.string(),
  })).optional(),
  screenshotUrl: z.string().optional(),
});

export type AssessmentResult = z.infer<typeof AssessmentResultSchema>;

// Lead capture schema
export const LeadCaptureSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  companyName: z.string().min(1, "Company name is required"),
  websiteUrl: z.string().url("Please enter a valid website URL"),
  contactPreferences: z.array(z.string()).default([]),
});

export type LeadCapture = z.infer<typeof LeadCaptureSchema>;

// API Response schemas
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
});

export type ApiResponse<T = any> = {
  success: boolean;
  message?: string;
  data?: T;
};
