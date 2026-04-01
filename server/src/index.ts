import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import db from './db';
import bcrypt from 'bcrypt';
import compression from 'compression';
import { logger } from './logger';
import * as validation from './validation';

const app = express();
const PORT = process.env.PORT || 5000;

// Environment validation
const requiredEnvVars = ['DATABASE_URL'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
    logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    logger.error('Please copy .env.example to .env and fill in the required values');
    process.exit(1);
}

// Security Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || ['http://localhost:5173'];
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            logger.warn(`CORS blocked origin: ${origin}`);
            callback(null, false); // Don't throw error - just reject gracefully
        }
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Bypass-Tunnel-Reminder'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Body parsing
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// HTTP Request logging
app.use(logger.getHttpLogger());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3000, // Increased limit to allow polling (was 100)
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // 5 login attempts per 15 minutes
    message: 'Too many login attempts, please try again later.',
});

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Ensure DB Schema
async function initDb() {
    try {
        // Create practical_resources table if not exists
        await db.query(`
            CREATE TABLE IF NOT EXISTS practical_resources (
                id SERIAL PRIMARY KEY,
                batch VARCHAR(50),
                subject VARCHAR(100),
                name VARCHAR(255),
                url TEXT,
                type VARCHAR(20),
                size INT,
                is_link BOOLEAN DEFAULT false,
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                uploaded_by VARCHAR(100),
                category VARCHAR(50) DEFAULT 'General',
                file_data BYTEA
            )
        `);

        // Check/Add category column for legacy support
        try {
            await db.query("ALTER TABLE practical_resources ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'General'");
            console.log("DB Schema Updated: Added category column.");
        } catch (e: any) {
            logger.debug("Column add error (ignored if exists):", e.message);
        }

        // Create users table if not exists
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'teacher'
            )
        `);

        // Create notices table if not exists
        await db.query(`
            CREATE TABLE IF NOT EXISTS notices (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                department_id VARCHAR(50),
                created_by VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT true,
                attachment_path VARCHAR(255),
                attachment_name VARCHAR(255)
            )
        `);

        // Check/Add attachment columns for legacy support
        try {
            await db.query("ALTER TABLE notices ADD COLUMN IF NOT EXISTS attachment_path VARCHAR(255)");
            await db.query("ALTER TABLE notices ADD COLUMN IF NOT EXISTS attachment_name VARCHAR(255)");
            console.log("DB Schema Updated: Added notice attachment columns.");
        } catch (e: any) {
            // Ignore error
        }

        // Check/Add category column to practical_resources
        try {
            await db.query("ALTER TABLE practical_resources ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'General'");
            console.log("DB Schema Updated: Added practical_resources category column.");
        } catch (e: any) {
            // Ignore error
        }

        // Check if admin user exists, if not create one
        const adminResult = await db.query('SELECT * FROM users WHERE email = $1', ['admin@yspm.com']);
        if (adminResult.rows.length === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await db.query('INSERT INTO users (email, password, role) VALUES ($1, $2, $3)', ['admin@yspm.com', hashedPassword, 'admin']);
            logger.info('Default admin user created: admin@yspm.com / admin123');
        }

        // Check if specific demo user exists (for user testing)
        const demoResult = await db.query('SELECT * FROM users WHERE email = $1', ['sagarkhandare@gmail.com']);
        const demoPass = await bcrypt.hash('admin123', 10);

        if (demoResult.rows.length === 0) {
            await db.query('INSERT INTO users (email, password, role) VALUES ($1, $2, $3)', ['sagarkhandare@gmail.com', demoPass, 'teacher']);
            logger.info('Demo user created: sagarkhandare@gmail.com / admin123');
        } else {
            // Force update password to ensure it works for the user
            await db.query('UPDATE users SET password = $1 WHERE email = $2', [demoPass, 'sagarkhandare@gmail.com']);
            logger.info('Demo user password reset to: admin123');
        }

    } catch (e: any) {
        logger.error("DB Init Error:", e);
    }
}
initDb();

// Validation error handler middleware
const handleValidationErrors = (req: Request, res: Response, next: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: 'error',
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

// Multer Config with file type validation
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    fileFilter: (req, file, cb) => {
        // Allowed file types
        const allowedMimes = [
            'application/pdf',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
            'image/gif',
            'text/plain',
        ];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`File type ${file.mimetype} not allowed. Allowed types: PDF, PPT, DOC, images, and text files.`));
        }
    }
});

// ============ RESOURCES API ============

// Get Resources
app.get('/api/resources', validation.resourceQueryValidation, handleValidationErrors, async (req: Request, res: Response) => {
    const { batch, subject } = req.query;
    try {
        let query = 'SELECT id, name, type, size, is_link AS "isLink", uploaded_at AS "uploadedAt", uploaded_by AS "uploadedBy", category, url FROM practical_resources WHERE 1=1';
        const params: any[] = [];
        let paramIndex = 1;

        if (batch) {
            query += ` AND batch = $${paramIndex++}`;
            params.push(batch);
        }
        if (subject) {
            query += ` AND subject = $${paramIndex++}`;
            params.push(subject);
        }

        query += ' ORDER BY uploaded_at DESC';

        const result = await db.query(query, params);

        // Transform rows to include correct download URL for files
        const files = result.rows.map((file: any) => ({
            ...file,
            isLink: !!file.isLink, // Force boolean
            url: file.isLink ? file.url : `/api/files/${file.id}`
        }));

        // DEBUG: Print first file to check structure
        if (files.length > 0) {
            console.log("Debug Resources Response (All Links Count):", files.filter((f: any) => f.isLink).length);
        }

        res.json(files);
    } catch (error) {
        logger.error("Get Resources Error:", error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch resources' });
    }
});

// Upload File
app.post('/api/upload', upload.array('files[]'), validation.uploadValidation, handleValidationErrors, async (req: Request, res: Response) => {
    const { batch, subject, uploadedBy, category } = req.body;
    const files = req.files as Express.Multer.File[];

    // 1. Strict Input Validation
    if (!batch || !subject) {
        res.status(400).json({ status: 'error', message: 'Missing required metadata: Batch and Subject are mandatory.' });
        return;
    }

    if (!files || files.length === 0) {
        res.status(400).json({ status: 'error', message: 'No files uploaded' });
        return;
    }

    const client = await db.connect();
    try {
        // 2. Start Transaction
        await client.query('BEGIN');

        for (const file of files) {
            const fileExt = path.extname(file.originalname).replace('.', '').toLowerCase();
            await client.query(
                "INSERT INTO practical_resources (batch, subject, name, url, uploaded_by, type, size, is_link, file_data, category) VALUES ($1, $2, $3, '', $4, $5, $6, false, $7, $8)",
                [batch, subject, file.originalname, uploadedBy, fileExt, file.size, file.buffer, category || 'General']
            );
        }

        // 3. Commit Transaction (All or Nothing)
        await client.query('COMMIT');
        res.json({ status: 'success' });

    } catch (error: any) {
        // 4. Rollback on Error
        await client.query('ROLLBACK');

        logger.error("Upload Transaction Failed:", error);
        res.status(500).json({ status: 'error', message: 'Failed to upload files. Please try again.' });
    } finally {
        // 5. Release Connection
        client.release();
    }
});

// Add Link
app.post('/api/links', validation.linkValidation, handleValidationErrors, async (req: Request, res: Response) => {
    const { batch, subject, name, url, uploadedBy, category } = req.body;

    try {
        await db.query(
            "INSERT INTO practical_resources (batch, subject, name, url, uploaded_by, type, size, is_link, category) VALUES ($1, $2, $3, $4, $5, 'link', 0, true, $6)",
            [batch, subject, name, url, uploadedBy, category || 'General']
        );
        res.json({ status: 'success' });
    } catch (error) {
        logger.error("Add Link Error:", error);
        res.status(500).json({ status: 'error', message: 'Failed to add link' });
    }
});

// Delete Resource
app.delete('/api/resources/:id', validation.idParamValidation, handleValidationErrors, async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM practical_resources WHERE id = $1', [id]);
        res.json({ status: 'success' });
    } catch (error) {
        logger.error("Delete Resource Error:", error);
        res.status(500).json({ status: 'error', message: 'Failed to delete resource' });
    }
});

// ============ NOTICE BOARD API ENDPOINTS ============

// Get Notices (Public - all users can view)
app.get('/api/notices', validation.noticeQueryValidation, handleValidationErrors, async (req: Request, res: Response) => {
    const departmentId = req.query.department_id as string;

    try {
        let query = 'SELECT * FROM notices WHERE is_active = true';
        const params: any[] = [];
        let paramIndex = 1;

        if (departmentId) {
            query += ` AND (department_id = $${paramIndex++} OR department_id IS NULL)`;
            params.push(departmentId);
        }

        query += ' ORDER BY created_at DESC';

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (error) {
        logger.error("Get Notices Error:", error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch notices' });
    }
});

// Create Notice (Faculty/Admin only)
app.post('/api/notices', upload.single('attachment'), validation.noticeValidation, handleValidationErrors, async (req: Request, res: Response) => {
    logger.debug("POST /api/notices Hit");
    logger.debug("Req Body:", req.body);
    logger.debug("Req File:", req.file ? req.file.originalname : 'none');

    const { title, content, department_id, created_by } = req.body;
    const file = req.file;

    if (!title) {
        logger.warn("Missing title in notice creation");
        res.status(400).json({ status: 'error', message: 'Title required' });
        return;
    }

    let attachmentPath = null;
    let attachmentName = null;

    if (file) {
        try {
            const fileExt = path.extname(file.originalname).replace('.', '').toLowerCase();
            const result = await db.query(
                "INSERT INTO practical_resources (batch, subject, name, url, uploaded_by, type, size, is_link, file_data, category) VALUES ($1, $2, $3, '', $4, $5, $6, false, $7, $8) RETURNING id",
                ['NoticeAttachment', 'Notice', file.originalname, created_by || 'Faculty', fileExt, file.size, file.buffer, 'Notice']
            );
            const newId = result.rows[0].id;
            attachmentPath = `/api/files/${newId}`;
            attachmentName = file.originalname;

        } catch (err) {
            logger.error("Error saving attachment:", err);
        }
    }

    try {
        const result = await db.query(
            'INSERT INTO notices (title, content, department_id, created_by, attachment_path, attachment_name) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [title, content || '', department_id || null, created_by || 'Faculty', attachmentPath, attachmentName]
        );
        res.json({ status: 'success', id: result.rows[0].id });
    } catch (error) {
        logger.error("Create Notice Error:", error);
        res.status(500).json({ status: 'error', message: 'Failed to create notice' });
    }
});

// Update Notice (Faculty/Admin only)
app.put('/api/notices/:id', validation.noticeUpdateValidation, handleValidationErrors, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, content, is_active } = req.body;

    if (!title) {
        res.status(400).json({ status: 'error', message: 'Title required' });
        return;
    }

    try {
        await db.query(
            'UPDATE notices SET title = $1, content = $2, is_active = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4',
            [title, content || '', is_active !== undefined ? is_active : true, id]
        );
        res.json({ status: 'success' });
    } catch (error) {
        logger.error("Update Notice Error:", error);
        res.status(500).json({ status: 'error', message: 'Failed to update notice' });
    }
});

// Login Endpoint
app.post('/api/login', authLimiter, validation.loginValidation, handleValidationErrors, async (req: Request, res: Response) => {
    const { email, password } = req.body;
    logger.info(`[LOGIN ATTEMPT] Email: ${email}`);

    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const users = result.rows;

        if (users.length === 0) {
            res.status(401).json({ status: 'error', message: 'Invalid credentials' });
            return;
        }

        const user = users[0];
        const match = await bcrypt.compare(password, user.password);

        if (match) {
            res.json({
                status: 'success',
                user: { id: user.id, email: user.email, role: user.role }
            });
        } else {
            res.status(401).json({ status: 'error', message: 'Invalid credentials' });
        }
    } catch (error) {
        logger.error("Login Error:", error);
        res.status(500).json({ status: 'error', message: 'Login failed. Please try again.' });
    }
});

// Delete Notice (Faculty/Admin only)
app.delete('/api/notices/:id', validation.idParamValidation, handleValidationErrors, async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await db.query('DELETE FROM notices WHERE id = $1', [id]);
        res.json({ status: 'success' });
    } catch (error) {
        logger.error("Delete Notice Error:", error);
        res.status(500).json({ status: 'error', message: 'Failed to delete notice' });
    }
});

// Create User (Admin only technically, but open for now for simplicity)
app.post('/api/users', validation.userCreateValidation, handleValidationErrors, async (req: Request, res: Response) => {
    const { email, password, role } = req.body;

    if (!email || !password) {
        res.status(400).json({ status: 'error', message: 'Email and password required' });
        return;
    }

    try {
        // Check if user exists
        const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            res.status(400).json({ status: 'error', message: 'User already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
            'INSERT INTO users (email, password, role) VALUES ($1, $2, $3)',
            [email, hashedPassword, role || 'teacher']
        );

        res.json({ status: 'success' });
    } catch (error: any) {
        logger.error("Create User Error:", error);
        if (error.code === '23505') { // PostgreSQL unique violation
            res.status(400).json({ status: 'error', message: 'User already exists' });
        } else {
            res.status(500).json({ status: 'error', message: 'Failed to create user' });
        }
    }
});

// Get all users (Admin only)
app.get('/api/users', async (req: Request, res: Response) => {
    try {
        const result = await db.query('SELECT id, email, role FROM users ORDER BY id DESC');
        res.json(result.rows);
    } catch (error) {
        logger.error("Get Users Error:", error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch users' });
    }
});

// Delete User (Admin only)
app.delete('/api/users/:id', validation.idParamValidation, handleValidationErrors, async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ status: 'success' });
    } catch (error) {
        logger.error("Delete User Error:", error);
        res.status(500).json({ status: 'error', message: 'Failed to delete user' });
    }
});

// Update User (Admin only - for password reset)
app.put('/api/users/:id', validation.userUpdateValidation, handleValidationErrors, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
        res.status(400).json({ status: 'error', message: 'Password required' });
        return;
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, id]);
        res.json({ status: 'success' });
    } catch (error) {
        logger.error("Update User Error:", error);
        res.status(500).json({ status: 'error', message: 'Failed to update user' });
    }
});

// ============ NEWS TICKER API ============

// Initialize News Table
async function initNewsDb() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS news_ticker (
                id SERIAL PRIMARY KEY,
                content TEXT NOT NULL,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100)
            )
        `);
        logger.info("News Ticker Table Checked/Created");
    } catch (e) {
        logger.error("News Table Init Error:", e);
    }
}
initNewsDb();

// Get News
app.get('/api/news', async (req: Request, res: Response) => {
    try {
        const result = await db.query('SELECT * FROM news_ticker WHERE is_active = true ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        logger.error("Get News Error:", error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch news' });
    }
});

// Add News (Faculty Only)
app.post('/api/news', validation.newsValidation, handleValidationErrors, async (req: Request, res: Response) => {
    const { content, createdBy } = req.body;
    if (!content) return res.status(400).json({ status: 'error', message: 'Content required' });

    try {
        const result = await db.query(
            'INSERT INTO news_ticker (content, is_active, created_by) VALUES ($1, true, $2) RETURNING id',
            [content, createdBy || 'Faculty']
        );
        res.json({ status: 'success', id: result.rows[0].id });
    } catch (error) {
        logger.error("Add News Error:", error);
        res.status(500).json({ status: 'error', message: 'Failed to add news' });
    }
});

// Delete News
app.delete('/api/news/:id', validation.idParamValidation, handleValidationErrors, async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM news_ticker WHERE id = $1', [id]);
        res.json({ status: 'success' });
    } catch (error) {
        logger.error("Delete News Error:", error);
        res.status(500).json({ status: 'error', message: 'Failed to delete news' });
    }
});

// ============ END NOTICE BOARD API ============

// Serve File
app.get('/api/files/:id', validation.idParamValidation, handleValidationErrors, async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT name, type, file_data FROM practical_resources WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            res.status(404).send('File not found');
            return;
        }

        const file = result.rows[0];

        // Determine Content Type
        let contentType = 'application/octet-stream';
        if (file.type === 'pdf') contentType = 'application/pdf';

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `inline; filename="${file.name}"`);
        res.send(file.file_data);

    } catch (error) {
        logger.error("Serve File Error:", error);
        res.status(500).send('Error serving file');
    }
});

// Health Check Endpoint
app.get('/api/health', async (req: Request, res: Response) => {
    try {
        await db.query('SELECT 1');
        res.json({
            status: 'ok',
            db: 'connected',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    } catch (error) {
        logger.error("Health Check Failed:", error);
        res.status(500).json({ status: 'error', db: 'disconnected' });
    }
});

// Serve static files from the React app (dist folder)
const distPath = path.join(__dirname, '../../dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));

    // Handle React routing - return index.html for all non-API routes
    app.get('*', (req: Request, res: Response) => {
        // Don't interfere with API routes
        if (req.path.startsWith('/api')) {
            return res.status(404).json({ status: 'error', message: 'API endpoint not found' });
        }
        res.sendFile(path.join(distPath, 'index.html'));
    });
} else {
    logger.warn(`Dist folder not found at ${distPath}. Frontend will not be served.`);
}

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: any) => {
    logger.error("Unhandled Server Error:", err);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
});

const server = app.listen(PORT, () => {
    logger.info(`✓ Server running on http://localhost:${PORT}`);
    logger.info(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`✓ CORS allowed origins: ${allowedOrigins.join(', ')}`);
});

// Graceful Shutdown
const shutdown = async () => {
    logger.info('Stopping server...');
    server.close(() => {
        logger.info('HTTP server closed');
        db.end(); // Close DB pool
        logger.info('Database connection closed');
        process.exit(0);
    });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
