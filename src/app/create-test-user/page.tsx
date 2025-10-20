"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function CreateTestUserPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCreateUser = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/create-test-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setResult(data);
      } else {
        toast.error(data.message);
        setResult(data);
      }
    } catch (error) {
      console.error('Error creating test user:', error);
      toast.error('Error creating test user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Create Test User</h1>
        
        <button
          onClick={handleCreateUser}
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition disabled:bg-blue-300"
        >
          {loading ? 'Creating...' : 'Create Test User'}
        </button>

        {result && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Result:</h2>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6 space-y-2">
          <a href="/test-auth" className="block text-blue-500 hover:underline">
            Test Auth Page
          </a>
          <a href="/login" className="block text-blue-500 hover:underline">
            Login Page
          </a>
          <a href="/register" className="block text-blue-500 hover:underline">
            Register Page
          </a>
        </div>
      </div>
    </div>
  );
}