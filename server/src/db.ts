import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://admin:yourpassword@localhost:5432/yspm_timetable',
    max: 100,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test connection on startup
pool.query('SELECT NOW()')
    .then(() => {
        console.log('✓ Database connection established');
    })
    .catch((err: Error) => {
        console.error('✗ Database connection failed:', err.message);
        console.error('Please check your .env file and ensure PostgreSQL is running');
    });

export default pool;
