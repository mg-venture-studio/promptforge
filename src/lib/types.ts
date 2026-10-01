export type ModelProvider = 'openai' | 'anthropic' | 'google';

export interface ModelConfig {
  id: string;
  name: string;
  provider: ModelProvider;
  modelId: string;
  enabled: boolean;
}

export interface ApiKeyRecord {
  id?: number;
  provider: ModelProvider;
  encryptedKey: string;
  iv: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Prompt {
  id?: number;
  title: string;
  content: string;
  folderId?: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PromptVersion {
  id?: number;
  promptId: number;
  content: string;
  versionNumber: number;
  createdAt: Date;
}

export interface Folder {
  id?: number;
  name: string;
  parentId?: number;
  createdAt: Date;
}

export interface TestRun {
  id?: number;
  promptId?: number;
  promptContent: string;
  modelId: string;
  provider: ModelProvider;
  response: string;
  tokensUsed?: number;
  durationMs: number;
  createdAt: Date;
}

export interface ABTest {
  id?: number;
  name: string;
  variations: ABVariation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ABVariation {
  id: string;
  content: string;
  label: string;
}

export interface ABTestResult {
  id?: number;
  abTestId: number;
  variationId: string;
  modelId: string;
  provider: ModelProvider;
  response: string;
  tokensUsed?: number;
  durationMs: number;
  createdAt: Date;
}

export const DEFAULT_MODELS: ModelConfig[] = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', modelId: 'gpt-4o', enabled: true },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', modelId: 'gpt-4o-mini', enabled: true },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai', modelId: 'gpt-4-turbo', enabled: false },
  { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', provider: 'anthropic', modelId: 'claude-sonnet-4-20250514', enabled: true },
  { id: 'claude-3-5-haiku', name: 'Claude 3.5 Haiku', provider: 'anthropic', modelId: 'claude-3-5-haiku-20241022', enabled: true },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'google', modelId: 'gemini-2.0-flash', enabled: true },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'google', modelId: 'gemini-1.5-pro', enabled: false },
];
