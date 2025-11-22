module.exports = {
  testEnvironment: 'node',
  setupFiles: ['./test/setupEnv.js'],
  transform: {
    '^.+\.js$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!uuid)/',
  ],
};
