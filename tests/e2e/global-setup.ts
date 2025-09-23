import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // Set up any global test state here
  // For example, you could set up test database, clear caches, etc.

  // Set test environment variable to bypass auth in test harness
  process.env.NEXT_PUBLIC_TEST_MODE = 'true';

  console.log('Running global setup for E2E tests');

  return async () => {
    // Global teardown
    console.log('Running global teardown for E2E tests');
  };
}

export default globalSetup;