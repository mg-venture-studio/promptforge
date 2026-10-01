import ApiKeySettings from '@/components/ApiKeySettings';
import ModelSelector from '@/components/ModelSelector';

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage API keys and model configuration
        </p>
      </div>
      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold mb-4">API Keys</h2>
          <ApiKeySettings />
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-4">Models</h2>
          <ModelSelector />
        </section>
      </div>
    </div>
  );
}
