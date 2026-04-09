# 🧾 InvoiceAPI — Production SaaS Backend

[![CI/CD](https://github.com/roshanjha13/invoice_api/actions/workflows/ci.yml/badge.svg)](https://github.com/roshanjha13/invoice_api/actions)
![Node.js](https://img.shields.io/badge/Node.js-18-green)
![MongoDB](https://img.shields.io/badge/MongoDB-6-green)
![Redis](https://img.shields.io/badge/Redis-7-red)
![Docker](https://img.shields.io/badge/Docker-ready-blue)
![License](https://img.shields.io/badge/license-ISC-blue)

A **production-ready SaaS Invoice Generation API** built with Node.js, Express.js, MongoDB, Redis, and BullMQ. Designed for multi-tenant usage with enterprise-grade security, async job processing, fault tolerance, and real-time monitoring.

> 🚀 **Live Demo:** [your-app.onrender.com](https://your-app.onrender.com)
> 📦 **GitHub:** [github.com/roshanjha13/invoice_api](https://github.com/roshanjha13/invoice_api)

---

## ✨ Features

### 🔐 Security & Auth
- JWT Access + Refresh Token with Redis blacklisting
- OAuth 2.0 Google login via Passport.js
- Account lockout after 5 failed attempts
- Role-Based Access Control (Admin / Manager / User)
- XSS, NoSQL injection, HPP protection
- 6-layer rate limiting (Global, Auth, Plan, PDF, Email, IP)

### 🧾 Invoice Management
- Full CRUD with status tracking (draft → sent → paid)
- PDF generation using Worker Threads (non-blocking)
- Email delivery with PDF attachment
- Webhook support on invoice events
- Idempotency key support

### 💰 GST Engine
- HSN code detection with auto GST rate mapping
- Auto Intra/Inter state detection
- Item-wise CGST / SGST / IGST calculation
- India-ready billing compliance

### 💳 Payments
- Razorpay payment gateway integration
- Payment verification with signature check
- Refund flow
- Webhook handler (payment.captured, payment.failed, refund.created)

### 🔄 Subscriptions
- Plan management (Free / Starter / Pro / Enterprise)
- Trial period with auto expiry
- Monthly/yearly billing cycles
- Auto plan downgrade on cancellation/expiry
- Razorpay subscription webhooks

### 🎟️ Coupon System
- Percentage + Fixed discount types
- Plan-specific coupons
- Usage limits + expiry dates
- Per-user usage tracking

### ⚡ Performance & Reliability
- Node.js Cluster mode (multi-core utilization)
- BullMQ job queues (email, PDF, webhook)
- Worker Threads for CPU-intensive PDF generation
- Custom Circuit Breaker (Email, Cloudinary, Razorpay, Webhook)
- Retry Pattern with exponential backoff
- Graceful shutdown with cleanup
- Request timeout middleware

### 📊 Analytics & Reporting
- MongoDB Aggregation Pipeline analytics
- Monthly revenue trends
- Top clients report
- GST summary
- Payment stats
- CSV + GST export

### 🔍 Audit & Monitoring
- Comprehensive audit logging (all user actions)
- Prometheus custom metrics
- Winston structured logging
- Circuit breaker stats endpoint

---

## 🏗️ Architecture

```
src/
├── config/           # DB, Redis, Queue, Passport, Swagger, Prometheus, Razorpay
├── middlewares/      # Auth, Validate, RateLimit, RBAC, Sanitize, Metrics, Timeout
├── modules/
│   ├── auth/         # Register, Login, OAuth, Refresh Token
│   ├── invoice/      # CRUD, PDF, Email, GST, Webhooks
│   ├── payment/      # Razorpay, Verify, Refund, Webhook
│   ├── subscription/ # Plans, Trial, Billing, Webhook
│   ├── transaction/  # Transaction logs
│   ├── coupon/       # Discount codes
│   ├── admin/        # User management, Plan control
│   ├── analytics/    # Revenue, GST, CSV export
│   └── audit/        # Action logs
├── queues/
│   ├── jobs/         # Email, PDF, Webhook job creators
│   └── workers/      # BullMQ workers with retry pattern
├── workers/          # Worker Threads (PDF generation)
├── jobs/             # Cron jobs (invoice reset, trial expiry)
├── utils/            # GST, PDF, Email, Token, Logger, Circuit Breaker, Retry
└── routes/           # Centralized route registry
```

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18 (Cluster Mode) |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Cache | Redis |
| Queue | BullMQ |
| Auth | JWT + Passport.js (OAuth 2.0) |
| PDF | PDFKit + Worker Threads |
| Email | Nodemailer |
| Storage | Cloudinary |
| Payment | Razorpay |
| Monitoring | Prometheus + Winston |
| DevOps | Docker + GitHub Actions |

---

## ⚡ Quick Start

### Prerequisites
```
Node.js >= 18
MongoDB >= 6
Redis >= 6
```

### Installation
```bash
git clone https://github.com/roshanjha13/invoice_api.git
cd invoice_api
npm install
cp .env.example .env
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

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxx
RAZORPAY_PLAN_STARTER=plan_xxxxxxxxxx
RAZORPAY_PLAN_PRO=plan_xxxxxxxxxx
```

---

## 📡 API Endpoints

### Auth
```
POST   /api/v1/auth/register              Register
POST   /api/v1/auth/login                 Login
POST   /api/v1/auth/logout                Logout
POST   /api/v1/auth/refresh-token         Refresh token
GET    /api/v1/auth/google                Google OAuth
GET    /api/v1/auth/api-key               Get API key
POST   /api/v1/auth/api-key/regenerate    Regenerate API key
```

### Invoices
```
POST   /api/v1/invoices                   Create invoice
GET    /api/v1/invoices                   Get all invoices
GET    /api/v1/invoices/:id               Get invoice
PATCH  /api/v1/invoices/:id               Update invoice
DELETE /api/v1/invoices/:id               Delete invoice
GET    /api/v1/invoices/:id/pdf           Download PDF
POST   /api/v1/invoices/:id/send          Send via email
PATCH  /api/v1/invoices/:id/mark-paid     Mark as paid
```

### Payments
```
POST   /api/v1/payments/create-order      Create order
POST   /api/v1/payments/verify            Verify payment
POST   /api/v1/payments/webhook           Razorpay webhook
GET    /api/v1/payments                   Get all payments
GET    /api/v1/payments/invoice/:id       Get by invoice
POST   /api/v1/payments/:id/refund        Refund (admin)
```

### Subscriptions
```
POST   /api/v1/subscriptions              Create subscription
POST   /api/v1/subscriptions/trial        Start trial
GET    /api/v1/subscriptions              Get all
GET    /api/v1/subscriptions/current      Current subscription
PATCH  /api/v1/subscriptions/change-plan  Change plan
POST   /api/v1/subscriptions/cancel       Cancel
POST   /api/v1/subscriptions/webhook      Razorpay webhook
```

### Coupons
```
POST   /api/v1/coupons/apply              Apply coupon (check)
POST   /api/v1/coupons/verify             Verify + use coupon
POST   /api/v1/coupons                    Create (admin)
GET    /api/v1/coupons                    Get all (admin)
PATCH  /api/v1/coupons/:id                Update (admin)
DELETE /api/v1/coupons/:id                Delete (admin)
PATCH  /api/v1/coupons/:id/toggle         Toggle active (admin)
```

### Analytics
```
GET    /api/v1/analytics/stats            Overall stats
GET    /api/v1/analytics/status           Status wise
GET    /api/v1/analytics/monthly-revenue  Monthly revenue
GET    /api/v1/analytics/top-clients      Top clients
GET    /api/v1/analytics/gst-summary      GST summary
GET    /api/v1/analytics/payment-stats    Payment stats
GET    /api/v1/analytics/export/invoices  Export CSV
GET    /api/v1/analytics/export/gst       Export GST CSV
```

### Transactions
```
GET    /api/v1/transactions               All transactions
GET    /api/v1/transactions/stats         Stats
GET    /api/v1/transactions/monthly       Monthly breakdown
```

### Admin
```
GET    /api/v1/admin/users                    All users
PATCH  /api/v1/admin/users/:id/toggle-status  Ban/unban
PATCH  /api/v1/admin/users/:id/plan           Change plan
GET    /api/v1/admin/invoices                 All invoices
```

### Audit
```
GET    /api/v1/audit/my-logs              My logs
GET    /api/v1/audit/all                  All logs (admin)
```

### System
```
GET    /health                            Health check
GET    /metrics                           Prometheus metrics
GET    /circuit-breakers                  Circuit breaker stats
GET    /api/docs                          Swagger UI
```

---

## 💰 Pricing Tiers

| Plan | Invoices/month | Rate Limit | Trial | Price |
|------|---------------|------------|-------|-------|
| Free | 50 | 10 req/min | — | ₹0 |
| Starter | 500 | 60 req/min | 14 days | ₹999/mo |
| Pro | Unlimited | 300 req/min | 14 days | ₹2,999/mo |
| Enterprise | Unlimited | 1000 req/min | 30 days | Custom |

---

## 🧪 Testing

```bash
npm test
```

---

## ⚡ Fault Tolerance

| Component | Strategy |
|-----------|---------|
| Email Service | Circuit Breaker (3 failures → OPEN) + Retry (3x) |
| Cloudinary | Circuit Breaker (3 failures → OPEN) + Retry (3x) |
| Razorpay | Circuit Breaker (5 failures → OPEN) |
| Webhook | Circuit Breaker (5 failures → OPEN) + Retry (5x) |
| Server | Graceful Shutdown + Request Timeout |

---

## 📊 Monitoring

```
GET /metrics          → Prometheus metrics
GET /circuit-breakers → Circuit breaker stats
GET /health           → Server + DB status
```

---

## 👨‍💻 Author

**Roshan Kumar Jha**
- GitHub: [@roshanjha13](https://github.com/roshanjha13)
- Email: jharoshan618@gmail.com
- LinkedIn: [Roshan Kumar Jha](https://linkedin.com/in/roshanjha)

---

## 📄 License

ISC © Roshan Kumar Jha