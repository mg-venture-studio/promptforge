import Dexie, { type Table } from 'dexie';
import type { Prompt, PromptVersion, Folder, TestRun, ABTest, ABTestResult, ApiKeyRecord } from './types';

export class PromptForgeDB extends Dexie {
  prompts!: Table<Prompt, number>;
  promptVersions!: Table<PromptVersion, number>;
  folders!: Table<Folder, number>;
  testRuns!: Table<TestRun, number>;
  abTests!: Table<ABTest, number>;
  abTestResults!: Table<ABTestResult, number>;
  apiKeys!: Table<ApiKeyRecord, number>;

  constructor() {
    super('PromptForgeDB');
    this.version(1).stores({
      prompts: '++id, title, folderId, *tags, createdAt, updatedAt',
      promptVersions: '++id, promptId, versionNumber, createdAt',
      folders: '++id, name, parentId',
      testRuns: '++id, promptId, modelId, provider, createdAt',
      abTests: '++id, name, createdAt',
      abTestResults: '++id, abTestId, variationId, modelId, createdAt',
      apiKeys: '++id, provider',
    });
  }
}

export const db = new PromptForgeDB();

export async function savePromptVersion(promptId: number, content: string): Promise<void> {
  const latestVersion = await db.promptVersions
    .where('promptId')
    .equals(promptId)
    .reverse()
    .sortBy('versionNumber');

  const nextVersion = latestVersion.length > 0 ? latestVersion[0].versionNumber + 1 : 1;

  await db.promptVersions.add({
    promptId,
    content,
    versionNumber: nextVersion,
    createdAt: new Date(),
  });
}

export async function getPromptVersions(promptId: number): Promise<PromptVersion[]> {
  return db.promptVersions
    .where('promptId')
    .equals(promptId)
    .reverse()
    .sortBy('versionNumber');
}
