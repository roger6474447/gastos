import bcrypt from 'bcrypt';
import db from './config/database.js';

async function initializeDatabase() {
  try {
    console.log('🔧 Initializing database...');

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    // Create users table if not exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_username (username)
      ) ENGINE=InnoDB
    `);

    // Create expenses table if not exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        quantity DECIMAL(10,2) NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        receipt_image VARCHAR(255),
        expense_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_expense_date (expense_date),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB
    `);

    // Create incomes table if not exists
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

    // Insert default users
    await db.query(`
      INSERT INTO users (username, password, role) 
      VALUES (?, ?, 'admin')
      ON DUPLICATE KEY UPDATE username=username
    `, ['admin', adminPassword]);

    await db.query(`
      INSERT INTO users (username, password, role) 
      VALUES (?, ?, 'user')
      ON DUPLICATE KEY UPDATE username=username
    `, ['usuario', userPassword]);

    console.log('✅ Database initialized successfully!');
    console.log('📝 Default users created:');
    console.log('   Admin: admin / admin123');
    console.log('   User: usuario / user123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase();
