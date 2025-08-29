## Implementation Plan — Next.js + Vercel + Supabase Migration

### Scope
Rewire the existing AccessiScan app to Next.js (App Router), deploy on Vercel, replace D1 with Supabase, keep UI/UX 1:1.

---

### 1) Project Bootstrapping
- Add Next.js, Tailwind, TS config and alias.
- Create target directory structure.
- Install deps: `next react react-dom tailwindcss postcss autoprefixer zod openai @supabase/supabase-js lucide-react`.

Artifacts:
- `next.config.ts`, `tailwind.config.ts`, `postcss.config.js`, `tsconfig.json`, `src/styles/globals.css`.

### 2) Library/Server Utilities
- `src/lib/supabase-server.ts`: admin client using service role key (server only).
- `src/lib/types.ts`: port zod schemas and types from `src/shared/types.ts`.
- `src/lib/prompt.ts`: move prompt text and screenshot helper.

### 3) API Routes (Parity)
- `src/app/api/assess/route.ts`: port logic from `src/worker/index.ts` assessing both URL and image, compute metrics, insert into `assessments`, return `AssessmentResult`.
- `src/app/api/leads/route.ts`: port leads insert to Supabase.
- `src/app/api/health/route.ts`: JSON health response.
- Prefer `export const runtime = 'edge'`; switch to Node if needed.

### 4) UI Migration (1:1)
- Move components to `src/components`.
- Add `'use client'` at top of interactive components: `Header.tsx`, `AssessmentForm.tsx`, `AssessmentResults.tsx`, `LeadCaptureModal.tsx`.
- Update imports from `@/react-app/...` to `@/components` and `@/lib`.
- Keep Tailwind classes and JSX identical to preserve visuals.

### 5) App Shell
- `src/app/layout.tsx`: import globals, wrap HTML/body.
- `src/app/page.tsx`: move `Home.tsx` logic; state for `assessment` and toggling form/results.

### 6) Supabase Schema
- Create `assessments` and `leads` tables (SQL provided in PRD).
- Optional: enable RLS and policies if client querying is later required (not needed for server-only access with service role).

### 7) Environment Management
- Vercel environment variables: `OPENAI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- Ensure no service key is exposed to client bundles (server-only usage in API routes).

### 8) Testing Checklist
- Local: `npm run dev`, test `/api/health`.
- Run URL assessment and screenshot assessment paths.
- Verify Supabase rows for `assessments` and `leads`.
- Visual parity check for:
  - Landing (form states URL/Image)
  - Loading states
  - Error banners
  - Results dashboard panels (left categories, main issue, right quick fixes)
  - Lead modal (pre and post submit)
  - Screenshot preview render and onError fallback

### 9) Performance & Stability
- Keep OpenAI temps low, token caps as in parity.
- Add basic try/catch around Supabase and OpenAI calls (already in parity code).
- Consider caching thum.io image URL for a short period (future).

### 10) Deployment
- Push branch to GitHub → Import to Vercel → Set envs → Deploy preview.
- Supabase: run SQL in SQL Editor.
- Smoke test all flows in preview, then promote to production.

---

### File-by-File Task Breakdown

1. Create scaffolding files
   - `next.config.ts`, `tailwind.config.ts`, `postcss.config.js`, `tsconfig.json`, `src/styles/globals.css`

2. Create lib files
   - `src/lib/supabase-server.ts`
   - `src/lib/types.ts`
   - `src/lib/prompt.ts`

3. API routes
   - `src/app/api/assess/route.ts`
   - `src/app/api/leads/route.ts`
   - `src/app/api/health/route.ts`

4. Move UI components
   - `src/components/Header.tsx`
   - `src/components/AssessmentForm.tsx`
   - `src/components/AssessmentResults.tsx`
   - `src/components/LeadCaptureModal.tsx`

5. App shell
   - `src/app/layout.tsx`
   - `src/app/page.tsx`

6. Clean up old stack (post-migration)
   - Remove Cloudflare-specific files when safe: `wrangler.jsonc`, `src/worker`, `migrations/`, Vite config, etc.

---

### Risk Mitigation
- If Edge runtime conflicts with OpenAI or Supabase libs, remove `runtime = 'edge'` to use Node runtime on Vercel.
- Validate that large base64 images do not exceed Vercel limit; consider limiting size client-side (already enforced) and/or move to Supabase Storage later.

### Acceptance Gate Before Build Complete
- All API routes returning expected `ApiResponse` shape.
- Supabase persistence verified.
- 1:1 visual parity screenshots captured.
- No TypeScript errors, no console errors in browser.

---

## AI Issue Detection Enhancement Plan

### Problem Analysis
Current AI returns only 1-2 issues per assessment, far below what human auditors find (15-25+ issues). Root causes:

1. **Limited Input Data**: AI only receives URL string or screenshot, no HTML source/DOM structure
2. **Generic Prompting**: Asks for "top findings" vs comprehensive scan
3. **No Specific Evidence**: Missing actual file names, selectors, element details
4. **Token Constraints**: 2500-3000 token limit encourages brevity over thoroughness
5. **Heuristic vs Detailed**: Positioned as "screening" rather than comprehensive audit

### Implementation Phases

#### Phase 1: Data Enrichment (Critical - Week 1)
**Objective**: Provide AI with detailed, structured data for comprehensive analysis

**Tasks:**
1. **HTML Source Extraction**
   - Install Puppeteer/Playwright only in server/worker environment (do not bundle in Edge/client)
   - Explicitly forbid running headless Chromium in Vercel Edge; the crawler must run in a Node runtime (Node serverless function, dedicated Node API endpoint, or separate worker/service)
   - Create `src/lib/crawler.ts` for full DOM extraction (Node runtime only)
   - Add a server endpoint for crawling (e.g., `src/app/api/crawl/route.ts`) and configure it to use Node runtime (e.g., `export const runtime = 'nodejs'`); never call Puppeteer/Playwright from Edge
   - Route all crawl requests through the Node server endpoint/worker; clients never invoke the crawler directly
   - Ensure service-role env vars and any API keys (e.g., `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`) are only available to the Node server/worker runtime and not to the Edge runtime; verify Vercel env scoping accordingly
   - Extract: HTML source, computed styles, accessibility tree
   - Include meta info (title, lang, viewport)

2. **Image Inventory System**
   ```typescript
   interface ImageAnalysis {
     src: string;
     alt?: string;
     selector: string;
     dimensions: { width: number; height: number };
     isDecorative: boolean;
     hasEmptyAlt: boolean;
   }
   ```

3. **Enhanced Screenshot Analysis**
   - Multiple viewports: desktop (1920x1080), mobile (375x667)
   - Element overlay with bounding boxes
   - High-contrast mode screenshots

4. **Prompt Overhaul**
   - Replace "top findings" with "comprehensive scan"
   - Add mandatory minimums: 15+ issues across all POUR categories
   - Demand specific evidence: exact selectors, file names, line numbers
   - Increase token limits to 4000-5000

**Acceptance Criteria:**
- AI receives structured HTML data with element inventories
- Minimum 15 issues returned per assessment
- Each issue includes specific file names/selectors
- All 4 POUR categories covered

#### Phase 2: Systematic Issue Detection (High - Week 2)
**Objective**: Implement comprehensive checks for each accessibility category

**Tasks:**
1. **Form Analysis Deep-dive**
   ```typescript
   interface FormAnalysis {
     unlabeledInputs: ElementInfo[];
     missingFieldsets: ElementInfo[];
     noErrorAssociation: ElementInfo[];
     missingRequired: ElementInfo[];
     poorInstructions: ElementInfo[];
   }
   ```

2. **Color Contrast Computation**
   - Extract all text/background combinations
   - Calculate actual contrast ratios
   - Include hover/focus states
   - Test disabled elements

3. **Heading Hierarchy Analysis**
   - Complete h1-h6 structure extraction
   - Identify gaps and improper nesting
   - Check for missing h1 or multiple h1s

4. **Link Analysis**
   - Extract all `<a>` elements with text content
   - Identify generic text ("click here", "read more")
   - Check for empty links or missing href

**Acceptance Criteria:**
- Specific file names in image alt text issues
- Exact contrast ratios for color issues  
- Complete form field inventory with missing labels
- Detailed heading structure analysis

#### Phase 3: Advanced Detection (Medium - Week 3)
**Objective**: Add sophisticated accessibility checks

**Tasks:**
1. **Accessibility Tree Extraction**
   - Use browser accessibility APIs
   - Extract ARIA attributes and computed names
   - Identify focus order issues
   - Validate ARIA usage correctness

2. **Interactive Element Analysis**
   - Map all focusable elements
   - Check for visible focus indicators
   - Verify keyboard accessibility
   - Validate interactive target sizes (24×24 CSS px minimum per WCAG 2.2). Exceptions apply (e.g., icon-only controls when an equivalent accessible mechanism or sufficient spacing is provided, and cases where increasing target size would break layout). Measure using CSS pixels and test keyboard/touch equivalence as part of verification.

3. **Content Structure Analysis**
   - Landmark usage (nav, main, aside, etc.)
   - Skip link implementation
   - Page language detection
   - Content reading order

**Acceptance Criteria:**
- ARIA validation with specific attribute issues
- Focus order problems with element paths
- Touch target size violations with coordinates
- Semantic structure gaps identified

#### Phase 4: Quality Assurance & Validation (Week 4)
**Objective**: Ensure consistent, high-quality issue detection

**Tasks:**
1. **Issue Count Validation**
   ```typescript
   type Category = 'perceivable' | 'operable' | 'understandable' | 'robust';

   interface ValidationStatus {
     counts: Record<Category, number>;
     missingCategories: Category[];
     actionTaken: 'ok' | 'reanalysis_requested' | 'report_fewer_issues';
   }

   const validateIssueCount = (
     issues: Issue[],
     options?: {
       minimums?: Partial<Record<Category, number>>;
       onReanalyze?: () => void | Promise<void>;
     }
   ): ValidationStatus => {
     const defaultMinimums: Record<Category, number> = {
       perceivable: 5,
       operable: 4,
       understandable: 3,
       robust: 3
     };

     const minimums: Record<Category, number> = {
       perceivable: options?.minimums?.perceivable ?? defaultMinimums.perceivable,
       operable: options?.minimums?.operable ?? defaultMinimums.operable,
       understandable: options?.minimums?.understandable ?? defaultMinimums.understandable,
       robust: options?.minimums?.robust ?? defaultMinimums.robust
     };

     const counts: Record<Category, number> = {
       perceivable: 0,
       operable: 0,
       understandable: 0,
       robust: 0
     };

     for (const issue of issues) {
       const category = (issue as any).category as Category | undefined;
       if (category && counts[category] !== undefined) {
         counts[category] += 1;
       }
     }

     const missingCategories = (Object.keys(minimums) as Category[]).filter(
       (cat) => counts[cat] < minimums[cat]
     );

     if (missingCategories.length === 0) {
       console.info(
         '[validateIssueCount] Minimums satisfied',
         { counts }
       );
       return { counts, missingCategories, actionTaken: 'ok' };
     }

     const shortfallSummary = missingCategories
       .map((cat) => `${cat}: ${counts[cat]}/${minimums[cat]}`)
       .join(', ');

     if (options?.onReanalyze) {
       console.warn(
         '[validateIssueCount] Shortfalls detected; requesting re-analysis',
         { counts, minimums, missingCategories, shortfallSummary }
       );
       try {
         // fire-and-forget; callers can also await their own wrapper if needed
         void options.onReanalyze();
       } catch (err) {
         console.error('[validateIssueCount] Re-analysis hook threw', err);
       }
       return { counts, missingCategories, actionTaken: 'reanalysis_requested' };
     }

     console.warn(
       '[validateIssueCount] Shortfalls detected; proceeding with fewer issues',
       { counts, minimums, missingCategories, shortfallSummary }
     );
     return { counts, missingCategories, actionTaken: 'report_fewer_issues' };
   };
   ```

2. **Evidence Quality Assurance**
   - Validate selectors point to real elements
   - Ensure file names/URLs exist
   - Check recommendation actionability
   - Verify WCAG reference accuracy

3. **Issue Grouping & Prioritization**
   - Group similar issues (e.g., "8 images missing alt text")
   - Calculate realistic priority scores
   - Provide implementation time estimates
   - Suggest fix order based on impact/effort

**Acceptance Criteria:**
- Every assessment returns 15-25+ issues
- All issues have specific evidence and selectors
- Issues grouped by type with instance counts
- Realistic priority scores and time estimates

### Technical Implementation Details

#### New Data Pipeline Architecture
```typescript
interface EnrichedAnalysisData {
  url: string;
  htmlSource: string;
  pageMetadata: {
    title: string;
    lang?: string;
    viewport?: string;
  };
  images: ImageAnalysis[];
  forms: FormAnalysis;
  headings: HeadingInfo[];
  links: LinkInfo[];
  colors: ColorAnalysis[];
  interactiveElements: InteractiveElementInfo[];
  accessibilityTree: AccessibilityNode[];
}
```

#### Enhanced API Flow
1. **URL Analysis Path**:
   - Crawl with Puppeteer → Extract structured data → Send to AI
   - Include HTML snippets for each element type
   - Provide computed styles for color analysis

2. **Image Analysis Path**:
   - Multiple screenshot modes → Element detection → Send with coordinates
   - Include DOM overlay data when available

#### File Structure Updates
```
src/lib/
├── crawler.ts          # Puppeteer-based data extraction
├── accessibility-analyzer.ts  # Structured issue detection
├── color-contrast.ts   # Color analysis utilities
├── element-extractor.ts # DOM element parsing
└── issue-validator.ts  # Quality assurance checks
```

### Success Metrics
- **Quantity**: 15-25+ issues per assessment (up from 1-2)
- **Specificity**: 100% of issues include exact selectors/file names
- **Coverage**: All 4 POUR categories represented
- **Accuracy**: Issues validated against actual DOM elements
- **Actionability**: Clear, specific remediation steps provided

### Risk Mitigation
- **Performance**: Implement caching for crawled data
- **Rate Limits**: Add request throttling for Puppeteer
- **Token Limits**: Chunk large HTML sources if needed
- **Accuracy**: Validate extracted data against real DOM
- **Fallbacks**: Maintain current system as backup if new system fails
