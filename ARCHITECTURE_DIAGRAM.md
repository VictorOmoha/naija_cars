# NAIJA CARS - SYSTEM ARCHITECTURE

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐       │
│  │   Web App    │   │  iOS App     │   │ Android App  │       │
│  │  (React +    │   │ (React       │   │ (React       │       │
│  │   Vite)      │   │  Native)     │   │  Native)     │       │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘       │
│         │                   │                   │               │
│         └───────────────────┴───────────────────┘               │
│                             │                                   │
└─────────────────────────────┼───────────────────────────────────┘
                              │
                              │ HTTPS/WSS
                              │
┌─────────────────────────────┼───────────────────────────────────┐
│                        API GATEWAY / CDN                         │
│                    (Cloudflare / AWS CloudFront)                 │
└─────────────────────────────┼───────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        │                     │                     │
┌───────▼──────┐     ┌────────▼────────┐   ┌──────▼────────┐
│  REST API    │     │  WebSocket      │   │  Static       │
│  Server      │     │  Server         │   │  Assets CDN   │
│  (Express/   │     │  (Socket.io)    │   │               │
│   FastAPI)   │     │                 │   │               │
└───────┬──────┘     └────────┬────────┘   └───────────────┘
        │                     │
        │                     │
┌───────▼─────────────────────▼────────────────────────────────────┐
│                     APPLICATION LAYER                             │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐            │
│  │   Auth      │  │  Listings    │  │  Messaging  │            │
│  │   Service   │  │  Service     │  │  Service    │            │
│  └─────────────┘  └──────────────┘  └─────────────┘            │
│                                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐            │
│  │   Media     │  │  Payment     │  │  Search     │            │
│  │   Service   │  │  Service     │  │  Service    │            │
│  └─────────────┘  └──────────────┘  └─────────────┘            │
│                                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐            │
│  │   User      │  │  Admin       │  │  Analytics  │            │
│  │   Service   │  │  Service     │  │  Service    │            │
│  └─────────────┘  └──────────────┘  └─────────────┘            │
│                                                                   │
└───────────────────────────┬───────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼──────┐   ┌────────▼────────┐  ┌──────▼────────┐
│  PostgreSQL  │   │     Redis       │  │  Elasticsearch│
│  (Primary    │   │  (Cache +       │  │  (Search)     │
│   Database)  │   │   Sessions)     │  │  (Optional)   │
└──────────────┘   └─────────────────┘  └───────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼──────┐   ┌────────▼────────┐  ┌──────▼────────┐
│   AWS S3 /   │   │   Twilio        │  │  SendGrid /   │
│  Cloudinary  │   │  (SMS OTP)      │  │  Resend       │
│  (Media)     │   │                 │  │  (Email)      │
└──────────────┘   └─────────────────┘  └───────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼──────┐   ┌────────▼────────┐  ┌──────▼────────┐
│  Paystack /  │   │   Sentry        │  │  Google       │
│ Flutterwave  │   │  (Monitoring)   │  │  Analytics    │
│  (Payment)   │   │                 │  │               │
└──────────────┘   └─────────────────┘  └───────────────┘
```

---

## Data Flow Diagrams

### User Registration Flow

```
┌──────────┐
│  Client  │
└────┬─────┘
     │
     │ 1. POST /auth/register
     │    { email, phone, password, user_type }
     ▼
┌────────────┐
│   API      │
│  Server    │
└────┬───────┘
     │
     │ 2. Hash password
     │ 3. Create user record
     ▼
┌────────────┐
│ PostgreSQL │
└────┬───────┘
     │
     │ 4. Generate OTP code
     ▼
┌────────────┐
│   Redis    │ (Store OTP with 5-min expiry)
└────┬───────┘
     │
     │ 5. Send OTP
     ▼
┌────────────┐
│  Twilio /  │
│ SendGrid   │
└────┬───────┘
     │
     │ 6. Return success
     ▼
┌──────────┐
│  Client  │ (Show OTP verification screen)
└──────────┘
```

### Car Listing Creation Flow

```
┌──────────┐
│  Client  │
└────┬─────┘
     │
     │ 1. Upload images/videos
     ▼
┌────────────┐
│   API      │
│  Server    │
└────┬───────┘
     │
     │ 2. Compress & validate media
     │ 3. Upload to cloud storage
     ▼
┌────────────┐
│  S3 /      │
│ Cloudinary │
└────┬───────┘
     │
     │ 4. Return media URLs
     ▼
┌────────────┐
│   API      │ (Create listing with media URLs)
└────┬───────┘
     │
     │ 5. Create listing record
     ▼
┌────────────┐
│ PostgreSQL │
└────┬───────┘
     │
     │ 6. Index for search
     ▼
┌────────────┐
│Elasticsearch│
└────┬───────┘
     │
     │ 7. Return listing ID
     ▼
┌──────────┐
│  Client  │ (Show success + listing preview)
└──────────┘
```

### Real-Time Messaging Flow

```
┌──────────┐                    ┌──────────┐
│  Sender  │                    │ Receiver │
└────┬─────┘                    └────┬─────┘
     │                               │
     │ 1. Send message via WebSocket │
     ▼                               │
┌────────────┐                       │
│ Socket.io  │                       │
│  Server    │                       │
└────┬───────┘                       │
     │                               │
     │ 2. Save message               │
     ▼                               │
┌────────────┐                       │
│ PostgreSQL │                       │
└────┬───────┘                       │
     │                               │
     │ 3. Emit to receiver room      │
     ├───────────────────────────────►
     │                               │
     │                               ▼
     │                          ┌──────────┐
     │                          │ Receiver │
     │                          │ Client   │
     │                          └──────────┘
     │                          (Message appears)
     │
     │ 4. Send push notification
     ▼
┌────────────┐
│  Firebase  │
│    FCM     │
└────────────┘
```

---

## Database Entity-Relationship Diagram

```
┌─────────────────┐         ┌──────────────────┐
│     Users       │         │   UserProfiles   │
├─────────────────┤         ├──────────────────┤
│ id (PK)         │◄───────┤│ id (PK)          │
│ email           │ 1     1 │ user_id (FK)     │
│ phone_number    │         │ first_name       │
│ password_hash   │         │ last_name        │
│ user_type       │         │ avatar_url       │
│ is_verified     │         │ business_name    │
│ created_at      │         │ verification_doc │
└────────┬────────┘         └──────────────────┘
         │
         │ 1
         │
         │ N
         ▼
┌─────────────────┐         ┌──────────────────┐
│   CarListings   │         │      Media       │
├─────────────────┤         ├──────────────────┤
│ id (PK)         │────────►│ id (PK)          │
│ seller_id (FK)  │ 1     N │ listing_id (FK)  │
│ listing_type    │         │ media_type       │
│ make            │         │ url              │
│ model           │         │ thumbnail_url    │
│ year            │         │ display_order    │
│ price           │         └──────────────────┘
│ location_state  │
│ status          │
│ is_featured     │
└────────┬────────┘
         │
         │ 1
         │
         │ N
         ▼
┌─────────────────┐
│    Messages     │         ┌──────────────────┐
├─────────────────┤         │  Subscriptions   │
│ id (PK)         │         ├──────────────────┤
│ conversation_id │         │ id (PK)          │
│ sender_id (FK)  │         │ user_id (FK)     │
│ receiver_id (FK)│         │ plan_type        │
│ listing_id (FK) │         │ start_date       │
│ message_text    │         │ end_date         │
│ is_read         │         │ is_active        │
│ created_at      │         └──────────────────┘
└─────────────────┘                 ▲
                                    │
                                    │ N
                                    │
                                    │ 1
                                    │
                            ┌───────┴──────┐
                            │     Users     │
                            └───────────────┘
```

---

## Component Architecture (Frontend)

```
src/
├── pages/
│   ├── HomePage.jsx                 (Landing page)
│   ├── CarsPage.jsx                 (All cars for sale)
│   ├── RentalsPage.jsx              (All rental cars)
│   ├── CarDetailsPage.jsx           (Single car details)
│   ├── DealersPage.jsx              (Verified dealers)
│   ├── ProfilePage.jsx              (User profile)
│   ├── DashboardPage.jsx            (Dealer dashboard)
│   ├── MessagesPage.jsx             (Messaging inbox)
│   └── AdminPage.jsx                (Admin panel)
│
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── Sidebar.jsx
│   │   └── MobileNav.jsx
│   │
│   ├── auth/
│   │   ├── SignInModal.jsx
│   │   ├── RegisterForm.jsx
│   │   ├── OTPVerification.jsx
│   │   └── SocialLogin.jsx
│   │
│   ├── listings/
│   │   ├── CarCard.jsx
│   │   ├── CarGrid.jsx
│   │   ├── CarFilters.jsx
│   │   ├── ListCarForm.jsx
│   │   ├── MediaUploader.jsx
│   │   └── CarGallery.jsx
│   │
│   ├── messaging/
│   │   ├── ConversationList.jsx
│   │   ├── MessageThread.jsx
│   │   ├── MessageInput.jsx
│   │   └── QuickReplies.jsx
│   │
│   ├── dashboard/
│   │   ├── StatsCards.jsx
│   │   ├── InventoryTable.jsx
│   │   ├── SubscriptionCard.jsx
│   │   └── AnalyticsChart.jsx
│   │
│   ├── common/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Select.jsx
│   │   ├── Modal.jsx
│   │   ├── Toast.jsx
│   │   ├── Loader.jsx
│   │   └── Pagination.jsx
│   │
│   └── modals/
│       ├── QuickViewModal.jsx
│       ├── ContactSellerModal.jsx
│       └── ReportListingModal.jsx
│
├── hooks/
│   ├── useAuth.js
│   ├── useListings.js
│   ├── useMessages.js
│   ├── useMediaUpload.js
│   └── useWebSocket.js
│
├── context/
│   ├── AuthContext.jsx
│   ├── AppContext.jsx
│   └── SocketContext.jsx
│
├── services/
│   ├── api.js                       (Axios instance)
│   ├── authService.js
│   ├── listingService.js
│   ├── messageService.js
│   ├── paymentService.js
│   └── uploadService.js
│
├── utils/
│   ├── validation.js
│   ├── formatters.js
│   ├── constants.js
│   └── helpers.js
│
└── styles/
    ├── index.css
    └── tailwind.config.js
```

---

## API Routes Structure

### Authentication Routes
```
POST   /api/auth/register               - Register new user
POST   /api/auth/verify-otp             - Verify OTP
POST   /api/auth/login                  - Login
POST   /api/auth/logout                 - Logout
POST   /api/auth/refresh-token          - Refresh JWT
POST   /api/auth/forgot-password        - Request password reset
POST   /api/auth/reset-password         - Reset password
GET    /api/auth/google                 - Google OAuth
GET    /api/auth/apple                  - Apple OAuth
```

### User Routes
```
GET    /api/users/me                    - Get current user
PUT    /api/users/me                    - Update profile
POST   /api/users/me/avatar             - Upload avatar
GET    /api/users/:id                   - Get user by ID
GET    /api/users/:id/listings          - Get user's listings
```

### Listing Routes
```
GET    /api/listings                    - Get all listings (with filters)
GET    /api/listings/:id                - Get single listing
POST   /api/listings                    - Create listing
PUT    /api/listings/:id                - Update listing
DELETE /api/listings/:id                - Delete listing
POST   /api/listings/bulk               - Bulk upload (dealers)
POST   /api/listings/:id/boost          - Boost listing
POST   /api/listings/:id/feature        - Feature listing
POST   /api/listings/:id/view           - Increment view count
```

### Media Routes
```
POST   /api/media/upload                - Upload media
DELETE /api/media/:id                   - Delete media
POST   /api/media/reorder               - Reorder media
```

### Messaging Routes
```
GET    /api/messages/conversations      - Get all conversations
GET    /api/messages/:conversationId    - Get messages
POST   /api/messages                    - Send message
PUT    /api/messages/:id/read           - Mark as read
GET    /api/messages/templates          - Get quick reply templates
```

### Search Routes
```
GET    /api/search                      - Search listings
POST   /api/search/save                 - Save search
GET    /api/search/saved                - Get saved searches
DELETE /api/search/:id                  - Delete saved search
```

### Payment Routes
```
GET    /api/payments/plans              - Get subscription plans
POST   /api/payments/subscribe          - Create subscription
POST   /api/payments/verify             - Verify payment
GET    /api/payments/history            - Payment history
POST   /api/payments/webhook            - Paystack webhook
```

### Admin Routes
```
GET    /api/admin/stats                 - Platform statistics
GET    /api/admin/listings              - Get all listings
PUT    /api/admin/listings/:id/approve  - Approve listing
PUT    /api/admin/listings/:id/reject   - Reject listing
GET    /api/admin/users                 - Get all users
PUT    /api/admin/users/:id/verify      - Verify dealer
PUT    /api/admin/users/:id/ban         - Ban user
GET    /api/admin/verifications         - Pending verifications
```

---

## Security Architecture

### Authentication & Authorization
```
┌──────────────────────────────────────────────────┐
│          Authentication Flow                     │
├──────────────────────────────────────────────────┤
│                                                  │
│  1. User login → API validates credentials      │
│  2. API generates JWT (access + refresh)        │
│  3. Access token: 15 min expiry                 │
│  4. Refresh token: 7 days expiry (HTTP-only)    │
│  5. Client stores access token (memory)         │
│  6. Client stores refresh token (HTTP-only)     │
│  7. Middleware validates JWT on protected routes│
│  8. Auto-refresh when access token expires      │
│                                                  │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│          Authorization Levels                    │
├──────────────────────────────────────────────────┤
│                                                  │
│  • Guest (unauthenticated)                      │
│    - Browse listings, search, view details      │
│                                                  │
│  • Buyer (authenticated)                        │
│    - Save favorites, send messages              │
│                                                  │
│  • Seller (authenticated)                       │
│    - Create listings, manage own listings       │
│                                                  │
│  • Dealer/Rental Company (verified)             │
│    - Bulk upload, dashboard, subscriptions      │
│                                                  │
│  • Admin (special role)                         │
│    - All permissions + moderation               │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Data Protection
- Passwords: bcrypt hashing (10 rounds)
- JWT: RS256 signing algorithm
- Database: Encrypted at rest (AWS RDS encryption)
- File uploads: Virus scanning, type validation
- API: Rate limiting (100 req/min per IP)
- CORS: Whitelist specific domains
- HTTPS: Enforced on all endpoints

---

## Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────────────┐
│              Cloudflare CDN                     │
│         (DDoS protection, caching)              │
└────────────────┬────────────────────────────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
┌───▼────────┐        ┌───────▼─────┐
│  Frontend  │        │   Backend   │
│  (Vercel)  │        │  (Railway/  │
│            │        │   AWS EC2)  │
└────────────┘        └───────┬─────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
        ┌───────▼────┐  ┌─────▼────┐  ┌────▼─────┐
        │ PostgreSQL │  │  Redis   │  │   S3     │
        │   (AWS     │  │ (AWS     │  │  (AWS)   │
        │    RDS)    │  │ ElastiC) │  │          │
        └────────────┘  └──────────┘  └──────────┘
```

### CI/CD Pipeline

```
Developer Push → GitHub
                   │
                   ▼
            GitHub Actions
                   │
        ┌──────────┼──────────┐
        │                     │
    ┌───▼────┐          ┌─────▼─────┐
    │  Lint  │          │   Build   │
    │  Test  │          │           │
    └───┬────┘          └─────┬─────┘
        │                     │
        └──────────┬──────────┘
                   │
            ┌──────▼──────┐
            │   Deploy    │
            │  (Staging)  │
            └──────┬──────┘
                   │
          Manual Approval
                   │
            ┌──────▼──────┐
            │   Deploy    │
            │ (Production)│
            └─────────────┘
```

---

## Performance Optimization Strategy

### Frontend Optimization
- Code splitting (React.lazy + Suspense)
- Image lazy loading (Intersection Observer)
- Virtual scrolling for long lists
- Service Worker for offline caching
- Bundle size analysis (webpack-bundle-analyzer)
- WebP images with fallback

### Backend Optimization
- Database connection pooling
- Query optimization (indexes, EXPLAIN)
- Redis caching (hot data, sessions)
- Response compression (gzip)
- Database read replicas
- N+1 query prevention

### CDN Strategy
- Static assets on CDN (images, CSS, JS)
- Edge caching for API responses
- Geo-distribution for low latency
- Cache invalidation strategy

---

## Monitoring & Alerting

### Metrics to Track
- API response time (p50, p95, p99)
- Error rate (4xx, 5xx)
- Database query performance
- CPU/Memory usage
- User sign-ups per day
- Messages sent per day
- Listings created per day
- Payment success rate

### Alerting Rules
- API response time > 2 seconds
- Error rate > 1%
- Database connections > 80%
- CPU usage > 80%
- Payment failures > 5%

### Tools
- **Application Monitoring:** Sentry (errors), DataDog (APM)
- **Infrastructure:** AWS CloudWatch, Grafana
- **Uptime:** UptimeRobot, Pingdom
- **Analytics:** Google Analytics, Mixpanel

---

## Scalability Considerations

### Horizontal Scaling
- Load balancer (AWS ALB, Nginx)
- Multiple API server instances
- Session management with Redis
- Stateless API design

### Database Scaling
- Read replicas for read-heavy operations
- Database sharding (by location/state)
- Connection pooling (PgBouncer)
- Query caching

### File Storage Scaling
- CDN for image delivery
- Multi-region S3 buckets
- Image compression pipeline
- Lazy loading strategy

---

This architecture is designed for:
- **Scalability:** Can handle 10,000+ concurrent users
- **Reliability:** 99.9% uptime target
- **Security:** Industry-standard practices
- **Performance:** <2 second page load time
- **Maintainability:** Clean separation of concerns
- **Cost-Efficiency:** Optimized resource usage
