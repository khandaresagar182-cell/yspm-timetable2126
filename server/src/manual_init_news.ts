
import db from './db';

async function initNews() {
    try {
        console.log("Creating/Checking news_ticker table...");
        await db.query(`
            CREATE TABLE IF NOT EXISTS news_ticker (
                id SERIAL PRIMARY KEY,
                content TEXT NOT NULL,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100)
            )
        `);
        console.log("Success: news_ticker table ready.");

        // Verify table exists
        const result = await db.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'news_ticker'");
        console.log("Verification:", result.rows);

        process.exit(0);
    } catch (e) {
        console.error("Error creating table:", e);
        process.exit(1);
    }
}

initNews();
