import db from './config/database.js';

async function initSettings() {
    try {
        console.log('🔧 Initializing settings table...');

        await db.query(`
            CREATE TABLE IF NOT EXISTS settings (
                id INT PRIMARY KEY AUTO_INCREMENT,
                app_name VARCHAR(255) NOT NULL DEFAULT 'Sistema de Gastos',
                currency_symbol VARCHAR(10) NOT NULL DEFAULT 'Bs.',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB
        `);

        // Insert default if not exists
        await db.query(`
            INSERT INTO settings (id, app_name, currency_symbol) 
            VALUES (1, 'Sistema de Gastos', 'Bs.') 
            ON DUPLICATE KEY UPDATE id=id
        `);

        console.log('✅ Settings table initialized successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error initializing settings:', error);
        process.exit(1);
    }
}

initSettings();
