import { test as teardown } from '@playwright/test';

teardown('teardown API', () => {
  console.log('API teardown complete');
});
