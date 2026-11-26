import { z } from "zod";

export interface AnalyzedFile {
  path: string;
  content: string;
  size: number;
}

export interface IngestedRepoPayload {
  owner: string;
  repoName: string;
  repoUrl: string;
  defaultBranch: string;
  description: string | null;
  primaryLanguage: string | null;
  totalTreeFiles: number;
  analyzedFiles: AnalyzedFile[];
}

export class GitHubIngestError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "GitHubIngestError";
    this.statusCode = statusCode;
  }
}

const SEGMENT_REGEX = /^[A-Za-z0-9_.-]+$/;
const MAX_FILES = 18;
const MAX_FILE_CHARS = 6_000;
const MAX_BUNDLE_CHARS = 65_000;

const githubUrlSchema = z
  .string()
  .trim()
  .min(1, "Repository URL is required.")
  .refine((val) => {
    try {
      const parsed = new URL(val);
      if (parsed.protocol !== "https:") return false;
      if (parsed.hostname !== "github.com") return false;
      if (parsed.port || parsed.username || parsed.password) return false;
      if (parsed.search || parsed.hash) return false;
      return true;
    } catch {
      return false;
    }
  }, "Only canonical https://github.com/owner/repo URLs are allowed.");

export function parseGitHubRepoUrl(rawUrl: string): {
  owner: string;
  repoName: string;
  canonicalUrl: string;
} {
  const result = githubUrlSchema.safeParse(rawUrl);
  if (!result.success) {
    throw new GitHubIngestError(
      result.error.issues[0]?.message ?? "Invalid GitHub repository URL.",
      400
    );
  }

  const parsed = new URL(result.data);
  const segments = parsed.pathname.split("/").filter(Boolean);
  if (segments.length !== 2) {
    throw new GitHubIngestError(
      "Repository URL must match https://github.com/owner/repo.",
      400
    );
  }

  const owner = segments[0];
  const repoName = segments[1].replace(/\.git$/i, "");

  if (
    !owner ||
    !repoName ||
    owner === "." ||
    owner === ".." ||
    repoName === "." ||
    repoName === ".." ||
    !SEGMENT_REGEX.test(owner) ||
    !SEGMENT_REGEX.test(repoName)
  ) {
    throw new GitHubIngestError(
      "Repository owner or name contains invalid characters.",
      400
    );
  }

  return {
    owner,
    repoName,
    canonicalUrl: `https://github.com/${owner}/${repoName}`,
  };
}

const IGNORED_PATH_SEGMENTS = [
  "node_modules/",
  ".next/",
  "dist/",
  "build/",
  "out/",
  ".git/",
  ".vercel/",
  "coverage/",
  "__snapshots__/",
];

const IGNORED_FILENAMES = new Set([
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "bun.lock",
  "bun.lockb",
  "poetry.lock",
  "cargo.lock",
  "gemfile.lock",
]);

const IGNORED_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
  ".ico",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".pdf",
  ".zip",
  ".tar",
  ".gz",
  ".mp4",
  ".mp3",
  ".exe",
  ".dll",
  ".so",
  ".wasm",
  ".snap",
  ".map",
];

function shouldIgnorePath(filePath: string): boolean {
  const lower = filePath.toLowerCase();
  if (IGNORED_PATH_SEGMENTS.some((seg) => lower.includes(seg))) return true;
  const baseName = lower.split("/").pop() ?? lower;
  if (IGNORED_FILENAMES.has(baseName)) return true;
  if (IGNORED_EXTENSIONS.some((ext) => lower.endsWith(ext))) return true;
  if (lower.includes(".test.") || lower.includes(".spec.")) return true;
  return false;
}

function scoreFilePriority(filePath: string): number {
  const lower = filePath.toLowerCase();
  const baseName = lower.split("/").pop() ?? lower;

  // Tier 1: Core configs, schemas, middleware, and env templates
  if (
    baseName === "package.json" ||
    baseName === ".env.example" ||
    baseName.startsWith("next.config.") ||
    baseName.startsWith("middleware.") ||
    lower === "prisma/schema.prisma" ||
    lower.startsWith("supabase/") ||
    baseName === "dockerfile" ||
    baseName.startsWith("docker-compose.")
  ) {
    return 100;
  }

  // Tier 2: API endpoints, auth, webhooks, and database layers
  if (
    lower.includes("app/api/") ||
    lower.includes("pages/api/") ||
    lower.includes("/routes/") ||
    lower.startsWith("routes/") ||
    lower.includes("auth") ||
    lower.includes("webhook") ||
    lower.includes("session") ||
    lower.includes("database") ||
    lower.includes("/db.") ||
    lower.includes("prisma")
  ) {
    return 85;
  }

  // Tier 3: Core source code
  if (
    lower.startsWith("src/") ||
    lower.startsWith("app/") ||
    lower.startsWith("lib/") ||
    lower.startsWith("server/")
  ) {
    if (
      lower.endsWith(".ts") ||
      lower.endsWith(".tsx") ||
      lower.endsWith(".js") ||
      lower.endsWith(".jsx") ||
      lower.endsWith(".py") ||
      lower.endsWith(".go") ||
      lower.endsWith(".sql")
    ) {
      return 65;
    }
    return 45;
  }

  // Tier 4: Other code files
  if (
    lower.endsWith(".ts") ||
    lower.endsWith(".tsx") ||
    lower.endsWith(".js") ||
    lower.endsWith(".py") ||
    lower.endsWith(".go") ||
    lower.endsWith(".sql")
  ) {
    return 30;
  }

  return 10;
}

function buildGitHubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "User-Agent": "AegisLens-Auditor",
    Accept: "application/vnd.github+json",
  };
  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function handleGitHubResponseError(res: Response, context: string): never {
  if (res.status === 404) {
    throw new GitHubIngestError(
      "Repository not found or is private. AegisLens can only audit public GitHub repositories.",
      404
    );
  }
  if (res.status === 403 || res.status === 429) {
    const remaining = res.headers.get("x-ratelimit-remaining");
    if (remaining === "0" || res.status === 429) {
      throw new GitHubIngestError(
        "GitHub API rate limit exceeded. Add a GITHUB_TOKEN to .env.local to increase the request quota.",
        403
      );
    }
    throw new GitHubIngestError(
      `GitHub API access forbidden while ${context}.`,
      403
    );
  }
  throw new GitHubIngestError(
    `GitHub API returned status ${res.status} while ${context}.`,
    502
  );
}

interface GitHubRepoMeta {
  private: boolean;
  default_branch: string;
  description: string | null;
  language: string | null;
}

interface GitHubTreeItem {
  path: string;
  type: "blob" | "tree" | string;
  size?: number;
}

interface GitHubTreeResponse {
  tree: GitHubTreeItem[];
}

/**
 * Fetches metadata, recursive tree, and up to 18 high-signal source files from a public GitHub repo.
 */
export async function ingestGitHubRepo(
  rawUrl: string
): Promise<IngestedRepoPayload> {
  const { owner, repoName, canonicalUrl } = parseGitHubRepoUrl(rawUrl);
  const headers = buildGitHubHeaders();

  // 1. Fetch repository metadata
  const metaRes = await fetch(
    `https://api.github.com/repos/${owner}/${repoName}`,
    { headers, cache: "no-store" }
  );
  if (!metaRes.ok) {
    handleGitHubResponseError(metaRes, "fetching repository metadata");
  }
  const meta = (await metaRes.json()) as GitHubRepoMeta;
  if (meta.private) {
    throw new GitHubIngestError(
      "Repository is private. Only public repositories are supported.",
      404
    );
  }

  const defaultBranch = meta.default_branch || "main";

  // 2. Fetch recursive file tree
  const treeRes = await fetch(
    `https://api.github.com/repos/${owner}/${repoName}/git/trees/${encodeURIComponent(
      defaultBranch
    )}?recursive=1`,
    { headers, cache: "no-store" }
  );
  if (!treeRes.ok) {
    handleGitHubResponseError(treeRes, "fetching repository tree");
  }
  const treeData = (await treeRes.json()) as GitHubTreeResponse;
  const blobs = (treeData.tree ?? []).filter((item) => item.type === "blob");

  // 3. Filter and prioritize high-signal files
  const candidates = blobs
    .filter((item) => !shouldIgnorePath(item.path))
    .map((item) => ({
      path: item.path,
      size: item.size ?? 0,
      score: scoreFilePriority(item.path),
    }))
    .sort((a, b) => b.score - a.score || a.path.length - b.path.length)
    .slice(0, MAX_FILES);

  // 4. Fetch raw content with strict character caps
  const rawHeaders: Record<string, string> = {
    "User-Agent": "AegisLens-Auditor",
  };
  if (headers.Authorization) {
    rawHeaders.Authorization = headers.Authorization;
  }

  const fetched = await Promise.all(
    candidates.map(async (file) => {
      const encodedPath = file.path
        .split("/")
        .map((segment) => encodeURIComponent(segment))
        .join("/");
      const rawUrlEndpoint = `https://raw.githubusercontent.com/${owner}/${repoName}/${encodeURIComponent(
        defaultBranch
      )}/${encodedPath}`;
      try {
        const res = await fetch(rawUrlEndpoint, {
          headers: rawHeaders,
          cache: "no-store",
        });
        if (!res.ok) return null;
        const text = await res.text();
        return {
          path: file.path,
          content: text.slice(0, MAX_FILE_CHARS),
          size: file.size || text.length,
        };
      } catch {
        return null;
      }
    })
  );

  const analyzedFiles: AnalyzedFile[] = [];
  let totalChars = 0;

  for (const item of fetched) {
    if (!item) continue;
    const remaining = MAX_BUNDLE_CHARS - totalChars;
    if (remaining <= 0) break;
    const trimmedContent =
      item.content.length > remaining
        ? item.content.slice(0, remaining)
        : item.content;
    analyzedFiles.push({
      path: item.path,
      content: trimmedContent,
      size: item.size,
    });
    totalChars += trimmedContent.length;
  }

  return {
    owner,
    repoName,
    repoUrl: canonicalUrl,
    defaultBranch,
    description: meta.description ?? null,
    primaryLanguage: meta.language ?? null,
    totalTreeFiles: blobs.length,
    analyzedFiles,
  };
}
