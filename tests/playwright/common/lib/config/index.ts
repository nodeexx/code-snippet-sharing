import { DEFAULT_SESSION_COOKIE_NAME } from 'lucia';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

export const config = {
  testData: {
    authSessionCookie: {
      name: DEFAULT_SESSION_COOKIE_NAME,
      value: '5x39nr9tnlb4pzj3fd7t1sz93n6azqq392dluyft',
      signOutTestsValue: '9x39nr9tnlb4pzj3fd7t1sz93n6azqq392dluyft',
    },
    codeSnippets: {
      forCreation: {
        name: 'Created',
        code: "console.log('Created');",
      },
      forEditing: {
        id: 1,
        name: 'For editing',
        newName: 'For editing - Edited',
        code: "console.log('For editing');",
      },
      forDeletion: {
        id: 2,
        name: 'For deletion',
        code: "console.log('For deletion');",
      },
      forViewing: {
        id: 3,
        name: 'For viewing',
        code: "console.log('For viewing');",
      },
      fromOtherUser: {
        id: 4,
        name: 'From other user',
        code: "console.log('From other user');",
      },
      forPaginationCheck: {
        name: 'For pagination check',
        code: "console.log('For pagination check');",
      },
    },
  },
};
