import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PromptForge — AI Prompt Testing & Versioning Toolkit",
  description:
    "Test prompts across GPT-4, Claude, and Gemini side-by-side. Version your prompts with git-like diffs. A/B test variations. All local-first, your API keys stay in your browser.",
  keywords: [
    "prompt testing",
    "prompt versioning",
    "AI prompt tool",
    "GPT-4 testing",
    "Claude testing",
    "prompt comparison",
    "A/B testing prompts",
    "prompt management",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
