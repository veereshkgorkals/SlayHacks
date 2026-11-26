import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AegisLens — System Architecture & Security Auditor",
  description:
    "Static & semantic codebase audit, deterministic architecture graph, and automated remediation patches for GitHub repositories.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="relative min-h-full flex flex-col bg-[#F6F8FB] text-[#0F172A] font-sans selection:bg-[#EEF2FF] selection:text-[#4338CA]">
        <div
          aria-hidden="true"
          className="bg-daylight-grid pointer-events-none fixed inset-0 z-0"
        />
        <div className="relative z-10 flex min-h-full flex-1 flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
