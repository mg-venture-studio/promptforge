'use client';

import { useState, useEffect } from 'react';
import { db, getPromptVersions, savePromptVersion } from '@/lib/db';
import type { Prompt, PromptVersion } from '@/lib/types';
import { createTwoFilesPatch } from 'diff';
import { FolderOpen, Tag, Search, Plus, Edit3, Trash2, ChevronRight, GitCompare } from 'lucide-react';

export default function PromptLibrary() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [showDiff, setShowDiff] = useState(false);
  const [diffA, setDiffA] = useState('');
  const [diffB, setDiffB] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrompts();
  }, []);

  async function loadPrompts() {
    const all = await db.prompts.orderBy('updatedAt').reverse().toArray();
    setPrompts(all);
    setLoading(false);
  }

  async function selectPrompt(prompt: Prompt) {
    setSelectedPrompt(prompt);
    const vers = await getPromptVersions(prompt.id!);
    setVersions(vers);
    setShowDiff(false);
  }

  async function deletePrompt(id: number) {
    await db.prompts.delete(id);
    await db.promptVersions.where('promptId').equals(id).delete();
    setPrompts((prev) => prev.filter((p) => p.id !== id));
    if (selectedPrompt?.id === id) setSelectedPrompt(null);
  }

  async function updatePrompt() {
    if (!selectedPrompt || !editContent.trim()) return;
    await savePromptVersion(selectedPrompt.id!, selectedPrompt.content);
    await db.prompts.update(selectedPrompt.id!, {
      content: editContent,
      updatedAt: new Date(),
    });
    const updated = { ...selectedPrompt, content: editContent, updatedAt: new Date() };
    setSelectedPrompt(updated);
    setEditing(false);
    const vers = await getPromptVersions(selectedPrompt.id!);
    setVersions(vers);
  }

  function showDiffBetween(v1: string, v2: string) {
    setDiffA(v1);
    setDiffB(v2);
    setShowDiff(true);
  }

  const filtered = prompts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const diffPatch = showDiff
    ? createTwoFilesPatch('previous', 'current', diffA, diffB, '', '', { context: 3 })
    : '';

  return (
    <div className="flex gap-6 h-[calc(100vh-200px)]">
      <div className="w-80 flex flex-col border-r pr-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-1">
          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-gray-500">No prompts saved yet. Run a test and save a prompt to get started.</p>
          ) : (
            filtered.map((prompt) => (
              <div
                key={prompt.id}
                onClick={() => selectPrompt(prompt)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedPrompt?.id === prompt.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm truncate">{prompt.title}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); deletePrompt(prompt.id!); }}
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate">{prompt.content.slice(0, 80)}</p>
                {prompt.tags.length > 0 && (
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {prompt.tags.map((tag) => (
                      <span key={tag} className="text-xs px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!selectedPrompt ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Select a prompt to view details
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{selectedPrompt.title}</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditing(!editing); setEditContent(selectedPrompt.content); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
              </div>
            </div>

            {editing ? (
              <div className="space-y-3">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full min-h-[200px] px-4 py-3 border rounded-lg text-sm resize-y font-mono"
                />
                <div className="flex gap-2">
                  <button onClick={updatePrompt} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
                    Save & Version
                  </button>
                  <button onClick={() => setEditing(false)} className="px-4 py-2 border text-sm rounded-md hover:bg-gray-50">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <pre className="p-4 bg-gray-50 rounded-lg text-sm whitespace-pre-wrap font-mono leading-relaxed">
                {selectedPrompt.content}
              </pre>
            )}

            <div>
              <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
                <GitCompare className="w-4 h-4" /> Version History ({versions.length})
              </h3>
              {versions.length === 0 ? (
                <p className="text-sm text-gray-500">No version history. Edit the prompt to create versions.</p>
              ) : (
                <div className="space-y-2">
                  {versions.map((v, i) => (
                    <div key={v.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <span className="text-sm font-medium">v{v.versionNumber}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          {new Date(v.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {i < versions.length - 1 && (
                        <button
                          onClick={() => showDiffBetween(versions[i + 1].content, v.content)}
                          className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          Diff with v{versions[i + 1].versionNumber}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {showDiff && (
              <div className="border rounded-lg overflow-hidden">
                <div className="px-4 py-2 bg-gray-50 border-b flex items-center justify-between">
                  <span className="text-sm font-medium">Diff View</span>
                  <button onClick={() => setShowDiff(false)} className="text-xs text-gray-500 hover:text-gray-700">
                    Close
                  </button>
                </div>
                <pre className="p-4 text-xs overflow-x-auto font-mono leading-relaxed">
                  {diffPatch.split('\n').map((line, i) => (
                    <div
                      key={i}
                      className={
                        line.startsWith('+') && !line.startsWith('+++')
                          ? 'bg-green-50 text-green-800'
                          : line.startsWith('-') && !line.startsWith('---')
                          ? 'bg-red-50 text-red-800'
                          : 'text-gray-600'
                      }
                    >
                      {line}
                    </div>
                  ))}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
