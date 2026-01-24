import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import expensesRoutes from './routes/expenses.js';
import reportsRoutes from './routes/reports.js';
import incomesRoutes from './routes/incomes.js';
import usersRoutes from './routes/users.js';
import settingsRoutes from './routes/settings.js';

// ES modules dirname workaround
const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

dotenv.config();

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// ... imports

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/incomes', incomesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/settings', settingsRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints:`);
    console.log(`   - POST /api/auth/login`);
    console.log(`   - POST /api/auth/register`);
    console.log(`   - GET  /api/expenses`);
    console.log(`   - POST /api/expenses`);
    console.log(`   - GET  /api/reports`);
    console.log(`   - GET  /api/incomes`);
    console.log(`   - POST /api/incomes`);
});
