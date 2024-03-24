import { fileURLToPath } from 'url';

import { logAndIgnoreError } from '../../lib/utils/errors.js';
import { seedCodeSnippets } from '../enumeration/seedCodeSnippets.js';
import { seedUsersAndSessions } from '../enumeration/seedUsersAndSessions.js';

const filepath = fileURLToPath(import.meta.url);
const filename = filepath.split('/').pop()?.split('.')[0];

console.log(`${filename} group: Seeding db...`);
await logAndIgnoreError(seedUsersAndSessions);
await logAndIgnoreError(seedCodeSnippets);
console.log(`${filename} group: Seeding complete`);
