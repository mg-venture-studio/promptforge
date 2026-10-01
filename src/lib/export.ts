import type { TestRun, ABTestResult } from './types';

export function exportAsJSON(data: TestRun[] | ABTestResult[]): string {
  return JSON.stringify(data, null, 2);
}

export function exportAsMarkdown(data: TestRun[] | ABTestResult[]): string {
  return data
    .map((item) => {
      const header = `## ${('modelId' in item ? item.modelId : 'Unknown')} — ${new Date(item.createdAt).toLocaleString()}`;
      const meta = `Duration: ${item.durationMs}ms | Tokens: ${item.tokensUsed || 'N/A'}`;
      return `${header}\n\n${meta}\n\n${item.response}\n`;
    })
    .join('\n---\n\n');
}

export function exportAsPlainText(data: TestRun[] | ABTestResult[]): string {
  return data
    .map((item) => {
      const header = `[${('modelId' in item ? item.modelId : 'Unknown')} — ${new Date(item.createdAt).toLocaleString()}]`;
      return `${header}\n${item.response}\n`;
    })
    .join('\n\n');
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
