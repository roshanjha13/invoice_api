const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Auth API Tests', () => {

  // Register
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          email: `test${Date.now()}@gmail.com`,
          password: 'Test@1234'
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('apiKey');
    });

    it('should fail with missing fields', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'test@gmail.com' });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail with invalid email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'Test', email: 'invalidemail', password: 'Test@1234' });
      expect(res.statusCode).toBe(400);
    });

    it('should fail with weak password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'Test', email: 'test@gmail.com', password: '123' });
      expect(res.statusCode).toBe(400);
    });
  });

  // Login
  describe('POST /api/v1/auth/login', () => {
    const email = `login${Date.now()}@gmail.com`;

    beforeAll(async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'Login User', email, password: 'Test@1234' });
    });

    it('should login successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password: 'Test@1234' });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('should fail with wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password: 'WrongPass@123' });
      expect(res.statusCode).toBe(401);
    });

    it('should fail with non-existent email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'notexist@gmail.com', password: 'Test@1234' });
      expect(res.statusCode).toBe(401);
    });
  });

  // Health Check
  describe('GET /health', () => {
    it('should return OK status', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('OK');
    });
  });

});