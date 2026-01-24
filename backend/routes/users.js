import express from 'express';
import bcrypt from 'bcrypt';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Require Admin Role' });
    }
    next();
};

// Get all users
router.get('/', authenticateToken, isAdmin, async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, username, role, created_at FROM users ORDER BY created_at DESC');
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update user
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { username, role, password } = req.body;
        const userId = req.params.id;

        // Validation
        if (!username || !role) {
            return res.status(400).json({ error: 'Username and role are required' });
        }

        // Check if user exists
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check unique username if changed
        if (username !== users[0].username) {
            const [existing] = await db.query('SELECT id FROM users WHERE username = ? AND id != ?', [username, userId]);
            if (existing.length > 0) {
                return res.status(400).json({ error: 'Username already taken' });
            }
        }

        let query = 'UPDATE users SET username = ?, role = ?';
        let params = [username, role];

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            query += ', password = ?';
            params.push(hashedPassword);
        }

        query += ' WHERE id = ?';
        params.push(userId);

        await db.query(query, params);
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete user
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const userId = req.params.id;

        // Prevent self-deletion
        if (parseInt(userId) === req.user.id) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        const [result] = await db.query('DELETE FROM users WHERE id = ?', [userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
