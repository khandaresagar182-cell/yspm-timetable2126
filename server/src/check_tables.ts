
import db from './db';

async function checkTables() {
    try {
        const result = await db.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
        console.log("Tables in DB:", result.rows);
        process.exit(0);
    } catch (e) {
        console.error("Error checking tables:", e);
        process.exit(1);
    }
}

checkTables();
