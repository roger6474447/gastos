import express from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all incomes
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const isAdmin = req.user.role === 'admin';

        let query = 'SELECT * FROM incomes';
        const params = [];

        if (!isAdmin) {
            query += ' WHERE user_id = ?';
            params.push(userId);
        }

        query += ' ORDER BY income_date DESC, created_at DESC';

        const [incomes] = await db.query(query, params);
        res.json(incomes);
    } catch (error) {
        console.error('Error fetching incomes:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create new income
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { source, amount, income_date, description } = req.body;
        const userId = req.user.id;

        if (!source || !amount || !income_date) {
            return res.status(400).json({ error: 'Source, amount and date are required' });
        }

        const [result] = await db.query(
            'INSERT INTO incomes (user_id, source, amount, income_date, description) VALUES (?, ?, ?, ?, ?)',
            [userId, source, amount, income_date, description]
        );

        const newIncome = {
            id: result.insertId,
            user_id: userId,
            source,
            amount,
            income_date,
            description,
            created_at: new Date()
        };

        res.status(201).json(newIncome);
    } catch (error) {
        console.error('Error creating income:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete income
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const incomeId = req.params.id;
        const userId = req.user.id;
        const isAdmin = req.user.role === 'admin';

        // Check ownership
        const [incomes] = await db.query('SELECT user_id FROM incomes WHERE id = ?', [incomeId]);

        if (incomes.length === 0) {
            return res.status(404).json({ error: 'Income not found' });
        }

        if (!isAdmin && incomes[0].user_id !== userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await db.query('DELETE FROM incomes WHERE id = ?', [incomeId]);
        res.json({ message: 'Income deleted successfully' });
    } catch (error) {
        console.error('Error deleting income:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single income
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const incomeId = req.params.id;
        const userId = req.user.id;
        const isAdmin = req.user.role === 'admin';

        const [incomes] = await db.query('SELECT * FROM incomes WHERE id = ?', [incomeId]);

        if (incomes.length === 0) {
            return res.status(404).json({ error: 'Income not found' });
        }

        if (!isAdmin && incomes[0].user_id !== userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        res.json(incomes[0]);
    } catch (error) {
        console.error('Error fetching income:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update income
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const incomeId = req.params.id;
        const userId = req.user.id;
        const isAdmin = req.user.role === 'admin';
        const { source, amount, income_date, description } = req.body;

        const [incomes] = await db.query('SELECT user_id FROM incomes WHERE id = ?', [incomeId]);

        if (incomes.length === 0) {
            return res.status(404).json({ error: 'Income not found' });
        }

        if (!isAdmin && incomes[0].user_id !== userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await db.query(
            'UPDATE incomes SET source = ?, amount = ?, income_date = ?, description = ? WHERE id = ?',
            [source, amount, income_date, description, incomeId]
        );

        res.json({ message: 'Income updated successfully' });
    } catch (error) {
        console.error('Error updating income:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
