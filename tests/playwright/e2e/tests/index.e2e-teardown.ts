import { test as teardown } from '@playwright/test';

teardown('teardown E2E', () => {
  console.log('E2E teardown complete');
});
