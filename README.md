# 🧾 InvoiceAPI — Production SaaS Backend

[![CI/CD](https://github.com/roshanjha13/invoice_api/actions/workflows/ci.yml/badge.svg)](https://github.com/roshanjha13/invoice_api/actions)
![Node.js](https://img.shields.io/badge/Node.js-18-green)
![MongoDB](https://img.shields.io/badge/MongoDB-6-green)
![Redis](https://img.shields.io/badge/Redis-7-red)
![Docker](https://img.shields.io/badge/Docker-ready-blue)
![License](https://img.shields.io/badge/license-ISC-blue)

A **production-ready SaaS Invoice Generation API** built with Node.js, Express.js, MongoDB, Redis, and BullMQ. Designed for multi-tenant usage with enterprise-grade security, async job processing, and real-time monitoring.

---

## 🚀 Features

- **JWT + Refresh Token** authentication with token blacklisting
- **OAuth 2.0** Google login via Passport.js
- **Account Lockout** after 5 failed login attempts
- **Role-Based Access Control** (Admin / Manager / User)
- **Advanced GST Engine** — HSN code detection, auto CGST/SGST/IGST calculation
- **PDF Invoice Generation** using Worker Threads (non-blocking)
- **Async Job Processing** — BullMQ queues for email, PDF, webhooks
- **Cluster Mode** — multi-core CPU utilization
- **Rate Limiting** — 6-layer (Global, Auth, Plan, PDF, Email, IP)
- **Prometheus Metrics** — HTTP latency, active connections, invoice counters
- **Audit Logging** — track all user actions
- **Invoice Analytics** — MongoDB Aggregation Pipeline
- **CSV/GST Export** — downloadable reports
- **Swagger API Docs** — interactive documentation
- **Docker + CI/CD** — GitHub Actions pipeline

---

## 🏗️ Architecture
```
src/
├── config/          # DB, Redis, Queue, Passport, Swagger, Prometheus
├── middlewares/     # Auth, Validate, RateLimit, RBAC, Sanitize, Metrics
├── modules/
│   ├── auth/        # Register, Login, OAuth, Refresh Token
│   ├── invoice/     # CRUD, PDF, Email, GST, Webhooks
│   ├── admin/       # User management, Plan control
│   ├── analytics/   # Revenue, GST summary, CSV export
│   └── audit/       # Action logs
├── queues/
│   ├── jobs/        # Email, PDF, Webhook job creators
│   └── workers/     # BullMQ workers
├── workers/         # Worker Threads (PDF generation)
├── utils/           # Helpers — GST, PDF, Email, Token, Logger
└── routes/          # Centralized route registry
```

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18 |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Cache | Redis |
| Queue | BullMQ |
| Auth | JWT + Passport.js |
| PDF | PDFKit + Worker Threads |
| Email | Nodemailer |
| Storage | Cloudinary |
| Monitoring | Prometheus + Grafana |
| DevOps | Docker + GitHub Actions |

---

## ⚡ Quick Start

### Prerequisites
```bash
Node.js >= 18
MongoDB >= 6
Redis >= 6
```

### Installation
```bash
git clone https://github.com/roshanjha13/invoice_api.git
cd invoice_api
npm install
cp .env.example .env   # Fill in your values
npm run dev
```

### Docker
```bash
docker-compose up -d
```

---

## 🔑 Environment Variables
```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://localhost:27017/invoiceapi

# JWT
JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 📡 API Endpoints

### Auth
```
POST   /api/v1/auth/register          Register new user
POST   /api/v1/auth/login             Login
POST   /api/v1/auth/logout            Logout
POST   /api/v1/auth/refresh-token     Refresh access token
GET    /api/v1/auth/google            Google OAuth login
GET    /api/v1/auth/api-key           Get API key
POST   /api/v1/auth/api-key/regenerate Regenerate API key
```

### Invoices
```
POST   /api/v1/invoices               Create invoice
GET    /api/v1/invoices               Get all invoices
GET    /api/v1/invoices/:id           Get single invoice
PATCH  /api/v1/invoices/:id           Update invoice
DELETE /api/v1/invoices/:id           Delete invoice
GET    /api/v1/invoices/:id/pdf       Download PDF
POST   /api/v1/invoices/:id/send      Send via email
PATCH  /api/v1/invoices/:id/mark-paid Mark as paid
```

### Analytics
```
GET    /api/v1/analytics/stats           Overall stats
GET    /api/v1/analytics/status          Status wise count
GET    /api/v1/analytics/monthly-revenue Monthly revenue
GET    /api/v1/analytics/top-clients     Top clients
GET    /api/v1/analytics/gst-summary     GST summary
GET    /api/v1/analytics/export/invoices Export CSV
GET    /api/v1/analytics/export/gst      Export GST CSV
```

### Admin
```
GET    /api/v1/admin/users                  All users
PATCH  /api/v1/admin/users/:id/toggle-status Ban/unban user
PATCH  /api/v1/admin/users/:id/plan         Change plan
GET    /api/v1/admin/invoices               All invoices
```

### Audit
```
GET    /api/v1/audit/my-logs    My audit logs
GET    /api/v1/audit/all        All logs (admin only)
```

---

## 💰 Pricing Tiers

| Plan | Invoices/month | Rate Limit | Price |
|------|---------------|------------|-------|
| Free | 50 | 10 req/min | ₹0 |
| Starter | 500 | 60 req/min | ₹999/mo |
| Pro | Unlimited | 300 req/min | ₹2,999/mo |
| Enterprise | Unlimited | 1000 req/min | Custom |

---

## 🧪 Testing
```bash
npm test
```

Coverage targets:
- Statements: > 80%
- Functions: > 80%
- Lines: > 80%

---

## 📊 Monitoring

Prometheus metrics available at:
```
GET /metrics
```

Metrics tracked:
- HTTP request count + duration
- Active connections
- Invoice creation counter
- PDF generation duration
- Email queue size

---

## 🔐 Security

- Helmet.js security headers
- CORS configuration
- Rate limiting (6 layers)
- JWT + Refresh Token
- Token blacklisting (Redis)
- Account lockout
- XSS prevention
- NoSQL injection prevention
- HPP protection
- Request size limiting (10kb)

---

## 👨‍💻 Author

**Roshan Kumar Jha**
- GitHub: [@roshanjha13](https://github.com/roshanjha13)
- Email: jharoshan618@gmail.com
- LinkedIn: [Roshan Kumar Jha](https://linkedin.com/in/roshanjha)

---

## 📄 License

ISC © Roshan Kumar Jha