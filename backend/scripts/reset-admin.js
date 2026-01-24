import bcrypt from 'bcrypt';
import db from '../config/database.js';

async function resetAdmin() {
    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await db.query('UPDATE users SET password = ? WHERE username = ?', [hashedPassword, 'admin']);
        console.log('✅ Admin password reset to: admin123');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

resetAdmin();
