import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const config = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'yspm_timetable',
};

const passwords = ['', 'root', 'admin', 'password', '123456', 'admin123'];

async function testConnection() {
    for (const password of passwords) {
        console.log(`Testing with password: "${password}"`);
        const currentConfig = { ...config, password };
        try {
            const connection = await mysql.createConnection(currentConfig);
            console.log(`SUCCESS! Connected with password: "${password}"`);
            await connection.end();
            process.exit(0);
        } catch (error: any) {
            console.log(`Failed with password "${password}": ${error.code}`);
        }
    }
    console.error('All passwords failed.');
    process.exit(1);
}

testConnection();
