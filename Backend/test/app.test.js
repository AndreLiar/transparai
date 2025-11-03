const request = require('supertest');
const app = require('../app');

describe('App', () => {
  it('should return 200 for the health check endpoint', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
  });
});
