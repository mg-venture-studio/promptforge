import Link from 'next/link';
import type { Metadata } from 'next';
import { FlaskConical, GitCompare, Library, Shield, Zap, ArrowRight, Download } from 'lucide-react';

export const metadata: Metadata = {
  title: 'PromptForge — Test, Version & A/B Test AI Prompts | Side-by-Side GPT-4, Claude, Gemini Comparison',
  description:
    'PromptForge is a local-first toolkit for testing prompts across GPT-4, Claude, and Gemini side-by-side. Version prompts with git-like diffs, run A/B tests, and export results. Your API keys stay in your browser.',
  keywords: [
    'prompt testing tool',
    'AI prompt comparison',
    'prompt versioning',
    'GPT-4 vs Claude',
    'prompt A/B testing',
    'prompt management tool',
    'multi-model prompt testing',
    'prompt engineering toolkit',
  ],
  openGraph: {
    title: 'PromptForge — AI Prompt Testing & Versioning Toolkit',
    description: 'Test prompts across GPT-4, Claude, and Gemini side-by-side. Version with diffs. A/B test variations. Local-first, privacy-focused.',
    type: 'website',
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-xl">PromptForge</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">Features</a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</a>
            <Link
              href="/app/test"
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium"
            >
              Open App
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
          Test, Version & Compare<br />
          <span className="text-blue-600">AI Prompts</span> Across Models
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
          Run prompts against GPT-4, Claude, and Gemini simultaneously. Version them with git-like diffs.
          A/B test variations. All local-first — your API keys never leave your browser.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/app/test"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Try PromptForge Free <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#features"
            className="px-6 py-3 border rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            See Features
          </a>
        </div>
        <p className="mt-4 text-sm text-gray-500">No account required. Bring your own API key.</p>
      </section>

      <section id="features" className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-12">Everything you need for prompt engineering</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 border rounded-xl">
            <FlaskConical className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Multi-Model Testing</h3>
            <p className="text-sm text-gray-600">
              Send the same prompt to GPT-4, Claude, and Gemini simultaneously. Compare outputs side-by-side
              in real time with response times and token counts.
            </p>
          </div>
          <div className="p-6 border rounded-xl">
            <GitCompare className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Prompt Versioning</h3>
            <p className="text-sm text-gray-600">
              Every edit creates a version. Compare changes with git-like diffs. Track how your prompts
              evolve and roll back to any previous version.
            </p>
          </div>
          <div className="p-6 border rounded-xl">
            <Library className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Prompt Library</h3>
            <p className="text-sm text-gray-600">
              Organize prompts with folders and tags. Search across your entire collection.
              Export as JSON, Markdown, or plain text.
            </p>
          </div>
          <div className="p-6 border rounded-xl">
            <FlaskConical className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="font-semibold text-lg mb-2">A/B Testing</h3>
            <p className="text-sm text-gray-600">
              Create variations of your prompts and test them against each other. See which phrasing
              produces better results across all your models.
            </p>
          </div>
          <div className="p-6 border rounded-xl">
            <Shield className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Local-First & Private</h3>
            <p className="text-sm text-gray-600">
              All data stored in your browser via IndexedDB. API keys encrypted at rest.
              No server, no tracking, no account needed.
            </p>
          </div>
          <div className="p-6 border rounded-xl">
            <Download className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Export Anywhere</h3>
            <p className="text-sm text-gray-600">
              Export test results and prompts as JSON, Markdown, or plain text.
              Integrate with your existing workflow.
            </p>
          </div>
        </div>
      </section>

      <section id="pricing" className="max-w-5xl mx-auto px-6 py-16">
        <div className="max-w-md mx-auto border-2 border-blue-600 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold">One-time purchase</h2>
          <div className="mt-4">
            <span className="text-5xl font-bold">$39</span>
            <span className="text-gray-500 ml-2">USD</span>
          </div>
          <p className="mt-2 text-sm text-gray-600">Lifetime access. No subscription. Free updates.</p>
          <ul className="mt-6 space-y-2 text-sm text-left">
            <li className="flex items-center gap-2">
              <span className="text-green-600">&#10003;</span> Multi-model prompt testing
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">&#10003;</span> Prompt versioning with diffs
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">&#10003;</span> A/B testing
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">&#10003;</span> Prompt library with folders & tags
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">&#10003;</span> Export to JSON, Markdown, text
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">&#10003;</span> Local-first, encrypted API keys
            </li>
          </ul>
          <a
            href="https://gumroad.com/l/promptforge"
            className="mt-8 block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Get PromptForge
          </a>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-8">How it works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mx-auto mb-3">1</div>
            <h3 className="font-semibold mb-2">Add your API keys</h3>
            <p className="text-sm text-gray-600">Enter your OpenAI, Anthropic, and/or Google API keys. They're encrypted and stored locally.</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mx-auto mb-3">2</div>
            <h3 className="font-semibold mb-2">Write your prompt</h3>
            <p className="text-sm text-gray-600">Type or paste your prompt. Hit Run to test it across all enabled models simultaneously.</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mx-auto mb-3">3</div>
            <h3 className="font-semibold mb-2">Compare & iterate</h3>
            <p className="text-sm text-gray-600">Compare outputs side-by-side. Version your prompts. A/B test variations to find the best results.</p>
          </div>
        </div>
      </section>

      <footer className="border-t mt-16">
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <span className="font-semibold">PromptForge</span>
          </div>
          <p className="text-sm text-gray-500">Local-first prompt engineering toolkit</p>
        </div>
      </footer>
    </div>
  );
}
