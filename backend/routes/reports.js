import express from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get expenses filtered by period
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { period, date } = req.query; // period: 'day', 'month', 'year'; date: YYYY-MM-DD or YYYY-MM or YYYY

        let query = `
      SELECT e.*, u.username 
      FROM expenses e 
      JOIN users u ON e.user_id = u.id
      WHERE 1=1
    `;
        const params = [];

        // Role-based filtering
        if (req.user.role !== 'admin') {
            query += ' AND e.user_id = ?';
            params.push(req.user.id);
        }

        // Date filtering
        if (period && date) {
            switch (period) {
                case 'day':
                    query += ' AND DATE(e.expense_date) = ?';
                    params.push(date);
                    break;
                case 'month':
                    query += ' AND DATE_FORMAT(e.expense_date, "%Y-%m") = ?';
                    params.push(date);
                    break;
                case 'year':
                    query += ' AND YEAR(e.expense_date) = ?';
                    params.push(date);
                    break;
            }
        }

        query += ' ORDER BY e.expense_date DESC, e.created_at DESC';

        const [expenses] = await db.query(query, params);

        // Calculate subtotal
        const subtotal = expenses.reduce((sum, expense) => sum + parseFloat(expense.total), 0);

        res.json({
            expenses,
            subtotal,
            period,
            date,
            count: expenses.length
        });
    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get summary statistics
router.get('/summary', authenticateToken, async (req, res) => {
    try {
        let userCondition = '';
        const params = [];

        if (req.user.role !== 'admin') {
            userCondition = 'WHERE user_id = ?';
            params.push(req.user.id);
        }

        // Today's total
        const [todayResult] = await db.query(
            `SELECT COALESCE(SUM(total), 0) as total 
       FROM expenses 
       ${userCondition ? userCondition + ' AND' : 'WHERE'} DATE(expense_date) = CURDATE()`,
            params
        );

        // This month's total
        const [monthResult] = await db.query(
            `SELECT COALESCE(SUM(total), 0) as total 
       FROM expenses 
       ${userCondition ? userCondition + ' AND' : 'WHERE'} 
       DATE_FORMAT(expense_date, "%Y-%m") = DATE_FORMAT(CURDATE(), "%Y-%m")`,
            params
        );

        // This year's total
        const [yearResult] = await db.query(
            `SELECT COALESCE(SUM(total), 0) as total 
       FROM expenses 
       ${userCondition ? userCondition + ' AND' : 'WHERE'} YEAR(expense_date) = YEAR(CURDATE())`,
            params
        );

        // Total expenses count
        const [countResult] = await db.query(
            `SELECT COUNT(*) as count FROM expenses ${userCondition}`,
            params
        );

        // Total Income
        const [totalIncomeResult] = await db.query(
            `SELECT COALESCE(SUM(amount), 0) as total 
             FROM incomes 
             ${userCondition}`,
            params
        );

        // Total Expenses (All time)
        const [totalExpensesResult] = await db.query(
            `SELECT COALESCE(SUM(total), 0) as total 
             FROM expenses 
             ${userCondition}`,
            params
        );

        res.json({
            today: parseFloat(todayResult[0].total),
            month: parseFloat(monthResult[0].total),
            year: parseFloat(yearResult[0].total),
            totalCount: countResult[0].count,
            totalIncome: parseFloat(totalIncomeResult[0].total),
            totalExpenses: parseFloat(totalExpensesResult[0].total),
            balance: parseFloat(totalIncomeResult[0].total) - parseFloat(totalExpensesResult[0].total)
        });
    } catch (error) {
        console.error('Get summary error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
