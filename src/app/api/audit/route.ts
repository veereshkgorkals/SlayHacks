import { NextResponse } from "next/server";
import { z } from "zod";
import {
  GeminiAuditError,
  GeminiConfigError,
  runGeminiSecurityAudit,
} from "@/lib/gemini-auditor";
import { GitHubIngestError, ingestGitHubRepo } from "@/lib/github-ingestor";
import { rateLimit } from "@/lib/rate-limit";

const auditRequestSchema = z.object({
  repoUrl: z.string().trim().min(1, "repoUrl is required."),
});

export async function POST(req: Request) {
  const limit = rateLimit(req);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: `Rate limit exceeded. Try again in ${limit.resetInSeconds}s.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(limit.resetInSeconds),
        },
      }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON request body." },
      { status: 400 }
    );
  }

  const parsed = auditRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid request payload.",
      },
      { status: 400 }
    );
  }

  try {
    // Stage 1: Fetch repository metadata & high-signal files
    const ingestedData = await ingestGitHubRepo(parsed.data.repoUrl);

    // Stage 2 & 3: Architecture mapping & red-team security audit via Gemini
    const report = await runGeminiSecurityAudit(ingestedData);

    return NextResponse.json({ success: true, report }, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof GeminiConfigError) {
      return NextResponse.json(
        { success: false, error: err.message },
        { status: 503 }
      );
    }
    if (err instanceof GitHubIngestError) {
      return NextResponse.json(
        { success: false, error: err.message },
        { status: err.statusCode }
      );
    }
    if (err instanceof GeminiAuditError) {
      return NextResponse.json(
        { success: false, error: err.message },
        { status: 502 }
      );
    }

    console.error("[api/audit] Unexpected error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Unexpected server error while auditing repository.",
      },
      { status: 500 }
    );
  }
}
