import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

async function tryConnect() {
    const dbUrl = process.env.DATABASE_URL || 'postgresql://admin:yourpassword@localhost:5432/yspm_timetable';
    console.log(`\nTesting connection to: ${dbUrl.replace(/:[^:@]+@/, ':***@')}...`);
    
    const pool = new Pool({ connectionString: dbUrl });
    
    try {
        const result = await pool.query('SELECT NOW()');
        console.log(`SUCCESS: Connected! Server time: ${result.rows[0].now}`);
        await pool.end();
        return true;
    } catch (error: any) {
        console.error(`FAILURE: Could not connect.`);
        console.error('Code:', error.code);
        console.error('Message:', error.message);
        await pool.end();
        return false;
    }
}

async function run() {
    console.log('--- DB Connection Diagnostics (PostgreSQL) ---');
    await tryConnect();
}

run();
