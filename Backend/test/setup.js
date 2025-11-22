const { connect, close, clear } = require('./test_db');

beforeAll(async () => {
  await connect();
});

afterAll(async () => {
  await close();
});

beforeEach(async () => {
  await clear();
});
