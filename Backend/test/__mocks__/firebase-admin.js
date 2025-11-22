module.exports = {
  auth: () => ({
    verifyIdToken: () => Promise.resolve({ uid: 'test-uid' }),
    createUser: () => Promise.resolve({ uid: 'test-uid' }),
    deleteUser: () => Promise.resolve(),
  }),
  credential: {
    cert: () => {},
  },
  initializeApp: () => {},
};
