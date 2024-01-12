import { auth } from '../../lib/lucia/client.js';
import { prisma } from '../../lib/prisma/client.js';

const TEST_USERS_DATA = [
  {
    userId: 'uop6wpmo6m20i6p',
    userEmail: 'user@example.com',
    providerId: 'google',
    // Imitate GoogleUser.sub
    // 'lucia/utils' generateRandomString(21, '0123456789')
    providerUserId: '175394136474142020834',
    sessionId: '5x39nr9tnlb4pzj3fd7t1sz93n6azqq392dluyft',
  },
  {
    userId: 'zop6wpmo6m20i6p',
    userEmail: 'before-sign-out@example.com',
    providerId: 'google',
    providerUserId: '975394136474142020834',
    sessionId: '9x39nr9tnlb4pzj3fd7t1sz93n6azqq392dluyft',
  },
];

/**
 * @returns {Promise<void>}
 */
export async function seedUsersAndSessions() {
  const dataExistsInDb = await doesDataExistInDb();
  if (dataExistsInDb) {
    console.error(
      `ERROR - ${seedUsersAndSessions.name} seed: Some/all data already exists in database`,
    );
    return;
  }

  console.log(`${seedUsersAndSessions.name} seed: Seeding...`);
  await seedData();
  console.log(`${seedUsersAndSessions.name} seed: Seeded`);
}

/**
 * @returns {Promise<boolean>}
 */
async function doesDataExistInDb() {
  const testUserData = /** @type {typeof TEST_USERS_DATA[0]} */ (
    TEST_USERS_DATA[0]
  );
  const userId = await prisma.user.findUnique({
    where: { id: testUserData.userId },
  });
  const keyId = await prisma.key.findUnique({
    where: { id: `${testUserData.providerId}:${testUserData.providerUserId}` },
  });
  const sessionId = await prisma.session.findUnique({
    where: { id: testUserData.sessionId },
  });

  if (userId || keyId || sessionId) {
    return true;
  }

  return false;
}

/**
 * @returns {Promise<void>}
 */
async function seedData() {
  await Promise.all(
    TEST_USERS_DATA.map(async (testUserData) => {
      await auth.createUser({
        userId: testUserData.userId,
        attributes: {
          email: testUserData.userEmail,
          email_verified: true,
        },
        key: {
          providerId: testUserData.providerId,
          providerUserId: testUserData.providerUserId,
          password: null,
        },
      });

      await auth.createSession({
        sessionId: testUserData.sessionId,
        userId: testUserData.userId,
        attributes: {},
      });
    }),
  );
}
