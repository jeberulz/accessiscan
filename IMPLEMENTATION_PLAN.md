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
