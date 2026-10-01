import type { ModelProvider } from './types';

export interface APIResponse {
  content: string;
  tokensUsed?: number;
  durationMs: number;
}

export async function callModel(
  provider: ModelProvider,
  modelId: string,
  prompt: string,
  apiKey: string
): Promise<APIResponse> {
  const start = performance.now();

  switch (provider) {
    case 'openai':
      return callOpenAI(modelId, prompt, apiKey, start);
    case 'anthropic':
      return callAnthropic(modelId, prompt, apiKey, start);
    case 'google':
      return callGoogle(modelId, prompt, apiKey, start);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

async function callOpenAI(
  modelId: string,
  prompt: string,
  apiKey: string,
  start: number
): Promise<APIResponse> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI API error: ${res.status}`);
  }

  const data = await res.json();
  return {
    content: data.choices[0]?.message?.content || '',
    tokensUsed: data.usage?.total_tokens,
    durationMs: Math.round(performance.now() - start),
  };
}

async function callAnthropic(
  modelId: string,
  prompt: string,
  apiKey: string,
  start: number
): Promise<APIResponse> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: modelId,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Anthropic API error: ${res.status}`);
  }

  const data = await res.json();
  return {
    content: data.content[0]?.text || '',
    tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens,
    durationMs: Math.round(performance.now() - start),
  };
}

async function callGoogle(
  modelId: string,
  prompt: string,
  apiKey: string,
  start: number
): Promise<APIResponse> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Google API error: ${res.status}`);
  }

  const data = await res.json();
  return {
    content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
    tokensUsed: data.usageMetadata?.totalTokenCount,
    durationMs: Math.round(performance.now() - start),
  };
}
