module.exports = {
  testEnvironment: 'node',
  setupFiles: ['./test/setupEnv.js'],
  setupFilesAfterEnv: ['./test/setup.js'],
  transform: {
    '^.+\.js$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!uuid)/',
  ],
};