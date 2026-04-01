
import db from './db';
import fs from 'fs';

async function debug() {
    try {
        const [rows]: any = await db.query('SELECT id, batch, subject, name, is_link, category, url FROM practical_resources ORDER BY id DESC LIMIT 20');
        let output = "=== DB DUMP ===\n";
        rows.forEach((r: any) => {
            output += `ID: ${r.id} | Name: "${r.name}" | Cat: ${r.category} | isLink: ${r.is_link} | Batch: ${r.batch} | Sub: ${r.subject}\n`;
            output += `   URL: ${r.url}\n`;
        });
        fs.writeFileSync('debug_output.txt', output);
        console.log("Debug output written to debug_output.txt");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
debug();
