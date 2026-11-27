import type { AuditReport } from "@/types/audit";

function escapeTableCell(value: string): string {
  return value.replaceAll("|", "\\|").replace(/\r?\n/g, " ");
}

export function formatMarkdownReport(report: AuditReport): string {
  const lines: string[] = [];

  lines.push(
    `# AegisLens Security & Architecture Audit — ${report.owner}/${report.repoName}`
  );
  lines.push("");

  lines.push("## Audit Metadata");
  lines.push("");
  lines.push("| Metric | Value |");
  lines.push("| --- | --- |");
  lines.push(`| Repository URL | ${report.repoUrl} |`);
  lines.push(`| Audit Date | ${report.analyzedAt} |`);
  lines.push(`| Security Score | ${report.securityScore} / 100 |`);
  lines.push(`| Files Scanned | ${report.stats.totalFiles} |`);
  lines.push(
    `| Severity Breakdown | CRITICAL: ${report.stats.criticalCount}, HIGH: ${report.stats.highCount}, MEDIUM: ${report.stats.mediumCount}, LOW: ${report.stats.lowCount} |`
  );
  lines.push("");

  lines.push("## Executive Summary");
  lines.push("");
  lines.push(report.summary);
  lines.push("");

  lines.push("## System Architecture Topology");
  lines.push("");
  if (report.nodes.length === 0) {
    lines.push("No architecture components were mapped.");
  } else {
    lines.push("| Component | Layer | File Path | Risk Score | Summary |");
    lines.push("| --- | --- | --- | --- | --- |");
    for (const node of report.nodes) {
      lines.push(
        `| ${escapeTableCell(node.label)} | \`${node.layer}\` | \`${escapeTableCell(
          node.filePath
        )}\` | ${node.riskScore}/100 | ${escapeTableCell(node.summary)} |`
      );
    }
  }
  lines.push("");

  lines.push("## Prioritized Vulnerabilities & Remediation Patches");
  lines.push("");
  if (report.vulnerabilities.length === 0) {
    lines.push("No vulnerabilities were detected in the analyzed files.");
  } else {
    for (const vuln of report.vulnerabilities) {
      lines.push(`### [${vuln.severity}] ${vuln.id}: ${vuln.title}`);
      lines.push("");
      lines.push(`- **File & Line Range:** \`${vuln.filePath}\` (${vuln.lineRange})`);
      lines.push(`- **Category:** ${vuln.category}`);
      lines.push("");
      lines.push("**Plain-English Description**");
      lines.push("");
      lines.push(vuln.description);
      lines.push("");
      lines.push("**Exploit Scenario**");
      lines.push("");
      lines.push(vuln.exploitScenario);
      lines.push("");
      lines.push("**Vulnerable Code**");
      lines.push("");
      lines.push("```");
      lines.push(vuln.vulnerableCode);
      lines.push("```");
      lines.push("");
      lines.push("**Recommended Secure Patch**");
      lines.push("");
      lines.push("```");
      lines.push(vuln.patchedCode);
      lines.push("```");
      lines.push("");
    }
  }

  return lines.join("\n");
}

/**
 * Generates and triggers a browser download for a Markdown security audit report.
 */
export function downloadMarkdownReport(report: AuditReport): void {
  const markdown = formatMarkdownReport(report);
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${report.repoName}-aegislens-audit.md`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  URL.revokeObjectURL(url);
}
