# SIVILIZE-HUB PRO Backend Architecture Analysis

**Analysis Date**: April 2, 2026  
**Framework**: Express.js + Node.js  
**Database**: Mock Storage (JSON file-based)  
**Total Backend Source Code**: ~741 lines  

---

## 📋 Executive Summary

The SIVILIZE-HUB PRO backend is a construction project management system built with Express.js. It features user authentication, project management, AHSP (Analysis of Standard and Specifications), RAB (Budget Planning) calculations, material management, daily logging, and export capabilities. 

**Critical Finding**: The system uses **Mongoose models** (MongoDB-ready schemas) but **actual database is disabled**. All data is stored in a single `localDb.json` file using a custom mock storage layer, which severely limits scalability and introduces data persistence risks.

---

## 1️⃣ Server Structure & Entry Point

### [server/index.js](server/index.js) - **~70 lines**

**Purpose**: Express application bootstrap and route initialization

**What it does**:
- Initializes Express server with middleware (CORS, JSON body parser)
- Configures static file serving for uploads
- Loads 7 API route modules
- Sets up global error handling middleware
- Implements uncaught exception and unhandled rejection handlers
- Listens on configurable PORT (default: 5000)

**Key Configuration**:
```javascript
- Express JSON parsing enabled
- CORS enabled (no origin restrictions - security concern)
- Static uploads folder accessible at /uploads/*
- Error handler returns stack trace in development mode
```

**Notable Issues**:
1. **CORS is unrestricted** - `cors()` with no configuration allows any origin
2. **Process keepalive loop** - `setInterval(() => {}, 10000)` seems unnecessary
3. **Verbose console logging** - Each route logs loading confirmation (noise in production)
4. **No request/response logging** - Missing request ID tracking or correlation IDs
5. **Error handler is basic** - No error classification (validation errors vs. system errors)

**Dependencies**: express, cors, dotenv

---

## 2️⃣ Controllers - Business Logic Layer

### [server/controllers/auth.js](server/controllers/auth.js) - **83 lines**

**Purpose**: User authentication and authorization

**Endpoints**:
| Method | Route | Access | Function |
|--------|-------|--------|----------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login user |
| GET | `/api/auth/me` | Protected | Get current user |

**Implementation Details**:
- Uses `bcryptjs` for password hashing (salt rounds: 10)
- JWT tokens valid for 30 days
- Simple email + password validation
- `sendTokenResponse()` helper generates JWT and returns user data

**Issues**:
1. ❌ **No input validation** - Only checks for existence, not format (email regex not enforced)
2. ❌ **No rate limiting** - No protection against brute force attacks
3. ❌ **JWT secret from env variable** - If exposed, all tokens compromised
4. ❌ **Password returned in token** - Not necessary, only ID should be used
5. ❌ **No account lockout** - Failed login attempts not tracked
6. ⚠️ **Mock storage** - Passwords stored in plain JSON file, not encrypted at rest

---

### [server/controllers/projects.js](server/controllers/projects.js) - **127 lines**

**Purpose**: Project CRUD operations and version management

**Endpoints**:
| Method | Route | Protected | Admin-only |
|--------|-------|-----------|-----------|
| GET | `/api/projects` | ✓ | Role-based |
| GET | `/api/projects/:id` | ✓ | ✓ |
| POST | `/api/projects` | ✓ | ✗ |
| PUT | `/api/projects/:id` | ✓ | ✓ |
| DELETE | `/api/projects/:id` | ✓ | ✓ |
| POST | `/api/projects/:id/versions` | ✓ | ✓ |

**Key Features**:
- Admin users see all projects; regular users see only their own
- Version tracking system (stores project snapshots with timestamps)
- Project dimensions support (length, width, height)
- Financial settings per version (overhead, profit, tax, contingency)

**Issues**:
1. ❌ **No input validation** - Accepts any data structure
2. ❌ **No pagination** - All projects loaded into memory (`find()` returns all)
3. ⚠️ **Authorization is rudimentary** - String comparison with user ID and role
4. ⚠️ **Soft delete missing** - No archival, hard delete only
5. ⚠️ **Version cascading** - No cascading delete when project removed
6. ❌ **No project status enforcement** - Can modify "completed" projects

---

### [server/controllers/materials.js](server/controllers/materials.js) - **48 lines**

**Purpose**: Material management for project items

**Endpoints**:
| Method | Route | Protected | Admin-only |
|--------|-------|-----------|-----------|
| GET | `/api/materials` | ✓ | ✗ |
| POST | `/api/materials` | ✓ | ✓ |
| PUT | `/api/materials/:id` | ✓ | ✓ |

**Key Features**:
- Global material database (shared across all projects)
- Regional pricing support (location-based prices)
- Material categories: 'Material' and 'Upah' (labor)

**Issues**:
1. ❌ **No delete endpoint** - Materials cannot be removed
2. ❌ **No filtering/searching** - All materials returned together
3. ⚠️ **Unique constraint not enforced** - Mock storage can't enforce uniqueness
4. ❌ **No unit validation** - Material units not validated against standard units
5. ⚠️ **Regional pricing not integrated** - Frontend must select price manually

---

### [server/controllers/ahsp.js](server/controllers/ahsp.js) - **84 lines**

**Purpose**: AHSP (Analysis of Standard and Specifications) management

**Endpoints**:
| Method | Route | Protected | Authorized |
|--------|-------|-----------|-----------|
| GET | `/api/ahsp` | ✓ | All users |
| GET | `/api/ahsp/:id` | ✓ | All users |
| POST | `/api/ahsp` | ✓ | admin, user |
| PUT | `/api/ahsp/:id` | ✓ | admin, user |
| DELETE | `/api/ahsp/:id` | ✓ | admin only |

**Key Features**:
- AHSP standards for construction items (Struktur, Arsitektur, Finishing, MEP)
- Material coefficients (how much material needed per unit)
- Labor coefficients (worker requirements)
- Productivity metrics (units completed per day)

**Issues**:
1. ❌ **No categorization filtering** - Can't search by category efficiently
2. ❌ **No productivity validation** - Values not checked (negative values possible)
3. ⚠️ **Duplicate prevention missing** - AHSP with same ID can be created multiple times
4. ⚠️ **No audit trail** - `createdBy` tracked but no update history
5. ❌ **No reference counting** - Deleting AHSP doesn't check if used in projects

---

### [server/controllers/calculation.js](server/controllers/calculation.js) - **20 lines**

**Purpose**: RAB (Budget) calculation engine

**Endpoint**:
| Method | Route | Input |
|--------|-------|-------|
| POST | `/api/calculate-rab` | items[], settings{}, dimensions[] |

**What it does**:
1. Calculates volume from dimensions (L × W × H)
2. Computes subtotal from item totals
3. Applies percentage-based calculations:
   - Overhead (default 5%)
   - Profit (default 10%)
   - Contingency (default 0%, optional)
   - Tax (default 11%)

**Formula**:
```
Subtotal = SUM(items[].total)
Overhead = Subtotal × overhead%
Profit = Subtotal × profit%
Contingency = Subtotal × contingency%
Total Before Tax = Subtotal + Overhead + Profit + Contingency
Tax = Total Before Tax × tax%
Grand Total = Total Before Tax + Tax
```

**Issues**:
1. ❌ **No input validation** - Missing items array not checked
2. ⚠️ **Stateless calculation** - No audit trail of calculations
3. ⚠️ **Hardcoded defaults** - Settings defaults not adjustable per-project type
4. ❌ **No negative value protection** - User can pass negative percentages
5. ⚠️ **Calculation not saved** - Results not persisted for historical reference

---

### [server/controllers/logs.js](server/controllers/logs.js) - **45 lines**

**Purpose**: Daily project logging with photo attachments

**Endpoints**:
| Method | Route | Features |
|--------|-------|----------|
| GET | `/api/logs/:projectId` | Retrieve project logs |
| POST | `/api/logs` | Create log with 5-photo max |

**Key Features**:
- Multer configuration for file uploads (destination: `uploads/`)
- Photo storage as URLs in the database
- Status tracking: Normal, Warning, Kendala (issue)
- Timestamp for each log entry

**Issues**:
1. ⚠️ **File system dependency** - Photos stored in local `uploads/` folder
2. ❌ **No file validation** - No checks for file type, size, or name sanitization
3. ⚠️ **File not readable after upload** - No permission verification
4. ❌ **No orphaned file cleanup** - Deleted logs leave photo files behind
5. ⚠️ **No metadata** - Photo filename obscured, can't retrieve original name
6. ❌ **Path traversal vulnerability** - No sanitization of uploaded filenames

---

### [server/controllers/export.js](server/controllers/export.js) - **34 lines**

**Purpose**: Export project RAB to PDF and Excel formats

**Endpoints**:
| Method | Route | Output Format |
|--------|-------|----------------|
| POST | `/api/export/pdf` | PDF file (attachment) |
| POST | `/api/export/excel` | XLSX file (attachment) |

**Key Features**:
- PDF generation via PDFKit
- Excel generation via ExcelJS
- Direct file streaming to response
- Filename includes project name

**Issues**:
1. ⚠️ **Memory inefficient** - Entire document built in memory before streaming
2. ❌ **No validation** - Accepts any project/items structure
3. ⚠️ **Limited formatting** - PDF layout is very basic, no styling
4. ❌ **No error recovery** - If generation fails mid-stream, response corrupted
5. ⚠️ **Filename injection risk** - Project name not sanitized for filename
6. ❌ **No file size limits** - Could generate massive documents

---

## 3️⃣ Routes - API Endpoint Structure

### Route Organization

| Route File | Endpoints | Protected | Lines |
|------------|-----------|-----------|-------|
| [auth.js](server/routes/auth.js) | 3 | Partial | 8 |
| [projects.js](server/routes/projects.js) | 6 | All | 22 |
| [materials.js](server/routes/materials.js) | 3 | All | 15 |
| [ahsp.js](server/routes/ahsp.js) | 5 | All | 19 |
| [logs.js](server/routes/logs.js) | 2 | All | 14 |
| [calculation.js](server/routes/calculation.js) | 1 | All | 6 |
| [export.js](server/routes/export.js) | 2 | All | 8 |

**Total API Endpoints**: 22

**Authentication Pattern**:
- Public routes: `/register`, `/login`
- Protected routes: All others require JWT Bearer token
- Authorization: Role-based checks on protected operations

**Issues**:
1. ⚠️ **No API versioning** - All routes at `/api/*` without version prefix
2. ⚠️ **No request validation middleware** - Each controller validates independently
3. ❌ **No pagination support** - No `?limit=10&page=2` pattern
4. ❌ **No filtering/sorting** - No query parameter support for GET requests
5. ⚠️ **No content negotiation** - Only JSON responses, no XML/CSV options
6. ⚠️ **No rate limiting** - No protection against API abuse

---

## 4️⃣ Models - Data Schema Definitions

### Model Overview

| Model | Purpose | Collections | Status |
|-------|---------|-------------|--------|
| [User.js](server/models/User.js) | User authentication | users | *Unused* |
| [Project.js](server/models/Project.js) | Project with RAB items | projects | *Unused* |
| [Material.js](server/models/Material.js) | Material pricing database | materials | *Unused* |
| [AHSP.js](server/models/AHSP.js) | Standard specs for items | ahsp | *Unused* |
| [DailyLog.js](server/models/DailyLog.js) | Project daily logs | logs | *Unused* |

**All models are Mongoose schemas but NOT enforced at runtime.** They exist for reference but actual mock storage uses undefined schema.

### User Model (✗ Unused)
```javascript
Fields: name, email, role (enum), password, createdAt
Validation: Email regex pattern, password minlength
Hooks: Pre-save password encryption via bcrypt
Methods: matchPassword() for login
```
**Issue**: Password hashing happens in auth controller, not via model hooks

### Project Model (✗ Unused)
```javascript
Fields: user (ref), name, location, type (enum), floors, dimensions[], status (enum)
Nested: VersionSchema with RAB items, financial settings, summary
Sub-schema: RABItemSchema with materials and labor breakdown
```
**Issues**: 
- Version history structure not used in mock storage
- Dimensions stored as array but not utilized

### Material Model (✗ Unused)
```javascript
Fields: name (unique), unit, category (enum), prices (regional array)
Index: Regional pricing with location and price
```
**Issue**: Unique constraint can't be enforced on JSON storage

### AHSP Model (✗ Unused)
```javascript
Fields: id (unique), category, name, unit, materials[], laborCoefficients[], productivity
Relationships: createdBy (user ref), timestamps
```
**Issue**: ID field used instead of MongoDB _id

### DailyLog Model (✗ Unused)
```javascript
Fields: project (ref), user (ref), date, text, photos[], status (enum), createdAt
```
**Issue**: No relationship validation

---

## 5️⃣ Middleware - Request Processing

### [server/middleware/auth.js](server/middleware/auth.js) - **50 lines**

**Purpose**: Authentication and authorization enforcement

#### `protect` Middleware
**Flow**:
1. Extract Bearer token from `Authorization` header
2. Verify JWT signature using `JWT_SECRET`
3. Look up user from mock storage by decoded ID
4. Attach user object to `req.user`

**Issues**:
1. ❌ **Hardcoded error structure** - Inconsistent with global error handler
2. ⚠️ **No token refresh** - Expired tokens force re-login (no refresh tokens)
3. ⚠️ **No token blacklist** - Logout doesn't invalidate tokens
4. ❌ **No HTTPS requirement** - Token can be transmitted insecurely
5. ⚠️ **User lookup on every request** - Reads JSON file for each protected endpoint

#### `authorize` Middleware
```javascript
Checks: req.user.role against allowed roles array
Returns: 403 if unauthorized
```

**Issues**:
1. ⚠️ **Simple string matching** - No hierarchical role system (admin > user > guest)
2. ❌ **No permission inheritance** - Admin doesn't automatically get user permissions
3. ⚠️ **Not used consistently** - Some routes use it, others don't

---

## 6️⃣ Utilities - Helper Functions

### [server/utils/mockStorage.js](server/utils/mockStorage.js) - **75 lines**

**Purpose**: In-memory JSON file-based CRUD operations (replacing MongoDB)

**Core Methods**:

| Method | Signature | Usage |
|--------|-----------|-------|
| `find(collection, query)` | `(string, object?) → array` | Get multiple documents |
| `findOne(collection, query)` | `(string, object?) → object\|null` | Get first matching |
| `findById(collection, id)` | `(string, string) → object\|null` | Get by _id or id |
| `create(collection, data)` | `(string, object) → object` | Insert with auto ID |
| `update(collection, id, updates)` | `(string, string, object) → object` | Partial update |
| `delete(collection, id)` | `(string, string) → boolean` | Remove by ID |

**Implementation**:
```javascript
- Reads entire localDb.json file for every operation (sync I/O)
- Writes full database back after any change (expensive)
- Simple filter loop for queries (O(n) complexity)
- Auto-generates ID as: Date.now().toString()
- Stores createdAt timestamp on create
```

**Critical Issues**:
1. 🔴 **SEVERE: Synchronous file I/O** - Every operation blocks entire server
2. 🔴 **SEVERE: No locking** - Concurrent requests can corrupt data
3. 🔴 **SEVERE: Memory inefficient** - Full file loaded for each operation
4. ❌ **No indexing** - Linear scan for every search
5. ❌ **No query optimization** - Complex queries require filtering in JS
6. ❌ **No partial updates** - Full collection rewritten on single update
7. ⚠️ **No backups** - Single point of failure
8. ⚠️ **No transactions** - Multi-step operations can partially fail

**Example Flow**:
```
Request → readDb() [read file] → filter/create → writeDb() [write entire file] → Response
```

---

### [server/utils/rabCalculator.js](server/utils/rabCalculator.js) - **34 lines**

**Purpose**: RAB (Budget) calculation utilities

#### `calculateVolumeFromDimensions(dimensions[])`
```javascript
Input: Array of {length, width, height}
Process: 
  - area = length × width
  - volume = area × height (per dimension)
Returns: {totalArea, totalVolume}
```

#### `calculateTotalRAB(items[], settings{})`
```javascript
Input: 
  items: [{total, ...}]
  settings: {overhead%, profit%, tax%, contingency%}
Returns: Budget breakdown
```

**Issues**:
1. ⚠️ **Assumes item.total exists** - No validation
2. ⚠️ **Settings have defaults** - Used in controller, not enforced here
3. ❌ **No rounding** - Floating point precision issues possible
4. ⚠️ **No negative value checks** - Invalid percentages accepted
5. ⚠️ **No calculation audit** - Results not tagged with timestamp

---

### [server/utils/exportGenerator.js](server/utils/exportGenerator.js) - **48 lines**

**Purpose**: PDF and Excel report generation

#### `generateRABPDF(project, items, summary, financials)`
- Creates PDFDocument instance
- Adds title, project info, table header
- Iterates items with: No | Name | Volume | Unit | Price | Total
- Appends grand total
- Returns piped document

**Issues**:
1. ⚠️ **Very basic formatting** - No header/footer, page breaks, styling
2. ❌ **No error handling** - If item has undefined fields, crashes
3. ⚠️ **Hard-coded spacing** - Fixed layout, not responsive
4. ❌ **No currency formatting** - Numbers dump as-is
5. ⚠️ **Missing financial breakdown** - Only shows items, not overhead/profit/tax

#### `generateRABExcel(project, items, summary, financials)`
- Creates ExcelJS workbook
- Defines columns: No, Name, Volume, Unit, Price, Total
- Adds rows from items array
- Returns workbook (caller streams response)

**Issues**:
1. ⚠️ **No formula-based totals** - Hard-coded values in Excel
2. ❌ **No summary sheet** - Only detail sheet
3. ⚠️ **Basic formatting** - No colors, bold headers, borders
4. ❌ **No financial summary** - Missing overhead/profit/tax/contingency breakdown

---

## 7️⃣ Configuration

### [server/config/db.js](server/config/db.js) - **6 lines**

```javascript
const connectDB = async () => {
  console.log('Skipping MongoDB connection for Local Mode.');
  return false;
};
```

**Status**: ✗ MongoDB connection **DISABLED**

**Issues**:
1. 🔴 **Database layer completely bypassed** - All Mongoose models unused
2. ⚠️ **Misleading code** - Models imported/defined but never used
3. ⚠️ **No migration path** - Switching to MongoDB would require rewrite
4. ⚠️ **Development vs. Production identical** - No environment-based switching

---

### Package Dependencies

```json
{
  "axios": "^1.14.0",           // HTTP client (unused in server)
  "bcryptjs": "^3.0.3",          // Password hashing ✓
  "cors": "^2.8.6",              // CORS middleware ✓
  "dotenv": "^17.3.1",           // Env variables ✓
  "exceljs": "^4.4.0",           // Excel generation ✓
  "express": "^5.2.1",           // Web framework ✓
  "jsonwebtoken": "^9.0.3",      // JWT auth ✓
  "mongoose": "^9.3.3",          // MongoDB (unused, connection disabled)
  "multer": "^2.1.1",            // File uploads ✓
  "pdfkit": "^0.18.0"            // PDF generation ✓
}
```

**Unused/Redundant**:
- ⚠️ `mongoose` - Models defined but connection disabled
- ⚠️ `axios` - Not used in server code

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│            Client (React Frontend)              │
└────────────────────┬────────────────────────────┘
                     │ HTTP/REST
                     ▼
┌─────────────────────────────────────────────────┐
│          Express.js (index.js)                  │
│  ├─ CORS Middleware                             │
│  ├─ JSON Parser                                 │
│  └─ Error Handler                               │
└────────────┬────────────────────────────────────┘
             │
   ┌─────────┴──────────────────────────────┐
   │                                         │
   ▼                                         ▼
┌──────────────┐  ┌─────────────────────────────────┐
│   Routes     │  │   Middleware                    │
│ ├─ /auth     │  │ ├─ protect (JWT validation)    │
│ ├─ /projects │  │ ├─ authorize (role check)      │
│ ├─ /ahsp     │  │ └─ [error handler on index.js] │
│ ├─ /materials│  └─────────────────────────────────┘
│ ├─ /logs     │
│ ├─ /calculate│
│ └─ /export   │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────────────────┐
│          Controllers (Business Logic)           │
│ ├─ auth.js (register, login, getMe)            │
│ ├─ projects.js (CRUD + versions)               │
│ ├─ materials.js (inventory)                    │
│ ├─ ahsp.js (standards)                         │
│ ├─ calculation.js (RAB math)                   │
│ ├─ logs.js (daily logging)                     │
│ └─ export.js (PDF/Excel)                       │
└─────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────┐
│              Utilities Layer                    │
│ ├─ mockStorage.js (CRUD to JSON)              │
│ ├─ rabCalculator.js (math functions)          │
│ └─ exportGenerator.js (PDF/Excel generation)   │
└─────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────┐  ┌──────────────────┐
│  localDb.json        │  │  /uploads/ dir   │
│  (all data stored    │  │ (photos from     │
│   as JSON, single    │  │  daily logs)     │
│   file)              │  │                  │
└──────────────────────┘  └──────────────────┘
```

---

## 🔴 Critical Issues Summary

| Severity | Issue | Location | Impact |
|----------|-------|----------|--------|
| 🔴 CRITICAL | Synchronous file I/O blocks server | mockStorage.js | Performance, crashes under load |
| 🔴 CRITICAL | No data locking/transactions | mockStorage.js | Data corruption with concurrent requests |
| 🔴 CRITICAL | CORS unrestricted | index.js | CSRF attacks possible |
| 🔴 CRITICAL | No input validation | All controllers | Injection attacks, invalid data |
| 🟠 HIGH | Models defined but unused | models/* | Code confusion, maintenance nightmare |
| 🟠 HIGH | JWT secrets in .env | auth.js | Token compromise if env leaked |
| 🟠 HIGH | No rate limiting | All routes | DDoS vulnerability |
| 🟠 HIGH | File upload no sanitization | logs.js | Path traversal attacks |
| 🟡 MEDIUM | No pagination | All GET routes | Memory exhaustion with large datasets |
| 🟡 MEDIUM | Synchronous password hashing | auth.js | Thread blocking in bcrypt |
| 🟡 MEDIUM | No error classification | index.js | Poor debugging/monitoring |

---

## 🟠 Scalability Issues

1. **JSON File I/O**: Each operation requires full file read/write
2. **No Connection Pooling**: Every request reads/writes entire database
3. **No Caching**: Repeated queries hit disk every time
4. **Single-threaded Processing**: Synchronous I/O blocks event loop
5. **No Query Optimization**: Linear scans for all searches
6. **Upload Directory**: Unbounded growth, no cleanup

**Performance Impact at Scale**:
- 10 users: Acceptable (all-in-memory workable)
- 100 users: Noticeable delays (I/O becomes bottleneck)
- 1000 users: System unusable (file locks, thread starvation)
- 10000+ projects: File size causes read timeouts

---

## 🟠 Security Issues

1. **Authentication**:
   - ✓ Bcrypt password hashing
   - ❌ No input validation on registration
   - ❌ No email verification
   - ❌ No 2FA
   - ❌ No session management

2. **Authorization**:
   - ⚠️ Role-based but not hierarchical
   - ❌ No permission matrix
   - ❌ No field-level security

3. **Data Protection**:
   - ❌ No encryption at rest
   - ⚠️ HTTPS not enforced
   - ❌ Sensitive data in JSON file (passwords, tokens)

4. **API Security**:
   - 🔴 CORS unrestricted
   - ❌ No rate limiting
   - ❌ No input validation
   - ❌ No SQL/NoSQL injection protection (mock storage)
   - ❌ No file upload validation

5. **Operational Security**:
   - ❌ No audit logs
   - ❌ No request/response logging
   - ❌ No intrusion detection
   - ❌ Debug enabled in production (stack traces returned)

---

## ✅ Positive Aspects

1. **Modular structure** - Clear separation of concerns (routes, controllers, utils)
2. **Authentication implemented** - JWT + bcrypt in place
3. **Authorization checks** - Role-based access control attempted
4. **Export functionality** - PDF/Excel generation for reports
5. **Multi-version support** - Projects can have multiple versions
6. **Regional pricing** - Materials support location-based prices
7. **Error handling middleware** - Basic error handler present
8. **File upload support** - Multer configured for attachments
9. **Business logic isolated** - rabCalculator.js separates from HTTP layer
10. **RESTful patterns** - Follows HTTP methods correctly (GET, POST, PUT, DELETE)

---

## 📊 Component Dependencies

```
auth.js
  └─ mockStorage (users collection)
  └─ bcryptjs
  └─ jsonwebtoken

projects.js
  └─ mockStorage (projects collection)
  
materials.js
  └─ mockStorage (materials collection)

ahsp.js
  └─ mockStorage (ahsp collection)

calculation.js
  └─ rabCalculator
    └─ (no dependencies)

logs.js
  ├─ mockStorage (logs collection)
  └─ multer (file upload)

export.js
  ├─ exportGenerator
  │  ├─ pdfkit
  │  └─ exceljs
  └─ (no controller dependencies)

middleware/auth.js
  ├─ jsonwebtoken
  └─ mockStorage (users collection)
```

**Circular Dependencies**: None detected

**Unused Imports**: 
- `mongoose` in all model files
- `axios` (not used in server)

---

## 📈 Code Statistics

```
Controllers:    441 lines
Routes:          92 lines
Middleware:      50 lines
Utilities:      157 lines
Config:           6 lines
────────────────────────
TOTAL:          746 lines (excluding models & node_modules)

Distribution:
├─ Business Logic:  60% (controllers + utils)
├─ API Definition:  12% (routes)
├─ Auth/Security:    7% (middleware)
├─ Infrastructure:   1% (config)
```

---

## 🔧 Recommendations for Next Analysis

1. **Database Audit**: Why was MongoDB disabled? What's the migration plan?
2. **Frontend Integration**: How does React frontend use these endpoints?
3. **Production Deployment**: How is this deployed? On what infrastructure?
4. **Data Volume**: Actual data size in localDb.json? Growth projections?
5. **User Load**: Expected concurrent users? Peak traffic patterns?
6. **Compliance**: Are there data privacy/security requirements?
7. **Backup Strategy**: How is data backed up currently?
8. **Monitoring**: What logging/monitoring exists?

---

**Report Generated**: April 2, 2026  
**Backend Framework**: Express.js 5.2.1  
**Database**: JSON File-based Mock Storage  
**Status**: Development/Proof-of-Concept Phase
