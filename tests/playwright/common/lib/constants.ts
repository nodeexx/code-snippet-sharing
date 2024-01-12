import path from 'path';
import url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const COMMON_TESTS_FOLDER = path.join(
  __dirname,
  '..',
  '..',
  'common',
  'tests',
);
export const COMMON_REPORTS_FOLDER = path.join(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  'reports',
  'playwright',
  'common',
);
export const COMMON_SAVED_STATES_FOLDER = path.join(
  __dirname,
  '..',
  'saved-states',
);

export const E2E_TESTS_FOLDER = path.join(
  __dirname,
  '..',
  '..',
  'e2e',
  'tests',
);
export const E2E_REPORTS_FOLDER = path.join(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  'reports',
  'playwright',
  'e2e',
);

export const API_TESTS_FOLDER = path.join(
  __dirname,
  '..',
  '..',
  'api',
  'tests',
);
export const API_REPORTS_FOLDER = path.join(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  'reports',
  'playwright',
  'api',
);
