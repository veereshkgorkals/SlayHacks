"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, FileCode2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeDiffViewerProps {
  filePath: string;
  lineRange?: string;
  vulnerableCode: string;
  patchedCode: string;
  highlighted?: boolean;
}

type DiffMode = "split" | "unified";

export function CodeDiffViewer({
  filePath,
  lineRange,
  vulnerableCode,
  patchedCode,
  highlighted = false,
}: CodeDiffViewerProps) {
  const [mode, setMode] = useState<DiffMode>("split");
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const handleCopyFix = async () => {
    try {
      await navigator.clipboard.writeText(patchedCode);
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable in restricted browser contexts
    }
  };

  const vulnerableLines = vulnerableCode.replace(/\r\n/g, "\n").split("\n");
  const patchedLines = patchedCode.replace(/\r\n/g, "\n").split("\n");

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border bg-white transition-all",
        highlighted
          ? "border-[#4F46E5] ring-4 ring-[#4F46E5]/10"
          : "border-[#E2E8F0]"
      )}
    >
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <FileCode2 className="h-3.5 w-3.5 shrink-0 text-[#64748B]" />
          <span className="truncate font-mono text-xs font-medium text-[#0F172A]">
            {filePath}
          </span>
          {lineRange ? (
            <span className="shrink-0 rounded border border-[#E2E8F0] bg-white px-1.5 py-0.5 font-mono text-[10px] text-[#64748B]">
              {lineRange}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {/* Split vs Unified Segmented Toggle */}
          <div className="inline-flex rounded-md border border-[#E2E8F0] bg-white p-0.5">
            <button
              type="button"
              onClick={() => setMode("split")}
              className={cn(
                "rounded px-2 py-0.5 font-mono text-[11px] font-medium transition-colors",
                mode === "split"
                  ? "bg-[#0F172A] text-white"
                  : "text-[#64748B] hover:text-[#0F172A]"
              )}
            >
              Split
            </button>
            <button
              type="button"
              onClick={() => setMode("unified")}
              className={cn(
                "rounded px-2 py-0.5 font-mono text-[11px] font-medium transition-colors",
                mode === "unified"
                  ? "bg-[#0F172A] text-white"
                  : "text-[#64748B] hover:text-[#0F172A]"
              )}
            >
              Unified
            </button>
          </div>

          {/* Copy Fix Button */}
          <button
            type="button"
            onClick={handleCopyFix}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-[11px] font-medium transition-colors",
              copied
                ? "border-[#A7F3D0] bg-[#ECFDF5] text-[#047857]"
                : "border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F1F5F9]"
            )}
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-[#047857]" />
                <span>Copied ✓</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 text-[#64748B]" />
                <span>Copy Fix</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Diff Body */}
      {mode === "split" ? (
        <div className="grid grid-cols-1 divide-y divide-[#E2E8F0] lg:grid-cols-2 lg:divide-x lg:divide-y-0">
          {/* Left: Vulnerable */}
          <div className="min-w-0">
            <div className="border-b border-[#FECACA] bg-[#FEF2F2] px-3 py-1.5 font-mono text-[11px] font-semibold text-[#B91C1C]">
              Vulnerable
            </div>
            <div className="overflow-x-auto bg-[#FEF2F2]/60 font-mono text-xs leading-relaxed">
              <table className="w-full border-collapse">
                <tbody>
                  {vulnerableLines.map((line, idx) => (
                    <tr key={`v-${idx}`} className="hover:bg-[#FEF2F2]">
                      <td className="w-9 select-none border-r border-[#FECACA]/60 px-2 py-0.5 text-right text-[11px] text-[#94A3B8] tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="w-6 select-none px-1.5 py-0.5 text-center font-semibold text-[#B91C1C]">
                        -
                      </td>
                      <td className="whitespace-pre px-2 py-0.5 text-[#0F172A]">
                        {line || " "}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Hardened Patch */}
          <div className="min-w-0">
            <div className="border-b border-[#A7F3D0] bg-[#ECFDF5] px-3 py-1.5 font-mono text-[11px] font-semibold text-[#047857]">
              Hardened Patch
            </div>
            <div className="overflow-x-auto bg-[#ECFDF5]/60 font-mono text-xs leading-relaxed">
              <table className="w-full border-collapse">
                <tbody>
                  {patchedLines.map((line, idx) => (
                    <tr key={`p-${idx}`} className="hover:bg-[#ECFDF5]">
                      <td className="w-9 select-none border-r border-[#A7F3D0]/60 px-2 py-0.5 text-right text-[11px] text-[#94A3B8] tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="w-6 select-none px-1.5 py-0.5 text-center font-semibold text-[#047857]">
                        +
                      </td>
                      <td className="whitespace-pre px-2 py-0.5 text-[#0F172A]">
                        {line || " "}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto font-mono text-xs leading-relaxed">
          <table className="w-full border-collapse">
            <tbody>
              {vulnerableLines.map((line, idx) => (
                <tr key={`uv-${idx}`} className="bg-[#FEF2F2]/60 hover:bg-[#FEF2F2]">
                  <td className="w-10 select-none border-r border-[#FECACA]/60 px-2 py-0.5 text-right text-[11px] text-[#94A3B8] tabular-nums">
                    {idx + 1}
                  </td>
                  <td className="w-6 select-none px-1.5 py-0.5 text-center font-semibold text-[#B91C1C]">
                    -
                  </td>
                  <td className="whitespace-pre px-2 py-0.5 text-[#0F172A]">
                    {line || " "}
                  </td>
                </tr>
              ))}
              {patchedLines.map((line, idx) => (
                <tr key={`up-${idx}`} className="bg-[#ECFDF5]/60 hover:bg-[#ECFDF5]">
                  <td className="w-10 select-none border-r border-[#A7F3D0]/60 px-2 py-0.5 text-right text-[11px] text-[#94A3B8] tabular-nums">
                    {idx + 1}
                  </td>
                  <td className="w-6 select-none px-1.5 py-0.5 text-center font-semibold text-[#047857]">
                    +
                  </td>
                  <td className="whitespace-pre px-2 py-0.5 text-[#0F172A]">
                    {line || " "}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
