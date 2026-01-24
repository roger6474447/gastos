import db from '../config/database.js';

async function updateSchema() {
    try {
        console.log('🔧 Updating database schema...');

        // Create incomes table
        await db.query(`
      CREATE TABLE IF NOT EXISTS incomes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        source VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        income_date DATE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_income_date (income_date)
      ) ENGINE=InnoDB
    `);

        console.log('✅ Database schema updated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating schema:', error);
        process.exit(1);
    }
}

updateSchema();
