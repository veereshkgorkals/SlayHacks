import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AegisLens — AI System Architecture & Security Auditor",
  description:
    "AI-powered GitHub repository architecture mapper, red-team security auditor, and auto-patch generator powered by Gemini.",
  keywords: [
    "AegisLens",
    "AI security auditor",
    "architecture mapper",
    "red-team",
    "vulnerability scanner",
    "auto-patch",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#090D16] text-slate-100 font-sans selection:bg-[#14B8A6]/30 selection:text-teal-100">
        {children}
      </body>
    </html>
  );
}
