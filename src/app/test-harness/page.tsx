'use client';

import { SessionProvider } from 'next-auth/react';
import { useState } from 'react';

const mockSession = {
  user: {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    image: 'https://example.com/avatar.jpg',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

export default function TestHarnessPage() {
  const [sessionEnabled, setSessionEnabled] = useState(false);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">E2E Test Harness</h1>

      <div className="mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={sessionEnabled}
            onChange={(e) => setSessionEnabled(e.target.checked)}
            data-testid="session-toggle"
          />
          <span>Enable Mock Session</span>
        </label>
      </div>

      {sessionEnabled ? (
        <SessionProvider session={mockSession}>
          <div data-testid="session-enabled">
            <p>Session Active: {mockSession.user.name}</p>
            <a href="/dashboard" className="text-blue-500 underline">
              Go to Dashboard
            </a>
          </div>
        </SessionProvider>
      ) : (
        <div data-testid="session-disabled">
          <p>No Session</p>
          <a href="/login" className="text-blue-500 underline">
            Go to Login
          </a>
        </div>
      )}
    </div>
  );
}