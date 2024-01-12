import { fileURLToPath } from 'url';
import { seedUsersAndSessions } from '../enumeration/seedUsersAndSessions.js';
import { deleteAll } from '../enumeration/deleteAll.js';
import { seedCodeSnippets } from '../enumeration/seedCodeSnippets.js';

const filepath = fileURLToPath(import.meta.url);
const filename = filepath.split('/').pop()?.split('.')[0];

console.log(`${filename} group: Seeding db...`);
await deleteAll();
await seedUsersAndSessions();
await seedCodeSnippets();
console.log(`${filename} group: Seeding complete`);
