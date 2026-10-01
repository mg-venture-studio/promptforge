import ABTestingUI from '@/components/ABTestingUI';

export default function ABTestingPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">A/B Testing</h1>
        <p className="text-sm text-gray-500 mt-1">
          Compare prompt variations across models
        </p>
      </div>
      <ABTestingUI />
    </div>
  );
}
