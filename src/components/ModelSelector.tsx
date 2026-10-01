'use client';

import { useState } from 'react';
import type { ModelConfig, ModelProvider } from '@/lib/types';
import { DEFAULT_MODELS } from '@/lib/types';
import { getModels, saveModels } from '@/lib/models';
import { useEffect } from 'react';
import { ToggleLeft, ToggleRight } from 'lucide-react';

const PROVIDER_COLORS: Record<ModelProvider, string> = {
  openai: 'bg-green-100 text-green-800',
  anthropic: 'bg-orange-100 text-orange-800',
  google: 'bg-blue-100 text-blue-800',
};

export default function ModelSelector() {
  const [models, setModels] = useState<ModelConfig[]>([]);

  useEffect(() => {
    const stored = getModels();
    setModels(stored.length > 0 ? stored : DEFAULT_MODELS);
  }, []);

  function toggleModel(id: string) {
    const updated = models.map((m) =>
      m.id === id ? { ...m, enabled: !m.enabled } : m
    );
    setModels(updated);
    saveModels(updated);
  }

  const enabledModels = models.filter((m) => m.enabled);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">Models ({enabledModels.length} enabled)</h3>
      </div>
      <div className="grid gap-2">
        {models.map((model) => (
          <div
            key={model.id}
            className="flex items-center justify-between p-3 border rounded-lg"
          >
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PROVIDER_COLORS[model.provider]}`}>
                {model.provider}
              </span>
              <span className="text-sm">{model.name}</span>
            </div>
            <button onClick={() => toggleModel(model.id)} className="text-gray-400 hover:text-gray-600">
              {model.enabled ? (
                <ToggleRight className="w-6 h-6 text-blue-600" />
              ) : (
                <ToggleLeft className="w-6 h-6" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
