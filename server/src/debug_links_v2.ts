
import db from './db';

async function debug() {
    try {
        const [rows]: any = await db.query('SELECT * FROM practical_resources ORDER BY id DESC LIMIT 10');
        console.log("=== DB DUMP (RECENT 10) ===");
        rows.forEach((r: any) => {
            console.log(`ID: ${r.id} | Name: "${r.name}" | Cat: ${r.category} | isLink: ${r.is_link} | Batch: ${r.batch} | Sub: ${r.subject}`);
            console.log(`   URL: ${r.url}`);
        });
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
debug();
