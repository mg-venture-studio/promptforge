import PromptTestUI from '@/components/PromptTestUI';

export default function TestPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Prompt Testing</h1>
        <p className="text-sm text-gray-500 mt-1">
          Test your prompt across multiple AI models side-by-side
        </p>
      </div>
      <PromptTestUI />
    </div>
  );
}
