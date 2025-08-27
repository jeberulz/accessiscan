## Product Requirements Document (PRD)

### Project: AccessiScan — Next.js + Vercel + Supabase Rewrite

#### Summary
Replatform the existing AccessiScan (Hono + Cloudflare Workers + D1 + Vite React) to Next.js (App Router), hosted on Vercel, using Supabase Postgres for persistence, while preserving the current UI/UX 1:1. Replace Hono endpoints and D1 SQL with Next.js API routes and Supabase. Keep all current functionality: URL and image-based assessments via OpenAI, screenshot preview, storing assessments/leads, and rendering detailed results.

---

### Goals
- Maintain 100% UI/UX parity (layout, typography, tailwind classes, states, interactions).
- Migrate backend to Next.js API routes deployed on Vercel.
- Replace D1 with Supabase (Postgres), including schema and queries.
- Keep OpenAI GPT-4o flows (URL and image assessment) and screenshot capture.
- Ensure secure environment variable handling and deployability on Vercel.

### Non-Goals
- New features beyond parity (e.g., auth, multi-tenant, billing) unless called out as optional.
- Changing visual design, copy, or interaction patterns.

### Users & Use Cases
- Visitor runs a quick accessibility assessment via URL or screenshot.
- Receives an instant summary with categorized issues and recommendations.
- Optionally submits contact info via lead modal for follow-up.

### Key Flows
1) Home page → AssessmentForm (URL or screenshot) → POST /api/assess → store in Supabase → render AssessmentResults with screenshot preview.
2) AssessmentResults → Export/Download triggers lead capture modal → POST /api/leads → confirmation state.
3) Health check at /api/health for ops.

### Functional Requirements
- URL assessment: validate URL, request OpenAI, compute derived scores, persist, return AssessmentResult DTO.
- Image assessment: accept base64 image, send to OpenAI with vision, persist, return AssessmentResult DTO.
- Screenshot capture of URL via thum.io and display.
- Lead capture: validate and persist email/company/website/contact preferences.
- Database: Supabase tables `assessments`, `leads` with JSONB fields where appropriate.
- API responses adhere to ApiResponse<T> envelope.

### Technical Requirements
- Next.js 14+ App Router project under /src/app.
- API routes: /api/assess, /api/leads, /api/health.
- Libraries: @supabase/supabase-js, openai, zod, tailwindcss, lucide-react.
- Edge runtime preferred for API, unless Node runtime is required later.
- Environment variables on Vercel: OPENAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY.
- Strict TypeScript and path alias `@/*` to /src.

### Data Model (Supabase)
- assessments: id, website_url, email, company_name, assessment_results (jsonb), overall_score, total_issues, critical_issues, high_impact_issues, medium_impact_issues, low_impact_issues, screenshot_url, created_at, updated_at.
- leads: id, email, company_name, website_url, assessment_id, contact_preferences (jsonb), timestamps.

### Validation
- Zod schemas mirror existing `src/shared/types.ts` with minor path changes.
- Server validates all inputs; client performs basic checks.

### Constraints & Risks
- OpenAI rate limits and cost: keep temps low and tokens bounded.
- Screenshot dependency (thum.io) availability.
- Edge runtime limits; may need to switch to Node runtime if any library breaks.

### Acceptance Criteria
- Visual parity: side-by-side comparison matches existing app for all states.
- All flows succeed on local dev and Vercel.
- Supabase contains expected rows after actions.
- No client-side errors or TypeScript errors.

### Metrics (post-migration)
- API median latency < 700ms excluding OpenAI time.
- 0 TypeScript build errors; Lighthouse accessibility parity or better.

### Rollout Plan
- Implement in a feature branch.
- Dry-run locally, then deploy to Vercel preview.
- Verify parity via checklist and screenshots.
- Promote to production.
