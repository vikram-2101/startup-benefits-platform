# Startup Benefits & Partnerships Platform

## 🎯 Overview

An enterprise-grade full-stack platform that enables startup founders and early-stage teams to browse and claim exclusive SaaS deals. Built with a focus on security, scalability, maintainability, and premium UX with rich animations.

## 📋 Table of Contents

- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Authentication & Authorization](#authentication--authorization)
- [Claim Flow](#claim-flow)
- [API Design](#api-design)
- [Frontend Architecture](#frontend-architecture)
- [Setup Instructions](#setup-instructions)
- [Known Limitations](#known-limitations)
- [Production Improvements](#production-improvements)

---

## 🏗 Architecture

### Backend: Layered Architecture

```
Routes → Middleware → Controllers → Services → Models
```

**Strict Separation of Concerns:**

- **Routes**: Define endpoints and attach middleware only
- **Middleware**: Authentication, validation, rate limiting, error handling
- **Controllers**: Handle HTTP request/response, no business logic
- **Services**: All business logic, eligibility checks, data transformation
- **Models**: Mongoose schemas, indexes, instance methods

This architecture ensures:

- High testability
- Low coupling
- Easy to scale horizontally
- Clear separation of concerns

### Frontend: Next.js App Router

```
Pages (Server Components) → API Layer → React Query → API Client
```

- **Server Components** for initial data fetching
- **Client Components** for interactivity
- **TanStack Query** for caching, refetching, and state management
- **Framer Motion** for animations

---

## 💻 Technology Stack

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (Access + Refresh tokens)
- **Validation**: Zod
- **Security**: helmet, cors, express-rate-limit, express-mongo-sanitize
- **Logging**: Pino

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios

---

## 📁 Project Structure

```
startup-benefits-platform/
├── backend/
│   └── src/
│       ├── config/              # Configuration and database connection
│       ├── controllers/         # Request/response handlers
│       ├── middleware/          # Auth, validation, error handling
│       ├── models/              # Mongoose schemas
│       ├── routes/              # API route definitions
│       ├── services/            # Business logic layer
│       ├── utils/               # Utilities, logger, error classes
│       ├── validators/          # Zod schemas
│       ├── scripts/             # Seed scripts
│       ├── app.js               # Express app setup
│       └── server.js            # Server entry point
│
└── frontend/
    └── src/
        ├── app/                 # Next.js pages (App Router)
        ├── components/          # Reusable components
        ├── lib/
        │   ├── api/             # API client and endpoints
        │   └── hooks/           # React Query hooks
        ├── types/               # TypeScript types
        └── utils/               # Utility functions
```

---

## 🔐 Authentication & Authorization

### Token Strategy

**Dual-Token System with Rotation:**

1. **Access Token**
   - Short-lived (15 minutes)
   - Stored in memory (localStorage)
   - Used for API authentication
   - Sent in Authorization header

2. **Refresh Token**
   - Long-lived (7 days)
   - Stored as httpOnly cookie
   - Used to obtain new access tokens
   - Rotated on each use (security best practice)

### Authentication Flow

```
1. User registers/logs in
   ↓
2. Server generates access + refresh tokens
   ↓
3. Refresh token hashed and stored in DB
   ↓
4. Access token sent in response body
   ↓
5. Refresh token sent as httpOnly cookie
   ↓
6. Frontend stores access token in localStorage
   ↓
7. All protected requests include access token in header
   ↓
8. When access token expires (401 response):
   - Frontend automatically calls /auth/refresh
   - Server validates refresh token from cookie
   - Server rotates tokens (removes old, adds new)
   - Frontend receives new access token
   - Original request retried with new token
```

### Authorization Logic

**Role-Based Access Control (RBAC):**

- `user`: Can browse deals, claim eligible deals, view own claims
- `admin`: All user permissions + manage deals, view all claims

**Deal-Specific Authorization:**

```javascript
// In claimService.js
async checkEligibility(userId, dealId) {
  // 1. Verify deal exists and not expired
  const deal = await Deal.findById(dealId);
  if (!deal || deal.isExpired()) throw error;

  // 2. If locked, verify user is verified
  if (deal.isLocked) {
    const user = await User.findById(userId);
    if (!user.isVerified) throw 403 error;
  }

  // 3. Prevent duplicate claims
  const existingClaim = await Claim.findOne({ userId, dealId });
  if (existingClaim) throw 409 error;

  return true;
}
```

**Key Security Features:**

- Password hashing with bcrypt (12 rounds)
- Refresh tokens hashed before storage
- Token rotation prevents replay attacks
- Rate limiting (100 requests/15 min)
- MongoDB query sanitization
- Helmet for security headers
- CORS with strict origin control

---

## 🎯 Claim Flow

### State Machine

```
Idle → Pending → Verifying → Success/Error
```

### End-to-End Flow

**Frontend (User clicks "Claim Deal"):**

```typescript
1. Button click triggers createClaim mutation
2. Loading state activated (button disabled)
3. Request sent to POST /api/claims
```

**Backend (Claim Creation):**

```javascript
// Route: routes/claimRoutes.js
POST /claims → authenticate middleware → validate middleware → controller

// Controller: controllers/claimController.js
createClaim() {
  // Extract dealId from body, userId from req.user
  // Delegate to service
  const claim = await claimService.createClaim(userId, dealId);
}

// Service: services/claimService.js
createClaim(userId, dealId) {
  // 1. Check eligibility (deal exists, not expired, user verified if locked, no duplicate)
  await this.checkEligibility(userId, dealId);

  // 2. Create claim with status 'pending'
  const claim = await Claim.create({ userId, dealId, status: 'pending' });

  // 3. Increment deal claim count
  await dealService.incrementClaimCount(dealId);

  // 4. Populate and return claim
  return populatedClaim;
}
```

**Frontend (Response Handling):**

```typescript
4. Success: Show success toast, invalidate queries, update UI
5. Error: Show error message with specific reason
```

### Eligibility Rules

| Condition                 | Check                                | Error if Fails              |
| ------------------------- | ------------------------------------ | --------------------------- |
| Deal exists               | `Deal.findById(dealId)`              | 404 "Deal not found"        |
| Not expired               | `deal.expiresAt < Date.now()`        | 410 "Deal expired"          |
| User verified (if locked) | `user.isVerified === true`           | 403 "Verification required" |
| No duplicate claim        | `!Claim.findOne({ userId, dealId })` | 409 "Already claimed"       |

---

## 🌐 API Design

### REST API Principles

- **Stateless**: No session storage, JWT-based
- **Resource-oriented**: `/deals`, `/claims`, `/auth`
- **HTTP verbs**: GET (read), POST (create), PATCH (update), DELETE (remove)
- **Status codes**: 200 (success), 201 (created), 400 (validation), 401 (auth), 403 (forbidden), 404 (not found), 409 (conflict), 500 (server error)

### Standardized Responses

**Success Response:**

```json
{
  "success": true,
  "message": "Deal claimed successfully",
  "data": {
    "claim": { ... }
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "Invalid email format" }]
}
```

### API Endpoints

#### Authentication

```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - Login user
POST   /api/auth/refresh     - Refresh access token
POST   /api/auth/logout      - Logout user
GET    /api/auth/me          - Get current user (protected)
```

#### Deals

```
GET    /api/deals            - Get all deals (public, paginated, filterable)
GET    /api/deals/:id        - Get single deal (public)
POST   /api/deals            - Create deal (admin only)
PUT    /api/deals/:id        - Update deal (admin only)
DELETE /api/deals/:id        - Delete deal (admin only)
```

#### Claims

```
POST   /api/claims           - Create claim (protected, verified if locked)
GET    /api/claims/me        - Get user's claims (protected, paginated)
GET    /api/claims/:id       - Get single claim (protected, own claims only)
GET    /api/claims           - Get all claims (admin only)
PATCH  /api/claims/:id/status - Update claim status (admin only)
```

---

## 🎨 Frontend Architecture

### Data Flow

```
1. User navigates to /deals
   ↓
2. Server Component fetches initial deals
   ↓
3. Client Component renders with TanStack Query
   ↓
4. User filters/searches → Query params update → Automatic refetch
   ↓
5. User claims deal → Mutation → Optimistic UI update
   ↓
6. Background refetch keeps data fresh
```

### State Management Strategy

- **Server State**: TanStack Query (API data, caching)
- **Auth State**: TanStack Query + localStorage (access token)
- **UI State**: React useState (modals, forms)
- **URL State**: Next.js router (filters, pagination)

### Animation Strategy

**Performance-First Approach:**

- **Framer Motion** for page transitions and complex animations
- **Tailwind animations** for simple hover effects
- **Skeleton screens** instead of spinners
- **Staggered animations** for lists (children animate in sequence)
- **Layout animations** for smooth transitions

**Example: Deal Card Animation**

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
  whileHover={{ scale: 1.02 }}
>
  {/* Card content */}
</motion.div>
```

---

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- MongoDB 6+
- Git

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your MongoDB URI and secrets

# Seed sample deals
npm run seed

# Start development server
npm run dev

# Server runs on http://localhost:5000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.local.example .env.local

# Start development server
npm run dev

# App runs on http://localhost:3000
```

### Testing the Application

1. **Register a user** at `/register`
2. **Browse deals** at `/deals`
3. **Claim an unlocked deal** (should succeed)
4. **Try claiming a locked deal** (should fail with 403)
5. **Go to dashboard** at `/dashboard` to view claims

### Creating a Verified User

Currently, users are not verified by default. To test locked deals:

```javascript
// Connect to MongoDB and run:
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { isVerified: true } },
);
```

---

## ⚠️ Known Limitations

### Backend

1. **Email Verification Not Implemented**
   - Users can't verify accounts automatically
   - No email service integration (SendGrid, SES)
   - Manual DB update required for testing

2. **No Password Reset Flow**
   - Users can't reset forgotten passwords
   - Would require email service + token management

3. **Basic Rate Limiting**
   - In-memory rate limiting (not distributed)
   - Resets on server restart
   - No Redis integration

4. **No File Upload for Partner Logos**
   - `partnerLogo` field exists but unused
   - Would require S3/CloudFront integration

5. **No Admin Dashboard**
   - Admin routes exist but no UI
   - Claim approval must be done via API/DB

6. **No Pagination on Frontend**
   - Backend supports it, frontend shows all results
   - Could cause performance issues with many deals

### Frontend

1. **No Loading Skeletons on All Pages**
   - Some pages show spinners instead of skeletons
   - Inconsistent loading experience

2. **No Error Boundaries**
   - Unhandled errors could crash the app
   - Need component-level error handling

3. **No Toast Notifications**
   - Success/error feedback is basic
   - Could use react-hot-toast or sonner

4. **No 3D Elements**
   - Requirement was optional, not implemented
   - Could add Three.js hero section

5. **No SEO Optimization**
   - Missing meta tags, OpenGraph
   - No sitemap or robots.txt

6. **No Tests**
   - No unit, integration, or E2E tests
   - Would use Jest, React Testing Library, Playwright

---

## 🎯 Production Improvements

### High Priority

1. **Redis for Token Storage**
   - Move refresh tokens to Redis
   - Implement distributed rate limiting
   - Add caching layer for deals

2. **Email Service Integration**
   - SendGrid/AWS SES for transactional emails
   - Email verification flow
   - Password reset functionality

3. **Monitoring & Logging**
   - Sentry for error tracking
   - DataDog/New Relic for APM
   - Structured logging to ELK stack

4. **CI/CD Pipeline**
   - GitHub Actions for testing
   - Automated deployments to staging/production
   - Database migration scripts

5. **Comprehensive Testing**
   - Unit tests (Jest): Services, utilities
   - Integration tests (Supertest): API endpoints
   - E2E tests (Playwright): Critical user flows

### Medium Priority

6. **Admin Dashboard**
   - Manage deals (CRUD)
   - Review and approve/reject claims
   - View analytics

7. **File Upload Service**
   - S3 for partner logos
   - Image optimization (Sharp, Cloudinary)
   - CDN for static assets

8. **Search Improvements**
   - Elasticsearch for full-text search
   - Search suggestions (autocomplete)
   - Fuzzy matching

9. **Performance Optimization**
   - Database query optimization
   - API response compression
   - Frontend code splitting
   - Image lazy loading

10. **Security Enhancements**
    - CAPTCHA on registration/login
    - 2FA for admins
    - Security audit (penetration testing)
    - OWASP Top 10 compliance

### Low Priority

11. **Advanced Features**
    - Deal recommendations (ML-based)
    - User preferences and favorites
    - Notification system (email, in-app)
    - Deal expiry reminders

12. **Analytics**
    - Google Analytics / Mixpanel
    - Track user behavior
    - A/B testing framework

13. **Internationalization**
    - Multi-language support (i18n)
    - Currency localization
    - Regional deals

---

## 🎨 UI & Performance Considerations

### Animation Performance

- All animations use `transform` and `opacity` (GPU-accelerated)
- Debounced search input to reduce API calls
- Lazy loading for images and components
- Virtualized lists for large datasets (react-window)

### Accessibility

- Semantic HTML elements
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus management in modals

### Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly tap targets (44x44px minimum)

---

## 📊 Data Modeling

### Indexes

**User:**

- `email` (unique)
- `refreshTokens.token` (for quick lookup)

**Deal:**

- `category` (filter queries)
- `isLocked` (filter queries)
- `{ category: 1, isLocked: 1 }` (compound index for common queries)
- `expiresAt` (TTL index for automatic deletion)

**Claim:**

- `userId` (user's claims)
- `dealId` (deal's claims)
- `{ userId: 1, dealId: 1 }` (unique compound, prevents duplicates)
- `{ userId: 1, status: 1 }` (filter user's claims by status)

---

## 🔧 Environment Variables

### Backend (.env)

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/startup-benefits
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 📝 License

MIT

---

## 👤 Author

Built as an enterprise-grade demonstration of full-stack development with:

- Clean architecture
- Production-ready patterns
- Comprehensive security
- Rich user experience
