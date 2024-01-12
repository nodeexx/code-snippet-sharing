import { prisma } from '../../lib/prisma/client.js';
import { faker } from '@faker-js/faker';

const POSTGRES_CODE_SNIPPETS_SEQUENCE_NAME = 'code_snippets_id_seq';
const SEEDED_USER_ID = 'uop6wpmo6m20i6p';
const OTHER_SEEDED_USER_ID = 'zop6wpmo6m20i6p';

/**
 * @typedef {import('@prisma/client').CodeSnippet} CodeSnippet
 */

/**
 * @type {CodeSnippet[]}
 */
const MANUALLY_CREATED_CODE_SNIPPETS_FIRST = [
  getCodeSnippet({
    id: 1,
    name: 'For editing',
    code: "console.log('For editing');",
    created_at: new Date('2023-01-01T00:00:00.000Z'),
    updated_at: new Date('2023-01-01T00:00:00.000Z'),
  }),
  getCodeSnippet({
    id: 2,
    name: 'For deletion',
    code: "console.log('For deletion');",
    created_at: new Date('2023-01-01T00:00:00.000Z'),
    updated_at: new Date('2023-01-01T00:00:00.000Z'),
  }),
  getCodeSnippet({
    id: 3,
    name: 'For viewing',
    code: "console.log('For viewing');",
    created_at: new Date('2023-01-01T00:00:00.000Z'),
    updated_at: new Date('2023-01-01T00:00:00.000Z'),
  }),
  getCodeSnippet({
    id: 4,
    user_id: OTHER_SEEDED_USER_ID,
    name: 'From other user',
    code: "console.log('From other user');",
    created_at: new Date('2023-01-01T00:00:00.000Z'),
    updated_at: new Date('2023-01-01T00:00:00.000Z'),
  }),
];

/**
 * @type {CodeSnippet[]}
 */
const AUTOMATICALLY_GENERATED_CODE_SNIPPETS = [...Array(9)].map((_, index) =>
  getCodeSnippet({
    id: MANUALLY_CREATED_CODE_SNIPPETS_FIRST.length + index + 1,
    name: faker.lorem.words({ min: 1, max: 20 }),
    code: faker.lorem.paragraphs({ min: 1, max: 5 }),
  }),
);

/**
 * @type {CodeSnippet[]}
 */
const MANUALLY_CREATED_CODE_SNIPPETS_LAST = [
  getCodeSnippet({
    id:
      MANUALLY_CREATED_CODE_SNIPPETS_FIRST.length +
      AUTOMATICALLY_GENERATED_CODE_SNIPPETS.length +
      1,
    name: 'For pagination check',
    code: "console.log('For pagination check');",
  }),
];

/**
 * @type {CodeSnippet[]}
 */
const CODE_SNIPPETS = [
  ...MANUALLY_CREATED_CODE_SNIPPETS_FIRST,
  ...AUTOMATICALLY_GENERATED_CODE_SNIPPETS,
  ...MANUALLY_CREATED_CODE_SNIPPETS_LAST,
];

/**
 * @returns {Promise<void>}
 */
export async function seedCodeSnippets() {
  const dataExistsInDb = await doesDataExistInDb();
  if (dataExistsInDb) {
    console.error(
      `ERROR - ${seedCodeSnippets.name} seed: Some/all data already exists in database`,
    );
    return;
  }

  console.log(`${seedCodeSnippets.name} seed: Seeding...`);
  await seedData();
  console.log(`${seedCodeSnippets.name} seed: Seeded`);
}

/**
 * @returns {Promise<boolean>}
 */
async function doesDataExistInDb() {
  const codeSnippet = /** @type {CodeSnippet} */ (CODE_SNIPPETS[0]);
  const foundCodeSnippet = await prisma.codeSnippet.findUnique({
    where: { id: codeSnippet.id },
  });

  if (foundCodeSnippet) {
    return true;
  }

  return false;
}

/**
 * @returns {Promise<void>}
 */
async function seedData() {
  for (const codeSnippet of CODE_SNIPPETS) {
    await prisma.codeSnippet.create({
      data: codeSnippet,
    });
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  // NOTE: Seed inserts code snippets with fixed ids. This bypasses
  // PostgreSQL auto-increment. So manual sequence reset is required.
  await prisma.$executeRawUnsafe(
    `ALTER SEQUENCE ${POSTGRES_CODE_SNIPPETS_SEQUENCE_NAME} RESTART WITH ${
      CODE_SNIPPETS.length + 1
    };`,
  );
}

/**
 * @param {Partial<CodeSnippet>} [partial]
 * @returns {CodeSnippet}
 */
function getCodeSnippet(partial = {}) {
  const date = new Date();
  return {
    id: 1,
    user_id: SEEDED_USER_ID,
    name: 'Code snippet',
    code: "console.log('Code snippet');",
    is_deleted: false,
    created_at: date,
    updated_at: date,
    deleted_at: null,
    ...partial,
  };
}
