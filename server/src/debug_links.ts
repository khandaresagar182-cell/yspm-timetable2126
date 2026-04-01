
import db from './db';

async function checkResources() {
    try {
        const result = await db.query('SELECT id, batch, subject, name, is_link, category, url FROM practical_resources ORDER BY id DESC LIMIT 10');
        console.log(JSON.stringify(result.rows, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkResources();
