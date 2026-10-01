'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { encrypt, decrypt } from '@/lib/crypto';
import type { ModelProvider } from '@/lib/types';
import { Shield, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';

const PROVIDERS: { id: ModelProvider; name: string; placeholder: string }[] = [
  { id: 'openai', name: 'OpenAI', placeholder: 'sk-...' },
  { id: 'anthropic', name: 'Anthropic', placeholder: 'sk-ant-...' },
  { id: 'google', name: 'Google AI', placeholder: 'AI...' },
];

export default function ApiKeySettings() {
  const [keys, setKeys] = useState<Record<ModelProvider, string>>({
    openai: '',
    anthropic: '',
    google: '',
  });
  const [showKeys, setShowKeys] = useState<Record<ModelProvider, boolean>>({
    openai: false,
    anthropic: false,
    google: false,
  });
  const [saved, setSaved] = useState<Record<ModelProvider, boolean>>({
    openai: false,
    anthropic: false,
    google: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadKeys() {
      const records = await db.apiKeys.toArray();
      const hasKeys: Record<string, boolean> = {};
      for (const record of records) {
        try {
          decrypt(record.encryptedKey, record.iv);
          hasKeys[record.provider] = true;
        } catch {
          hasKeys[record.provider] = false;
        }
      }
      setSaved({
        openai: hasKeys['openai'] || false,
        anthropic: hasKeys['anthropic'] || false,
        google: hasKeys['google'] || false,
      });
      setLoading(false);
    }
    loadKeys();
  }, []);

  async function saveKey(provider: ModelProvider) {
    const value = keys[provider];
    if (!value.trim()) return;

    const { encrypted, iv } = encrypt(value.trim());
    const existing = await db.apiKeys.where('provider').equals(provider).first();

    if (existing && existing.id) {
      await db.apiKeys.update(existing.id, {
        encryptedKey: encrypted,
        iv,
        updatedAt: new Date(),
      });
    } else {
      await db.apiKeys.add({
        provider,
        encryptedKey: encrypted,
        iv,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    setSaved((prev) => ({ ...prev, [provider]: true }));
    setKeys((prev) => ({ ...prev, [provider]: '' }));
    setTimeout(() => setSaved((prev) => ({ ...prev, [provider]: true })), 2000);
  }

  async function removeKey(provider: ModelProvider) {
    await db.apiKeys.where('provider').equals(provider).delete();
    setSaved((prev) => ({ ...prev, [provider]: false }));
  }

  if (loading) return <div className="text-sm text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Shield className="w-4 h-4" />
        <span>Keys are encrypted and stored locally in your browser.</span>
      </div>

      {PROVIDERS.map((provider) => (
        <div key={provider.id} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{provider.name}</h3>
            {saved[provider.id] && (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <Check className="w-4 h-4" /> Configured
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showKeys[provider.id] ? 'text' : 'password'}
                placeholder={provider.placeholder}
                value={keys[provider.id]}
                onChange={(e) => setKeys((prev) => ({ ...prev, [provider.id]: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md text-sm font-mono pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKeys((prev) => ({ ...prev, [provider.id]: !prev[provider.id] }))}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showKeys[provider.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              onClick={() => saveKey(provider.id)}
              disabled={!keys[provider.id].trim()}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
            {saved[provider.id] && (
              <button
                onClick={() => removeKey(provider.id)}
                className="px-4 py-2 border border-red-300 text-red-600 text-sm rounded-md hover:bg-red-50"
              >
                Remove
              </button>
            )}
          </div>

          {!saved[provider.id] && !keys[provider.id] && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> No API key configured
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
