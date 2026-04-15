const express = require('express');
const db = require('../config/db');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();
router.use(isAuthenticated);

// INSERT - Add new department
router.post('/', async (req, res) => {
  try {
    const { DepartmentCode, DepartmentName, GrossSalary } = req.body;
    
    if (!DepartmentCode || !DepartmentName || GrossSalary === undefined) {
      return res.status(400).json({ error: 'DepartmentCode, DepartmentName, and GrossSalary are required' });
    }

    await db.query(
      'INSERT INTO Department (DepartmentCode, DepartmentName, GrossSalary) VALUES (?, ?, ?)',
      [DepartmentCode, DepartmentName, GrossSalary]
    );

    res.status(201).json({ success: true, message: 'Department added successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Department code already exists' });
    }
    console.error('Add department error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Retrieve all departments
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Department ORDER BY DepartmentCode');
    res.json(rows);
  } catch (err) {
    console.error('Get departments error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
