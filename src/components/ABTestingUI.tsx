'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { callModel } from '@/lib/api';
import { getModels } from '@/lib/models';
import { decrypt } from '@/lib/crypto';
import type { ModelConfig, ABTest, ABTestResult } from '@/lib/types';
import { DEFAULT_MODELS } from '@/lib/types';
import { Plus, Play, Loader2, Trash2, Download, BarChart3 } from 'lucide-react';
import { exportAsJSON, exportAsMarkdown, exportAsPlainText, downloadFile } from '@/lib/export';

export default function ABTestingUI() {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [results, setResults] = useState<ABTestResult[]>([]);
  const [running, setRunning] = useState(false);
  const [newTestName, setNewTestName] = useState('');
  const [newVariations, setNewVariations] = useState([{ id: crypto.randomUUID(), content: '', label: 'A' }]);
  const [creating, setCreating] = useState(false);
  const [models, setModels] = useState<ModelConfig[]>([]);

  useEffect(() => {
    loadTests();
    const stored = getModels();
    setModels((stored.length > 0 ? stored : DEFAULT_MODELS).filter((m) => m.enabled));
  }, []);

  async function loadTests() {
    const all = await db.abTests.orderBy('createdAt').reverse().toArray();
    setTests(all);
  }

  async function createTest() {
    if (!newTestName.trim() || newVariations.length < 2) return;
    const validVariations = newVariations.filter((v) => v.content.trim());
    if (validVariations.length < 2) return;

    const id = await db.abTests.add({
      name: newTestName.trim(),
      variations: validVariations.map((v) => ({
        id: v.id,
        content: v.content.trim(),
        label: v.label,
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    setCreating(false);
    setNewTestName('');
    setNewVariations([{ id: crypto.randomUUID(), content: '', label: 'A' }]);
    await loadTests();
  }

  function addVariation() {
    const nextLabel = String.fromCharCode(65 + newVariations.length);
    setNewVariations([...newVariations, { id: crypto.randomUUID(), content: '', label: nextLabel }]);
  }

  async function runABTest() {
    if (!selectedTest || running) return;
    setRunning(true);

    const apiKeys: Record<string, string> = {};
    const keyRecords = await db.apiKeys.toArray();
    for (const record of keyRecords) {
      try {
        apiKeys[record.provider] = decrypt(record.encryptedKey, record.iv);
      } catch { /* skip */ }
    }

    const newResults: ABTestResult[] = [];

    for (const variation of selectedTest.variations) {
      for (const model of models) {
        const apiKey = apiKeys[model.provider];
        if (!apiKey) continue;

        try {
          const result = await callModel(model.provider, model.modelId, variation.content, apiKey);
          const saved = await db.abTestResults.add({
            abTestId: selectedTest.id!,
            variationId: variation.id,
            modelId: model.modelId,
            provider: model.provider,
            response: result.content,
            tokensUsed: result.tokensUsed,
            durationMs: result.durationMs,
            createdAt: new Date(),
          });
          newResults.push({
            id: saved,
            abTestId: selectedTest.id!,
            variationId: variation.id,
            modelId: model.modelId,
            provider: model.provider,
            response: result.content,
            tokensUsed: result.tokensUsed,
            durationMs: result.durationMs,
            createdAt: new Date(),
          });
        } catch {
          // skip failed calls
        }
      }
    }

    setResults((prev) => [...prev, ...newResults]);
    setRunning(false);
  }

  async function loadResults(testId: number) {
    const res = await db.abTestResults.where('abTestId').equals(testId).toArray();
    setResults(res);
  }

  async function selectTest(test: ABTest) {
    setSelectedTest(test);
    await loadResults(test.id!);
  }

  async function deleteTest(id: number) {
    await db.abTests.delete(id);
    await db.abTestResults.where('abTestId').equals(id).delete();
    setTests((prev) => prev.filter((t) => t.id !== id));
    if (selectedTest?.id === id) setSelectedTest(null);
  }

  function exportResults(format: 'json' | 'markdown' | 'text') {
    if (results.length === 0) return;
    const content = format === 'json' ? exportAsJSON(results) : format === 'markdown' ? exportAsMarkdown(results) : exportAsPlainText(results);
    const ext = format === 'json' ? 'json' : format === 'markdown' ? 'md' : 'txt';
    downloadFile(content, `ab-test-${selectedTest?.name || 'results'}.${ext}`, `text/${format === 'json' ? 'json' : 'plain'}`);
  }

  const avgDuration = (variationId: string) => {
    const vr = results.filter((r) => r.variationId === variationId);
    if (vr.length === 0) return 0;
    return Math.round(vr.reduce((sum, r) => sum + r.durationMs, 0) / vr.length);
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-200px)]">
      <div className="w-72 flex flex-col border-r pr-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-sm">A/B Tests</h3>
          <button onClick={() => setCreating(!creating)} className="text-blue-600 hover:text-blue-700">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {creating && (
          <div className="mb-4 p-3 border rounded-lg space-y-3">
            <input
              type="text"
              placeholder="Test name"
              value={newTestName}
              onChange={(e) => setNewTestName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
            {newVariations.map((v, i) => (
              <div key={v.id} className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Variation {v.label}</label>
                <textarea
                  placeholder={`Enter variation ${v.label} prompt...`}
                  value={v.content}
                  onChange={(e) => {
                    const updated = [...newVariations];
                    updated[i] = { ...v, content: e.target.value };
                    setNewVariations(updated);
                  }}
                  className="w-full px-3 py-2 border rounded-md text-sm min-h-[60px] resize-y"
                />
              </div>
            ))}
            <button onClick={addVariation} className="text-xs text-blue-600 hover:text-blue-700">
              + Add variation
            </button>
            <div className="flex gap-2">
              <button onClick={createTest} className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
                Create
              </button>
              <button onClick={() => setCreating(false)} className="px-3 py-1.5 border text-sm rounded-md hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-1">
          {tests.length === 0 ? (
            <p className="text-sm text-gray-500">No A/B tests yet.</p>
          ) : (
            tests.map((test) => (
              <div
                key={test.id}
                onClick={() => selectTest(test)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedTest?.id === test.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{test.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); deleteTest(test.id!); }} className="text-gray-400 hover:text-red-500 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">{test.variations.length} variations</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!selectedTest ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Select or create an A/B test
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{selectedTest.name}</h2>
              <div className="flex gap-2">
                <button
                  onClick={runABTest}
                  disabled={running}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  Run All
                </button>
                {results.length > 0 && (
                  <div className="flex gap-1">
                    <button onClick={() => exportResults('json')} className="px-2 py-1.5 border text-xs rounded hover:bg-gray-50">JSON</button>
                    <button onClick={() => exportResults('markdown')} className="px-2 py-1.5 border text-xs rounded hover:bg-gray-50">MD</button>
                    <button onClick={() => exportResults('text')} className="px-2 py-1.5 border text-xs rounded hover:bg-gray-50">TXT</button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedTest.variations.length}, 1fr)` }}>
              {selectedTest.variations.map((variation) => {
                const varResults = results.filter((r) => r.variationId === variation.id);
                return (
                  <div key={variation.id} className="border rounded-lg overflow-hidden">
                    <div className="px-4 py-2.5 bg-gray-50 border-b">
                      <span className="font-medium text-sm">Variation {variation.label}</span>
                      {varResults.length > 0 && (
                        <span className="text-xs text-gray-500 ml-2">avg {avgDuration(variation.id)}ms</span>
                      )}
                    </div>
                    <div className="p-3">
                      <pre className="text-xs bg-gray-50 p-2 rounded whitespace-pre-wrap font-mono">{variation.content}</pre>
                    </div>
                    {varResults.length > 0 && (
                      <div className="p-3 border-t space-y-2 max-h-[300px] overflow-y-auto">
                        {varResults.map((r, i) => (
                          <div key={i} className="text-xs">
                            <div className="flex items-center justify-between text-gray-500 mb-1">
                              <span>{r.modelId}</span>
                              <span>{r.durationMs}ms</span>
                            </div>
                            <p className="whitespace-pre-wrap">{r.response}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
