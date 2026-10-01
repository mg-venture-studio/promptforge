import PromptLibrary from '@/components/PromptLibrary';

export default function LibraryPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Prompt Library</h1>
        <p className="text-sm text-gray-500 mt-1">
          Organize, version, and manage your prompts
        </p>
      </div>
      <PromptLibrary />
    </div>
  );
}
