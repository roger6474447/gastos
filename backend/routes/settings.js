import express from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get settings
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM settings WHERE id = 1');
        if (rows.length === 0) {
            // Should not happen if init-settings ran, but fail safe
            return res.json({ app_name: 'Sistema de Gastos', currency_symbol: 'Bs.' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update settings (Admin only)
router.put('/', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const { app_name, currency_symbol } = req.body;

        await db.query(
            'UPDATE settings SET app_name = ?, currency_symbol = ? WHERE id = 1',
            [app_name, currency_symbol]
        );

        res.json({ message: 'Settings updated successfully', settings: { app_name, currency_symbol } });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
