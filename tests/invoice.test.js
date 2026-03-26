const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');

let accessToken;
let apiKey;
let invoiceId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // Register + Login
  const res = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Invoice Tester',
      email: `invoice${Date.now()}@gmail.com`,
      password: 'Test@1234'
    });

  accessToken = res.body.accessToken;
  apiKey = res.body.apiKey;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Invoice API Tests', () => {

  // Create Invoice
  describe('POST /api/v1/invoices', () => {
    it('should create invoice successfully', async () => {
      const res = await request(app)
        .post('/api/v1/invoices')
        .set('x-api-key', apiKey)
        .send({
          clientName:    'Acme Corp',
          clientEmail:   'acme@gmail.com',
          clientAddress: 'Mumbai, India',
          clientState:   'Maharashtra',
          sellerState:   'Delhi',
          businessName:  'Roshan Dev Studio',
          currency:      'INR',
          items: [{
            description: 'Web Development',
            hsnCode:     '9983',
            quantity:    10,
            rate:        2000,
            amount:      20000
          }],
          dueDate: '2027-12-31'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.invoice).toHaveProperty('invoiceNo');
      expect(res.body.invoice).toHaveProperty('gstBreakdown');
      invoiceId = res.body.invoice._id;
    });

    it('should fail without api key', async () => {
      const res = await request(app)
        .post('/api/v1/invoices')
        .send({ clientName: 'Test' });
      expect(res.statusCode).toBe(401);
    });

    it('should fail with missing required fields', async () => {
      const res = await request(app)
        .post('/api/v1/invoices')
        .set('x-api-key', apiKey)
        .send({ clientName: 'Test' });
      expect(res.statusCode).toBe(400);
    });
  });

  // Get Invoices
  describe('GET /api/v1/invoices', () => {
    it('should get all invoices', async () => {
      const res = await request(app)
        .get('/api/v1/invoices')
        .set('x-api-key', apiKey);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('invoices');
    });

    it('should filter by status', async () => {
      const res = await request(app)
        .get('/api/v1/invoices?status=draft')
        .set('x-api-key', apiKey);
      expect(res.statusCode).toBe(200);
    });
  });

  // Get Single Invoice
  describe('GET /api/v1/invoices/:id', () => {
    it('should get single invoice', async () => {
      const res = await request(app)
        .get(`/api/v1/invoices/${invoiceId}`)
        .set('x-api-key', apiKey);
      expect(res.statusCode).toBe(200);
      expect(res.body.invoice._id).toBe(invoiceId);
    });

    it('should return 404 for invalid id', async () => {
      const res = await request(app)
        .get('/api/v1/invoices/invalidid123')
        .set('x-api-key', apiKey);
      expect(res.statusCode).toBe(404);
    });
  });

  // Update Invoice
  describe('PATCH /api/v1/invoices/:id', () => {
    it('should update draft invoice', async () => {
      const res = await request(app)
        .patch(`/api/v1/invoices/${invoiceId}`)
        .set('x-api-key', apiKey)
        .send({ notes: 'Updated notes' });
      expect(res.statusCode).toBe(200);
    });
  });

  // Mark Paid
  describe('PATCH /api/v1/invoices/:id/mark-paid', () => {
    it('should mark invoice as paid', async () => {
      const res = await request(app)
        .patch(`/api/v1/invoices/${invoiceId}/mark-paid`)
        .set('x-api-key', apiKey);
      expect(res.statusCode).toBe(200);
      expect(res.body.invoice.status).toBe('paid');
    });

    it('should fail if already paid', async () => {
      const res = await request(app)
        .patch(`/api/v1/invoices/${invoiceId}/mark-paid`)
        .set('x-api-key', apiKey);
      expect(res.statusCode).toBe(400);
    });
  });

  // Delete Invoice
  describe('DELETE /api/v1/invoices/:id', () => {
    it('should fail to delete paid invoice', async () => {
      const res = await request(app)
        .delete(`/api/v1/invoices/${invoiceId}`)
        .set('x-api-key', apiKey);
      expect(res.statusCode).toBe(400);
    });
  });

});