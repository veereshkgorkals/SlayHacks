import { NextResponse } from "next/server";
import { z } from "zod";
import { GitHubIngestError, ingestGitHubRepo } from "@/lib/github-ingestor";
import { rateLimit } from "@/lib/rate-limit";

const ingestRequestSchema = z.object({
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

  const parsed = ingestRequestSchema.safeParse(body);
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
    const data = await ingestGitHubRepo(parsed.data.repoUrl);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof GitHubIngestError) {
      return NextResponse.json(
        { success: false, error: err.message },
        { status: err.statusCode }
      );
    }
    console.error("[api/ingest] Unexpected error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Unexpected server error while ingesting repository.",
      },
      { status: 500 }
    );
  }
}
