import bcrypt from 'bcrypt';

async function generateHash() {
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);
    console.log('Bcrypt hash for "admin123":');
    console.log(hash);

    // Test the hash
    const match = await bcrypt.compare('admin123', hash);
    console.log('Hash verification:', match);
}

generateHash();
