import { test as teardown } from '@playwright/test';

teardown('teardown API', async () => {
  console.log('API teardown complete');
});
