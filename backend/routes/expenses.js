import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { compressImage, isValidImageType } from '../utils/imageProcessor.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = 'uploads/temp';
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (isValidImageType(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPG and PNG images are allowed'));
        }
    }
});

// Get all expenses (filtered by user role)
router.get('/', authenticateToken, async (req, res) => {
    try {
        let query = `
      SELECT e.*, u.username 
      FROM expenses e 
      JOIN users u ON e.user_id = u.id
    `;
        const params = [];

        // Regular users can only see their own expenses
        if (req.user.role !== 'admin') {
            query += ' WHERE e.user_id = ?';
            params.push(req.user.id);
        }

        query += ' ORDER BY e.expense_date DESC, e.created_at DESC';

        const [expenses] = await db.query(query, params);
        res.json(expenses);
    } catch (error) {
        console.error('Get expenses error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single expense
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const [expenses] = await db.query(
            'SELECT * FROM expenses WHERE id = ?',
            [req.params.id]
        );

        if (expenses.length === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        const expense = expenses[0];

        // Check permissions
        if (req.user.role !== 'admin' && expense.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(expense);
    } catch (error) {
        console.error('Get expense error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

import { body, validationResult } from 'express-validator';

// Validation middleware
const validateExpense = [
    body('product_name').trim().notEmpty().withMessage('Product name is required'),
    body('quantity').isFloat({ min: 0.01 }).withMessage('Quantity must be greater than 0'),
    body('unit_price').isFloat({ min: 0.01 }).withMessage('Unit price must be greater than 0'),
    body('expense_date').isISO8601().withMessage('Valid date is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }
        next();
    }
];

// Create new expense
router.post('/', authenticateToken, upload.single('receipt'), validateExpense, async (req, res) => {
    try {
        const { product_name, quantity, unit_price, expense_date } = req.body;
        const userId = req.user.id;

        // Validation handled by middleware

        const qty = parseFloat(quantity);
        const price = parseFloat(unit_price);
        const total = qty * price;

        let receiptPath = null;

        // Process image if uploaded
        if (req.file) {
            const finalDir = 'uploads/receipts';
            await fs.mkdir(finalDir, { recursive: true });

            const finalPath = path.join(finalDir, req.file.filename);
            await compressImage(req.file.path, finalPath);
            receiptPath = finalPath;

            // Clean up temp file
            try {
                await fs.unlink(req.file.path);
            } catch (err) {
                console.error('Error deleting temp file:', err);
            }
        }

        const [result] = await db.query(
            `INSERT INTO expenses (user_id, product_name, quantity, unit_price, total, receipt_image, expense_date) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, product_name, qty, price, total, receiptPath, expense_date]
        );

        res.status(201).json({
            message: 'Expense created successfully',
            id: result.insertId
        });
    } catch (error) {
        console.error('Create expense error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update expense
router.put('/:id', authenticateToken, upload.single('receipt'), async (req, res) => {
    try {
        const { product_name, quantity, unit_price, expense_date } = req.body;

        // Get existing expense
        const [expenses] = await db.query(
            'SELECT * FROM expenses WHERE id = ?',
            [req.params.id]
        );

        if (expenses.length === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        const expense = expenses[0];

        // Check permissions
        if (req.user.role !== 'admin' && expense.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const qty = parseFloat(quantity);
        const price = parseFloat(unit_price);
        const total = qty * price;

        let receiptPath = expense.receipt_image;

        // Process new image if uploaded
        if (req.file) {
            // Delete old image
            if (expense.receipt_image) {
                try {
                    await fs.unlink(expense.receipt_image);
                } catch (err) {
                    console.error('Error deleting old image:', err);
                }
            }

            const finalDir = 'uploads/receipts';
            await fs.mkdir(finalDir, { recursive: true });

            const finalPath = path.join(finalDir, req.file.filename);
            await compressImage(req.file.path, finalPath);
            receiptPath = finalPath;
        }

        // Update expense
        await db.query(
            `UPDATE expenses 
       SET product_name = ?, quantity = ?, unit_price = ?, total = ?, receipt_image = ?, expense_date = ?
       WHERE id = ?`,
            [product_name, qty, price, total, receiptPath, expense_date, req.params.id]
        );

        res.json({ message: 'Expense updated successfully' });
    } catch (error) {
        console.error('Update expense error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete expense
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const [expenses] = await db.query(
            'SELECT * FROM expenses WHERE id = ?',
            [req.params.id]
        );

        if (expenses.length === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        const expense = expenses[0];

        // Check permissions
        if (req.user.role !== 'admin' && expense.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Delete image file
        if (expense.receipt_image) {
            try {
                await fs.unlink(expense.receipt_image);
            } catch (err) {
                console.error('Error deleting image:', err);
            }
        }

        // Delete expense
        await db.query('DELETE FROM expenses WHERE id = ?', [req.params.id]);

        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Delete expense error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
