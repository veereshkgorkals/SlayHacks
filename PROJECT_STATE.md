# PROJECT_STATE.md — AegisLens

## Overview
AI-powered GitHub repository architecture mapper, red-team security auditor, and auto-patch generator.

## Locked Stack
Next.js (App Router, `src/`), TypeScript, Tailwind CSS, `@google/genai`, `@xyflow/react`, `zod`, `framer-motion`, `lucide-react`.

## Security Controls
HTTP security headers in `next.config.ts`, `.env` gitignored, server-only API keys, SSRF-hardened GitHub URL parser, sliding-window IP rate limiter, XML prompt-injection delimiting.

## Key Files
- `src/app/layout.tsx` & `src/app/globals.css` — Daylight slate-mist theme, `Plus_Jakarta_Sans` & `JetBrains_Mono`
- `src/app/page.tsx` — Main landing & workspace state orchestrator
- `src/types/audit.ts` — Shared TypeScript interfaces for audits, nodes, edges & vulnerabilities
- `src/lib/sample-repos.ts` — 2 instant judge demo presets (`vulnerable-nextjs-saas`, `ai-rag-chatbot-api`)
- `src/lib/rate-limit.ts` — In-memory sliding-window IP rate limiter (10 req / 60s)
- `src/lib/github-ingestor.ts` — SSRF-safe GitHub REST ingestor & high-signal file prioritizer
- `src/lib/gemini-auditor.ts` — Structured-output Gemini auditor with XML injection defense & fallback
- `src/app/api/ingest/route.ts` — Rate-limited `POST /api/ingest` endpoint
- `src/app/api/audit/route.ts` — Unified `POST /api/audit` endpoint (ingest + Gemini audit)
- `src/components/Navbar.tsx` — Minimal daylight top bar with vector shield-lens mark
- `src/components/HeroInput.tsx` — Elevated command-bar input wired to `/api/audit`
- `src/components/AuditWorkspaceShell.tsx` — Architectural workspace shell, score bar & severity pills
- `src/components/ArchitectureGraph.tsx` — Interactive `@xyflow/react` tiered topology & node inspector
- `src/components/VulnerabilityExplorer.tsx` — Filterable master-detail plain-English vulnerability explorer
- `src/components/CodeDiffViewer.tsx` — Split & Unified GitHub-style diff viewer with Copy Fix
- `src/lib/export-report.ts` — Client-side Markdown security audit report generator & downloader

## Completed Steps
- [x] Step 0: Project scaffold, dependencies, security headers, and PROJECT_STATE.md
- [x] Step 1: Premium dark-mode UI shell, TypeScript types (`src/types/audit.ts`), sample presets (`src/lib/sample-repos.ts`), and landing workspace
- [x] Step 1.5: Crisp white & soft slate-mist editorial UI design system
- [x] Step 2: Rate limiter (`src/lib/rate-limit.ts`), SSRF-safe GitHub ingestor (`src/lib/github-ingestor.ts`), and `/api/ingest` endpoint
- [x] Step 3: Gemini AI auditor (`src/lib/gemini-auditor.ts`) with Structured Outputs & `/api/audit` endpoint
- [x] Step 4: Interactive React Flow architecture graph (`src/components/ArchitectureGraph.tsx`) & plain-English vulnerability explorer (`src/components/VulnerabilityExplorer.tsx`)
- [x] Step 5: Side-by-side CodeDiffViewer (`src/components/CodeDiffViewer.tsx`) & Markdown report exporter (`src/lib/export-report.ts`)
- [x] Step 6: Final security hardening (CSP, edge-case validation, ESC shortcut), MIT LICENSE, and Devpost README.md
- [x] Step 6.5: Input whitespace trimming, smart URL normalization (owner/repo & full URL), and full-width sample preset pills

## Next Step
Deployment to Vercel & SLAY HACKS 2026 Devpost Submission
