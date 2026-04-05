# 🔧 QUICK FIXES - CRITICAL ISSUES

Mari kita implement quick fixes untuk mengatasi critical issues sebelum migration ke database yang proper.

---

## 1. ✅ FIX CORS RESTRICTION

**File:** `server/index.js`

**Replace:**
```javascript
app.use(cors());
```

**With:**
```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',        // Local development
    'http://127.0.0.1:5173',
    'https://sivilize-hub-pro.vercel.app'  // Production
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## 2. ✅ ADD RATE LIMITING

**Install:**
```bash
npm install express-rate-limit
```

**File:** `server/index.js` (add after cors)

```javascript
const rateLimit = require('express-rate-limit');

// General rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Terlalu banyak request dari IP ini, coba lagi nanti.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 minutes
  message: 'Terlalu banyak percobaan login, coba lagi nanti.',
  skipSuccessfulRequests: true,
});

app.use(limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
```

---

## 3. ✅ SECURE FILE UPLOAD

**Install:**
```bash
npm install express-validator
```

**File:** `server/controllers/logs.js`

```javascript
const { body, validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');
const mockStorage = require('../utils/mockStorage');
const multer = require('multer');

// Allowed file types for photos
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg'
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per file
const MAX_FILES = 5;

// Multer storage with sanitization
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Sanitize filename - remove path traversal attempts
    const sanitized = path.basename(file.originalname)
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/\.\./g, '');
    
    // Add timestamp + random to prevent collisions
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${sanitized}`;
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype) && file.size <= MAX_FILE_SIZE) {
    cb(null, true);
  } else if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(new Error('Hanya file gambar (JPEG, PNG, WebP) yang diizinkan'));
  } else {
    cb(new Error(`Ukuran file maksimal ${MAX_FILE_SIZE / 1024 / 1024}MB`));
  }
};

exports.upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES
  }
});

// Validation middleware
exports.validateCreateLog = [
  body('project')
    .trim()
    .notEmpty().withMessage('Project ID diperlukan'),
  body('date')
    .isISO8601().withMessage('Format tanggal tidak valid'),
  body('description')
    .trim()
    .notEmpty().withMessage('Deskripsi diperlukan')
    .isLength({ max: 5000 }).withMessage('Deskripsi maksimal 5000 karakter'),
  body('workItems')
    .isArray().withMessage('Work items harus berupa array')
    .notEmpty().withMessage('Minimal 1 item kerja')
];

// @desc    Create new log with validation
// @route   POST /api/logs
// @access  Private
exports.createLog = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    req.body.user = req.user._id;

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      req.body.photos = req.files.map(file => `/uploads/${file.filename}`);
    }

    const log = mockStorage.create('logs', req.body);

    res.status(201).json({
      success: true,
      data: log,
    });
  } catch (err) {
    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Failed to delete file:', file.path);
        });
      });
    }
    next(err);
  }
};
```

**File:** `server/routes/logs.js` (update)

```javascript
const express = require('express');
const {
  getLogs,
  createLog,
  upload,
  validateCreateLog
} = require('../controllers/logs');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/:projectId')
  .get(getLogs);

// Added validation middleware
router.route('/')
  .post(
    upload.array('photos', 5),
    validateCreateLog,
    createLog
  );

module.exports = router;
```

---

## 4. ✅ ADD INPUT VALIDATION TO ALL ENDPOINTS

**Install:**
```bash
npm install joi
```

**File:** `server/validators/projectValidator.js` (new file)

```javascript
const joi = require('joi');

const projectSchema = joi.object({
  name: joi.string()
    .trim()
    .required()
    .min(3)
    .max(100)
    .messages({
      'string.empty': 'Nama project diperlukan',
      'string.min': 'Nama minimal 3 karakter',
      'string.max': 'Nama maksimal 100 karakter'
    }),
  
  description: joi.string()
    .trim()
    .max(2000)
    .allow('')
    .messages({
      'string.max': 'Deskripsi maksimal 2000 karakter'
    }),
  
  location: joi.string()
    .trim()
    .max(200)
    .allow('')
    .messages({
      'string.max': 'Lokasi maksimal 200 karakter'
    }),
  
  type: joi.string()
    .trim()
    .valid('residensial', 'komersial', 'industri', 'infrastruktur')
    .messages({
      'any.only': 'Tipe project tidak valid'
    }),
  
  status: joi.string()
    .trim()
    .valid('planning', 'in_progress', 'completed', 'on_hold')
    .messages({
      'any.only': 'Status tidak valid'
    }),
  
  startDate: joi.date()
    .required()
    .messages({
      'date.base': 'Format tanggal mulai tidak valid',
      'any.required': 'Tanggal mulai diperlukan'
    }),
  
  endDate: joi.date()
    .min(joi.ref('startDate'))
    .required()
    .messages({
      'date.base': 'Format tanggal selesai tidak valid',
      'date.min': 'Tanggal selesai harus setelah tanggal mulai',
      'any.required': 'Tanggal selesai diperlukan'
    }),
  
  budget: joi.number()
    .positive()
    .required()
    .messages({
      'number.base': 'Budget harus berupa angka',
      'number.positive': 'Budget harus lebih dari 0',
      'any.required': 'Budget diperlukan'
    }),
  
  manpower: joi.number()
    .positive()
    .allow(0)
    .messages({
      'number.base': 'Jumlah manpower harus berupa angka',
      'number.positive': 'Jumlah manpower harus 0 atau lebih'
    })
});

const validateProject = (data) => {
  return projectSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
};

module.exports = { validateProject };
```

**File:** `server/controllers/projects.js` (update create method)

```javascript
const { validateProject } = require('../validators/projectValidator');

exports.createProject = async (req, res, next) => {
  try {
    // Validate input
    const { error, value: validatedData } = validateProject(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validasi data gagal',
        errors: error.details.map(e => ({ field: e.path[0], message: e.message }))
      });
    }

    validatedData.user = req.user._id;
    const project = mockStorage.create('projects', validatedData);

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (err) {
    next(err);
  }
};
```

---

## 5. ✅ ADD PAGINATION

**File:** `server/controllers/projects.js`

```javascript
exports.getProjects = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    let allProjects;
    if (req.user.role === 'admin') {
      allProjects = mockStorage.find('projects');
    } else {
      allProjects = mockStorage.find('projects', { user: req.user._id });
    }

    // Pagination
    const total = allProjects.length;
    const projects = allProjects.slice(skip, skip + limit);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: projects,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages
      }
    });
  } catch (err) {
    next(err);
  }
};
```

---

## 6. ✅ BETTER ERROR HANDLING MIDDLEWARE

**File:** `server/middleware/errorHandler.js` (new)

```javascript
const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  const statusCode = err.statusCode || 500;
  const isDev = process.env.NODE_ENV === 'development';

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Terjadi kesalahan pada server',
    ...(isDev && { stack: err.stack, error: err })
  });
};

module.exports = errorHandler;
```

**File:** `server/index.js` (add before listen)

```javascript
const errorHandler = require('./middleware/errorHandler');

// ... other middleware ...

// Error handling middleware (harus paling akhir!)
app.use(errorHandler);
```

---

## 7. ✅ ASYNC FILE OPERATIONS (Temporary Fix Until Migration)

**File:** `server/utils/mockStorage.js` (replace with async version)

```javascript
const fs = require('fs').promises;
const path = require('path');

const DB_FILE = path.join(__dirname, '../localDb.json');

const initialData = {
  users: [],
  projects: [],
  ahsp: [],
  materials: [],
  logs: []
};

// Initialize DB file if not exists
const initDb = async () => {
  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.writeFile(DB_FILE, JSON.stringify(initialData, null, 2));
  }
};

initDb();

const readDb = async () => {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading DB:', err);
    return initialData;
  }
};

const writeDb = async (data) => {
  try {
    await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing DB:', err);
    throw new Error('Database write failed');
  }
};

const mockStorage = {
  find: async (collection, query = {}) => {
    const db = await readDb();
    const items = db[collection] || [];
    return items.filter(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  },

  findOne: async (collection, query = {}) => {
    const items = await mockStorage.find(collection, query);
    return items.length > 0 ? items[0] : null;
  },

  findById: async (collection, id) => {
    const db = await readDb();
    const items = db[collection] || [];
    return items.find(item => item._id === id || item.id === id) || null;
  },

  create: async (collection, data) => {
    const db = await readDb();
    if (!db[collection]) db[collection] = [];
    
    const newItem = {
      _id: Date.now().toString(),
      ...data,
      createdAt: new Date()
    };
    
    db[collection].push(newItem);
    await writeDb(db);
    return newItem;
  },

  update: async (collection, id, updates) => {
    const db = await readDb();
    const index = db[collection].findIndex(item => item._id === id || item.id === id);
    if (index !== -1) {
      db[collection][index] = { ...db[collection][index], ...updates };
      await writeDb(db);
      return db[collection][index];
    }
    return null;
  },

  delete: async (collection, id) => {
    const db = await readDb();
    const existed = db[collection].some(item => item._id === id || item.id === id);
    if (existed) {
      db[collection] = db[collection].filter(item => item._id !== id && item.id !== id);
      await writeDb(db);
      return true;
    }
    return false;
  }
};

module.exports = mockStorage;
```

**⚠️ WARNING:** This adds complexity - all controller calls need to be `await`. Better solution is to migrate to MongoDB immediately.

---

## 8. ✅ ADD INPUT SANITIZATION

**Install:**
```bash
npm install xss
```

**File:** `server/utils/sanitizer.js` (new)

```javascript
const xss = require('xss');

const sanitizeString = (str) => {
  if (!str) return '';
  return xss(str.toString().trim());
};

const sanitizeObject = (obj) => {
  if (!obj) return {};
  
  const sanitized = {};
  for (let key in obj) {
    if (typeof obj[key] === 'string') {
      sanitized[key] = sanitizeString(obj[key]);
    } else if (Array.isArray(obj[key])) {
      sanitized[key] = obj[key].map(item =>
        typeof item === 'string' ? sanitizeString(item) : item
      );
    } else {
      sanitized[key] = obj[key];
    }
  }
  return sanitized;
};

module.exports = { sanitizeString, sanitizeObject };
```

---

## 🚀 IMPLEMENTATION CHECKLIST

- [ ] Fix CORS (5 minutes)
- [ ] Add Rate Limiting (10 minutes)
- [ ] Secure File Upload (30 minutes)
- [ ] Add Input Validation (1 hour)
- [ ] Add Pagination (30 minutes)
- [ ] Better Error Handling (15 minutes)
- [ ] Add Sanitization (20 minutes)

**Total Time:** ~2.5 hours

---

## 📋 AFTER IMPLEMENTING THESE FIXES

✅ CORS attacks prevented  
✅ DDoS protection added  
✅ File upload exploits blocked  
✅ Invalid data prevented  
✅ Memory exhaustion prevented  
✅ XSS attacks prevented  
✅ Better error tracking  

However:
⚠️ Still susceptible to data corruption race conditions  
⚠️ Still blocking on file I/O  
⚠️ Still not scalable to 1000+ concurrent users  

**Next:** Migrate to MongoDB for true production readiness.

---

**Priority:** IMPLEMENT ALL 8 FIXES BEFORE GOING TO PRODUCTION
