# NAIJA CARS - QUICK START IMPLEMENTATION GUIDE

This guide provides step-by-step instructions to begin implementing the redesigned Naija Cars platform.

---

## Prerequisites

### Required Software
- **Node.js:** v18+ (download from nodejs.org)
- **Package Manager:** npm or yarn
- **Database:** PostgreSQL 14+ (or use managed service)
- **Redis:** 6+ (or use managed service)
- **Git:** For version control
- **Code Editor:** VS Code (recommended)

### Required Accounts
- **AWS Account** (or Cloudinary for media storage)
- **Twilio Account** (SMS OTP)
- **SendGrid/Resend Account** (Email)
- **Paystack Account** (Payment processing)
- **GitHub Account** (Version control + CI/CD)

---

## Phase 1: Backend Setup (Week 1)

### Step 1: Initialize Backend Project

```bash
# Create backend directory
mkdir naija-cars-backend
cd naija-cars-backend

# Initialize Node.js project
npm init -y

# Install core dependencies
npm install express cors dotenv bcryptjs jsonwebtoken
npm install pg pg-hstore sequelize
npm install redis socket.io
npm install express-validator express-rate-limit
npm install helmet morgan compression

# Install development dependencies
npm install -D nodemon eslint prettier
```

### Step 2: Set Up Database

**Install Prisma (recommended ORM):**
```bash
npm install @prisma/client
npm install -D prisma

# Initialize Prisma
npx prisma init
```

**Configure `.env` file:**
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/naijacars"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_REFRESH_SECRET="your-refresh-token-secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Redis
REDIS_URL="redis://localhost:6379"

# Twilio (SMS)
TWILIO_ACCOUNT_SID="your-account-sid"
TWILIO_AUTH_TOKEN="your-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"

# SendGrid (Email)
SENDGRID_API_KEY="your-sendgrid-key"
FROM_EMAIL="noreply@naijacars.com"

# AWS S3 (or Cloudinary)
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_BUCKET_NAME="naijacars-media"
AWS_REGION="us-east-1"

# Paystack
PAYSTACK_SECRET_KEY="your-paystack-secret"
PAYSTACK_PUBLIC_KEY="your-paystack-public"

# App Config
PORT=5000
NODE_ENV="development"
CLIENT_URL="http://localhost:5173"
```

### Step 3: Create Database Schema

**Edit `prisma/schema.prisma`:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum UserType {
  INDIVIDUAL_SELLER
  DEALER
  RENTAL_COMPANY
  BUYER
}

enum ListingType {
  SALE
  RENT
}

enum ListingStatus {
  PENDING
  ACTIVE
  SOLD
  RENTED
  INACTIVE
}

enum Condition {
  FOREIGN_USED
  NIGERIAN_USED
  BRAND_NEW
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  phoneNumber   String    @unique @map("phone_number")
  passwordHash  String    @map("password_hash")
  userType      UserType  @map("user_type")
  isVerified    Boolean   @default(false) @map("is_verified")
  isActive      Boolean   @default(true) @map("is_active")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  profile       UserProfile?
  listings      CarListing[]
  messagesSent  Message[]    @relation("SentMessages")
  messagesReceived Message[] @relation("ReceivedMessages")
  subscriptions Subscription[]
  favorites     Favorite[]

  @@map("users")
}

model UserProfile {
  id                String   @id @default(uuid())
  userId            String   @unique @map("user_id")
  firstName         String?  @map("first_name")
  lastName          String?  @map("last_name")
  avatarUrl         String?  @map("avatar_url")
  about             String?
  address           String?
  city              String?
  state             String?
  businessName      String?  @map("business_name")
  businessLogoUrl   String?  @map("business_logo_url")
  verificationBadge Boolean  @default(false) @map("verification_badge")
  verificationDocs  String[] @map("verification_docs")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_profiles")
}

model CarListing {
  id            String        @id @default(uuid())
  sellerId      String        @map("seller_id")
  listingType   ListingType   @map("listing_type")
  make          String
  model         String
  year          Int
  trim          String?
  mileage       Int?
  transmission  String
  fuelType      String        @map("fuel_type")
  condition     Condition
  price         Decimal       @db.Decimal(12, 2)
  locationState String        @map("location_state")
  locationCity  String        @map("location_city")
  vinNumber     String?       @map("vin_number")
  description   String?
  status        ListingStatus @default(PENDING)
  isFeatured    Boolean       @default(false) @map("is_featured")
  isBoosted     Boolean       @default(false) @map("is_boosted")
  viewsCount    Int           @default(0) @map("views_count")
  favoritesCount Int          @default(0) @map("favorites_count")
  createdAt     DateTime      @default(now()) @map("created_at")
  updatedAt     DateTime      @updatedAt @map("updated_at")

  seller   User       @relation(fields: [sellerId], references: [id])
  media    Media[]
  messages Message[]
  favorites Favorite[]

  @@index([make, model])
  @@index([locationState])
  @@index([status])
  @@index([createdAt])
  @@map("car_listings")
}

model Media {
  id          String   @id @default(uuid())
  listingId   String   @map("listing_id")
  mediaType   String   @map("media_type")
  url         String
  thumbnailUrl String? @map("thumbnail_url")
  displayOrder Int     @map("display_order")
  fileSize    Int?     @map("file_size")
  createdAt   DateTime @default(now()) @map("created_at")

  listing CarListing @relation(fields: [listingId], references: [id], onDelete: Cascade)

  @@map("media")
}

model Message {
  id             String   @id @default(uuid())
  conversationId String   @map("conversation_id")
  senderId       String   @map("sender_id")
  receiverId     String   @map("receiver_id")
  listingId      String?  @map("listing_id")
  messageText    String   @map("message_text")
  isRead         Boolean  @default(false) @map("is_read")
  createdAt      DateTime @default(now()) @map("created_at")

  sender   User        @relation("SentMessages", fields: [senderId], references: [id])
  receiver User        @relation("ReceivedMessages", fields: [receiverId], references: [id])
  listing  CarListing? @relation(fields: [listingId], references: [id])

  @@index([conversationId])
  @@index([senderId])
  @@index([receiverId])
  @@map("messages")
}

model Subscription {
  id              String   @id @default(uuid())
  userId          String   @map("user_id")
  planType        String   @map("plan_type")
  startDate       DateTime @map("start_date")
  endDate         DateTime @map("end_date")
  isActive        Boolean  @default(true) @map("is_active")
  amountPaid      Decimal  @db.Decimal(10, 2) @map("amount_paid")
  paymentReference String  @map("payment_reference")
  createdAt       DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id])

  @@map("subscriptions")
}

model Favorite {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  listingId String   @map("listing_id")
  createdAt DateTime @default(now()) @map("created_at")

  user    User       @relation(fields: [userId], references: [id])
  listing CarListing @relation(fields: [listingId], references: [id], onDelete: Cascade)

  @@unique([userId, listingId])
  @@map("favorites")
}

model Verification {
  id               String   @id @default(uuid())
  userId           String   @map("user_id")
  verificationType String   @map("verification_type")
  code             String?
  expiresAt        DateTime? @map("expires_at")
  isVerified       Boolean  @default(false) @map("is_verified")
  createdAt        DateTime @default(now()) @map("created_at")

  @@map("verifications")
}
```

**Run migrations:**
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### Step 4: Create Basic Server Structure

**Create folder structure:**
```bash
mkdir -p src/{routes,controllers,middleware,services,utils,config}
touch src/index.js src/app.js
```

**`src/app.js`:**
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('dev'));

// Compression
app.use(compression());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes (to be added)
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/users', require('./routes/users'));
// app.use('/api/listings', require('./routes/listings'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error'
    }
  });
});

module.exports = app;
```

**`src/index.js`:**
```javascript
require('dotenv').config();
const app = require('./app');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle shutdown gracefully
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
```

**Update `package.json` scripts:**
```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "migrate": "npx prisma migrate dev",
    "studio": "npx prisma studio"
  }
}
```

**Run the server:**
```bash
npm run dev
```

You should see:
```
✅ Database connected
🚀 Server running on http://localhost:5000
```

---

## Phase 2: Authentication Implementation (Week 2)

### Step 1: Create Authentication Service

**`src/services/authService.js`:**
```javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class AuthService {
  async register({ email, phoneNumber, password, userType }) {
    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phoneNumber }]
      }
    });

    if (existingUser) {
      throw new Error('User with this email or phone number already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        phoneNumber,
        passwordHash,
        userType,
        profile: {
          create: {}
        }
      },
      include: {
        profile: true
      }
    });

    // Generate OTP (implement OTP service separately)
    // await this.sendOTP(user.id, phoneNumber);

    return user;
  }

  async login({ email, password }) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return { user, accessToken, refreshToken };
  }

  generateAccessToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
  }

  generateRefreshToken(user) {
    return jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );
  }

  verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }
}

module.exports = new AuthService();
```

### Step 2: Create Authentication Routes

**`src/routes/auth.js`:**
```javascript
const express = require('express');
const { body, validationResult } = require('express-validator');
const authService = require('../services/authService');

const router = express.Router();

// Register
router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('phoneNumber').isMobilePhone(),
    body('password').isLength({ min: 8 }),
    body('userType').isIn(['INDIVIDUAL_SELLER', 'DEALER', 'RENTAL_COMPANY', 'BUYER'])
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = await authService.register(req.body);
      res.status(201).json({
        message: 'Registration successful. Please verify your account.',
        user: {
          id: user.id,
          email: user.email,
          userType: user.userType
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// Login
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { user, accessToken, refreshToken } = await authService.login(req.body);

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          userType: user.userType,
          profile: user.profile
        },
        accessToken,
        refreshToken
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
```

**Add route to `src/app.js`:**
```javascript
app.use('/api/auth', require('./routes/auth'));
```

---

## Phase 3: Frontend Integration (Week 3)

### Step 1: Install Frontend Dependencies

```bash
cd naija-cars-app

# Install new dependencies
npm install react-router-dom axios react-hook-form zod @hookform/resolvers
npm install zustand @tanstack/react-query
npm install socket.io-client
```

### Step 2: Set Up API Service

**Create `src/services/api.js`:**
```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Implement token refresh logic
      // For now, redirect to login
      localStorage.removeItem('accessToken');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Step 3: Set Up React Router

**Update `src/main.jsx`:**
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
```

### Step 4: Create Basic Routes

**Update `src/App.jsx`:**
```javascript
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CarsPage from './pages/CarsPage';
import CarDetailsPage from './pages/CarDetailsPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/cars" element={<CarsPage />} />
      <Route path="/car/:id" element={<CarDetailsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  );
}

export default App;
```

---

## Next Steps

1. **Week 4:** Implement car listing CRUD operations
2. **Week 5:** Add media upload functionality
3. **Week 6:** Build messaging system
4. **Week 7:** Create user dashboard
5. **Week 8:** Implement payment integration

For detailed implementation of each phase, refer to `REDESIGN_PLAN.md`.

---

## Testing

```bash
# Backend tests
cd naija-cars-backend
npm test

# Frontend tests
cd naija-cars-app
npm test

# E2E tests
npm run test:e2e
```

---

## Deployment

See `ARCHITECTURE_DIAGRAM.md` for deployment architecture and CI/CD setup.

---

## Support

For questions or issues:
- Review `REDESIGN_PLAN.md` for comprehensive feature documentation
- Check `ARCHITECTURE_DIAGRAM.md` for system architecture
- Consult API documentation (once Swagger is set up)

Good luck with your implementation!
