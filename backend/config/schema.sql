-- Create database
CREATE DATABASE IF NOT EXISTS gastos_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gastos_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_username (username)
) ENGINE=InnoDB;

-- Expenses table
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
) ENGINE=InnoDB;

-- Incomes table
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
) ENGINE=InnoDB;

-- Insert default users (passwords are hashed with bcrypt)
-- admin / admin123
-- usuario / user123
INSERT INTO users (username, password, role) VALUES
('admin', '$2b$10$YQj3qF7xGx5vXKZH5qF5qOZJ5qF5qOZJ5qF5qOZJ5qF5qOZJ5qF5q', 'admin'),
('usuario', '$2b$10$XPi2pE6wFw4uVJYG4pE4pNYI4pE4pNYI4pE4pNYI4pE4pNYI4pE4p', 'user')
ON DUPLICATE KEY UPDATE username=username;

-- Note: The hashed passwords above are placeholders
-- They will be properly generated when you run the backend server
-- Default credentials:
-- Admin: admin / admin123
-- User: usuario / user123
