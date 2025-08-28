// Enhanced data structures for comprehensive accessibility analysis

export interface PageMetadata {
  title: string;
  lang?: string;
  viewport?: string;
  description?: string;
  charset?: string;
}

export interface ImageAnalysis {
  src: string;
  alt?: string;
  selector: string;
  dimensions: { width: number; height: number };
  isDecorative: boolean;
  hasEmptyAlt: boolean;
  isBackgroundImage: boolean;
  context?: string; // surrounding text context
}

export interface ElementInfo {
  selector: string;
  tagName: string;
  text?: string;
  attributes: Record<string, string>;
  computedStyles?: Record<string, string>;
  boundingBox?: { x: number; y: number; width: number; height: number };
}

export interface FormAnalysis {
  unlabeledInputs: ElementInfo[];
  missingFieldsets: ElementInfo[];
  noErrorAssociation: ElementInfo[];
  missingRequired: ElementInfo[];
  poorInstructions: ElementInfo[];
  inaccessibleValidation: ElementInfo[];
  forms: Array<{
    selector: string;
    inputs: ElementInfo[];
    hasSubmit: boolean;
    hasValidation: boolean;
  }>;
}

export interface HeadingInfo extends ElementInfo {
  level: number; // 1-6
  text: string;
  isEmpty: boolean;
  hasProperNesting: boolean;
}

export interface LinkInfo extends ElementInfo {
  href: string;
  text: string;
  hasGenericText: boolean;
  isEmptyLink: boolean;
  hasTitle: boolean;
  opensInNewWindow: boolean;
}

export interface ColorAnalysis {
  foreground: string;
  background: string;
  selector: string;
  contrast: number;
  meetsAA: boolean;
  meetsAAA: boolean;
  fontSize: number;
  isLargeText: boolean;
  context: string; // what type of text this is
}

export interface InteractiveElementInfo extends ElementInfo {
  isFocusable: boolean;
  hasVisibleFocus: boolean;
  tabIndex?: number;
  role?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  touchTargetSize: { width: number; height: number };
  meetsTouchTargetSize: boolean;
}

export interface AccessibilityNode {
  name?: string;
  role?: string;
  value?: string;
  description?: string;
  selector: string;
  children?: AccessibilityNode[];
  properties?: Record<string, any>;
}

export interface LandmarkInfo extends ElementInfo {
  landmarkType: 'banner' | 'navigation' | 'main' | 'complementary' | 'contentinfo' | 'search' | 'form' | 'region';
  hasLabel: boolean;
  isUnique: boolean;
}

export interface EnrichedAnalysisData {
  url: string;
  htmlSource: string;
  pageMetadata: PageMetadata;
  images: ImageAnalysis[];
  forms: FormAnalysis;
  headings: HeadingInfo[];
  links: LinkInfo[];
  colors: ColorAnalysis[];
  interactiveElements: InteractiveElementInfo[];
  landmarks: LandmarkInfo[];
  accessibilityTree: AccessibilityNode[];
  
  // Additional analysis data
  hasSkipLinks: boolean;
  languageAttributes: Array<{ selector: string; lang: string }>;
  mediaElements: Array<{
    selector: string;
    type: 'video' | 'audio';
    hasControls: boolean;
    hasTranscript: boolean;
    hasCaptions: boolean;
    autoPlays: boolean;
  }>;
  
  // Page structure
  documentStructure: {
    hasH1: boolean;
    h1Count: number;
    headingHierarchy: number[];
    landmarkCount: number;
    skipLinkCount: number;
  };
  
  // Performance and technical info
  extractionMetadata: {
    timestamp: string;
    extractionTime: number;
    pageLoadTime: number;
    errors: string[];
    warnings: string[];
  };
}

// Utility types for issue detection
export interface IssueEvidence {
  selector: string;
  element?: ElementInfo;
  snippet?: string;
  computedValue?: any;
  expectedValue?: any;
  context?: string;
}

export interface DetectedIssue {
  id: string;
  category: 'perceivable' | 'operable' | 'understandable' | 'robust';
  title: string;
  description: string;
  severity: 1 | 2 | 3 | 4 | 5;
  reach: 1 | 2 | 3 | 4 | 5;
  frequency: 1 | 2 | 3 | 4 | 5;
  impactScore: number;
  effort: 1 | 2 | 3 | 4 | 5;
  priorityScore: number;
  confidence: number;
  wcagRefs: string[];
  affectedUserGroups: string[];
  evidence: IssueEvidence[];
  recommendedFix: string[];
  testSteps: string[];
  instanceCount: number;
}
