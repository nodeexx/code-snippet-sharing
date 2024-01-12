import { prisma } from '../../lib/prisma/client.js';

/**
 * @returns {Promise<void>}
 */
export async function deleteAll() {
  console.log(`${deleteAll.name} seed: Deleting all...`);
  await deleteData();
  console.log(`${deleteAll.name} seed: Deleted all`);
}

/**
 * @returns {Promise<void>}
 */
async function deleteData() {
  await prisma.session.deleteMany();
  await prisma.key.deleteMany();
  await prisma.user.deleteMany();
}
