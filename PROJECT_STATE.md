# PROJECT_STATE.md — AegisLens

## Overview
AI-powered GitHub repository architecture mapper, red-team security auditor, and auto-patch generator.

## Locked Stack
Next.js (App Router, `src/`), TypeScript, Tailwind CSS, `@google/genai`, `@xyflow/react`, `zod`, `framer-motion`, `lucide-react`.

## Security Controls
HTTP security headers in `next.config.ts`, `.env` gitignored, server-only API keys.

## Key Files
- `src/app/layout.tsx` — Root layout, `Plus_Jakarta_Sans` & `JetBrains_Mono`, SEO metadata
- `src/app/globals.css` — Obsidian-slate dark theme & radial grid background
- `src/app/page.tsx` — Main landing & workspace state orchestrator
- `src/types/audit.ts` — Shared TypeScript interfaces for audits, nodes, edges & vulnerabilities
- `src/lib/sample-repos.ts` — 2 instant judge demo presets (`vulnerable-nextjs-saas`, `ai-rag-chatbot-api`)
- `src/components/Navbar.tsx` — Glassmorphic top bar with SVG shield-lens logo
- `src/components/HeroInput.tsx` — GitHub URL validator, animated 3-stage loader & preset cards
- `src/components/AuditWorkspaceShell.tsx` — Tabbed workspace shell, score gauge & severity counters

## Completed Steps
- [x] Step 0: Project scaffold, dependencies, security headers, and PROJECT_STATE.md
- [x] Step 1: Premium dark-mode UI shell, TypeScript types (`src/types/audit.ts`), sample presets (`src/lib/sample-repos.ts`), and landing workspace
- [x] Step 1.5: Bespoke Linear/Vercel-inspired monochrome dark UI overhaul

## Next Step
Step 2 — Secure GitHub Repo Ingestor & Rate-Limited Backend API Route
