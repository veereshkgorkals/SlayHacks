# PROJECT_STATE.md — AegisLens

## Overview
AI-powered GitHub repository architecture mapper, red-team security auditor, and auto-patch generator.

## Locked Stack
Next.js (App Router, `src/`), TypeScript, Tailwind CSS, `@google/genai`, `@xyflow/react`, `zod`, `framer-motion`, `lucide-react`.

## Security Controls
HTTP security headers in `next.config.ts`, `.env` gitignored, server-only API keys, SSRF-hardened GitHub URL parser, sliding-window IP rate limiter.

## Key Files
- `src/app/layout.tsx` & `src/app/globals.css` — Daylight slate-mist theme, `Plus_Jakarta_Sans` & `JetBrains_Mono`
- `src/app/page.tsx` — Main landing & workspace state orchestrator
- `src/types/audit.ts` — Shared TypeScript interfaces for audits, nodes, edges & vulnerabilities
- `src/lib/sample-repos.ts` — 2 instant judge demo presets (`vulnerable-nextjs-saas`, `ai-rag-chatbot-api`)
- `src/lib/rate-limit.ts` — In-memory sliding-window IP rate limiter (10 req / 60s)
- `src/lib/github-ingestor.ts` — SSRF-safe GitHub REST ingestor & high-signal file prioritizer
- `src/app/api/ingest/route.ts` — Rate-limited `POST /api/ingest` endpoint
- `src/components/Navbar.tsx` — Minimal daylight top bar with vector shield-lens mark
- `src/components/HeroInput.tsx` — Elevated command-bar input wired to `/api/ingest`
- `src/components/AuditWorkspaceShell.tsx` — Architectural workspace shell, score bar & severity pills

## Completed Steps
- [x] Step 0: Project scaffold, dependencies, security headers, and PROJECT_STATE.md
- [x] Step 1: Premium dark-mode UI shell, TypeScript types (`src/types/audit.ts`), sample presets (`src/lib/sample-repos.ts`), and landing workspace
- [x] Step 1.5: Crisp white & soft slate-mist editorial UI design system
- [x] Step 2: Rate limiter (`src/lib/rate-limit.ts`), SSRF-safe GitHub ingestor (`src/lib/github-ingestor.ts`), and `/api/ingest` endpoint

## Next Step
Step 3 — 3-Stage Gemini Agentic Pipeline (Architecture Mapper + Red-Team Auditor + Auto-Patcher)
