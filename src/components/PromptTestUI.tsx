'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/db';
import { callModel } from '@/lib/api';
import { getModels } from '@/lib/models';
import { decrypt } from '@/lib/crypto';
import type { ModelConfig, ModelProvider, TestRun } from '@/lib/types';
import { DEFAULT_MODELS } from '@/lib/types';
import { Play, Loader2, Copy, Check, Save, ChevronDown } from 'lucide-react';

interface ModelResult {
  model: ModelConfig;
  response: string;
  loading: boolean;
  error: string | null;
  durationMs: number;
  tokensUsed?: number;
}

export default function PromptTestUI() {
  const [prompt, setPrompt] = useState('');
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [results, setResults] = useState<ModelResult[]>([]);
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [savedPromptId, setSavedPromptId] = useState<number | null>(null);
  const [promptTitle, setPromptTitle] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);

  useEffect(() => {
    const stored = getModels();
    const active = (stored.length > 0 ? stored : DEFAULT_MODELS).filter((m) => m.enabled);
    setModels(active);
    setResults(active.map((m) => ({ model: m, response: '', loading: false, error: null, durationMs: 0 })));
  }, []);

  const runTest = useCallback(async () => {
    if (!prompt.trim() || running) return;
    setRunning(true);

    const apiKeys: Record<string, string> = {};
    const keyRecords = await db.apiKeys.toArray();
    for (const record of keyRecords) {
      try {
        apiKeys[record.provider] = decrypt(record.encryptedKey, record.iv);
      } catch {
        // skip invalid keys
      }
    }

    setResults((prev) =>
      prev.map((r) => ({ ...r, loading: true, error: null, response: '', durationMs: 0 }))
    );

    const promises = models.map(async (model) => {
      const apiKey = apiKeys[model.provider];
      if (!apiKey) {
        return {
          model,
          response: '',
          loading: false,
          error: `No API key for ${model.provider}. Add one in Settings.`,
          durationMs: 0,
        };
      }

      try {
        const result = await callModel(model.provider, model.modelId, prompt, apiKey);

        await db.testRuns.add({
          promptContent: prompt,
          modelId: model.modelId,
          provider: model.provider,
          response: result.content,
          tokensUsed: result.tokensUsed,
          durationMs: result.durationMs,
          createdAt: new Date(),
        });

        return {
          model,
          response: result.content,
          loading: false,
          error: null,
          durationMs: result.durationMs,
          tokensUsed: result.tokensUsed,
        };
      } catch (err) {
        return {
          model,
          response: '',
          loading: false,
          error: err instanceof Error ? err.message : 'Unknown error',
          durationMs: 0,
        };
      }
    });

    const settled = await Promise.allSettled(promises);
    const newResults: ModelResult[] = settled.map((s, i) => {
      if (s.status === 'fulfilled') return s.value;
      return {
        model: models[i],
        response: '',
        loading: false,
        error: 'Request failed',
        durationMs: 0,
      };
    });

    setResults(newResults);
    setRunning(false);
  }, [prompt, running, models]);

  async function savePrompt() {
    if (!prompt.trim()) return;
    const title = promptTitle.trim() || prompt.slice(0, 50);

    if (savedPromptId) {
      await db.prompts.update(savedPromptId, {
        content: prompt,
        title,
        updatedAt: new Date(),
      });
    } else {
      const id = await db.prompts.add({
        title,
        content: prompt,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      setSavedPromptId(id);
    }
    setShowSaveForm(false);
  }

  function copyResponse(text: string, modelId: string) {
    navigator.clipboard.writeText(text);
    setCopied(modelId);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex gap-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here..."
            className="flex-1 min-h-[120px] px-4 py-3 border rounded-lg text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') runTest();
            }}
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={runTest}
            disabled={!prompt.trim() || running}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
          >
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {running ? 'Running...' : 'Run Test'}
          </button>
          <button
            onClick={() => setShowSaveForm(!showSaveForm)}
            disabled={!prompt.trim()}
            className="flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> Save Prompt
          </button>
          <span className="text-xs text-gray-500">⌘+Enter to run</span>
        </div>
        {showSaveForm && (
          <div className="flex gap-2 p-3 bg-gray-50 rounded-lg">
            <input
              type="text"
              placeholder="Prompt title (optional)"
              value={promptTitle}
              onChange={(e) => setPromptTitle(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md text-sm"
            />
            <button onClick={savePrompt} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
              {savedPromptId ? 'Update' : 'Save'}
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(results.length || 1, 3)}, 1fr)` }}>
        {results.map((result) => (
          <div key={result.model.id} className="border rounded-lg overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-50 border-b flex items-center justify-between">
              <div>
                <span className="font-medium text-sm">{result.model.name}</span>
                <span className="text-xs text-gray-500 ml-2">{result.model.provider}</span>
              </div>
              {result.durationMs > 0 && (
                <span className="text-xs text-gray-500">{result.durationMs}ms</span>
              )}
            </div>
            <div className="p-4 min-h-[200px] max-h-[500px] overflow-y-auto">
              {result.loading && (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                </div>
              )}
              {result.error && (
                <p className="text-red-600 text-sm">{result.error}</p>
              )}
              {result.response && (
                <div className="relative">
                  <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">{result.response}</pre>
                  <button
                    onClick={() => copyResponse(result.response, result.model.id)}
                    className="absolute top-0 right-0 p-1.5 bg-white border rounded-md text-gray-400 hover:text-gray-600 opacity-0 hover:opacity-100 transition-opacity"
                    title="Copy response"
                  >
                    {copied === result.model.id ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
              {!result.loading && !result.error && !result.response && (
                <p className="text-gray-400 text-sm italic">Run a test to see results</p>
              )}
            </div>
            {result.tokensUsed && (
              <div className="px-4 py-1.5 bg-gray-50 border-t text-xs text-gray-500">
                {result.tokensUsed} tokens
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
