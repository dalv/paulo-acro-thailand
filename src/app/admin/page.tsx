'use client';

import { useState } from 'react';

export default function AdminPage() {
  const [stripeSessionId, setStripeSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleReprocess = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/reprocess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId: stripeSessionId }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult('✓ Successfully added to Google Sheets');
      } else {
        setResult(`✗ Error: ${data.error}`);
      }
    } catch (error: any) {
      setResult(`✗ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Admin: Reprocess Registration
        </h1>
        
        <p className="text-gray-600 mb-4">
          If a registration payment succeeded but wasn't added to the spreadsheet,
          enter the Stripe Session ID here to manually add it.
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stripe Session ID
          </label>
          <input
            type="text"
            value={stripeSessionId}
            onChange={(e) => setStripeSessionId(e.target.value)}
            placeholder="cs_test_..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          />
        </div>

        <button
          onClick={handleReprocess}
          disabled={loading || !stripeSessionId}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Processing...' : 'Reprocess Registration'}
        </button>

        {result && (
          <div className={`mt-4 p-4 rounded-lg ${
            result.startsWith('✓') 
              ? 'bg-green-50 text-green-800' 
              : 'bg-red-50 text-red-800'
          }`}>
            {result}
          </div>
        )}
      </div>
    </div>
  );
}